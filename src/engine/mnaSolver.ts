/**
 * Modified Nodal Analysis (MNA) circuit solver.
 *
 * Replaces the old Gauss–Seidel relaxation with a real matrix solve:
 *  - Node-voltage unknowns + branch-current unknowns for ideal voltage sources.
 *  - Resistors / wires / closed switches → conductance stamps (wires & closed
 *    switches use a very small resistance so per-wire current stays well-defined).
 *  - Batteries → ideal voltage-source branches.
 *  - LEDs → Shockley diode, transistors → Ebers–Moll NPN BJT, solved by
 *    Newton–Raphson with pn-junction voltage limiting for convergence.
 *  - Capacitors → backward-Euler companion model (transient charge/discharge).
 *  - GMIN shunt to ground keeps floating sub-circuits non-singular.
 */

import { CircuitNode, AbstractComponent } from './Physics';
import { TYPES } from '../config/gameConfig';
import { solveLinear } from './linAlg';

const VT = 0.025852; // thermal voltage @ ~300K
const GMIN = 1e-9; // shunt conductance from every node to ground
const G_WIRE = 1e3; // wire / closed switch conductance (≈ 1 mΩ)

// LED (Shockley diode + series resistance RS). RS models the real-world current
// limiting that keeps an LED from drawing unbounded current off a low-impedance
// source — so a 9V supply lights it (~30 mA) but cranking the voltage burns it.
const LED_IS = 1e-17;
const LED_N = 2;
const LED_VT = LED_N * VT;
const LED_RS = 220; // series resistance (ohms)
const LED_ON_CURRENT = 1e-3; // lit threshold
const LED_BURN_CURRENT = 0.04; // 40 mA burn threshold
const V_CLAMP = 1e4; // hard clamp on node voltages for numerical robustness

// NPN BJT (Ebers–Moll)
const BJT_IS = 1e-14;
const BJT_BF = 100; // forward beta
const BJT_BR = 1; // reverse beta

const NR_MAX_ITER = 200;
const NR_TOL = 1e-6;
const NR_MAX_STEP = 2; // max node-voltage change per Newton iteration (damping for stiff junctions)

const safeExp = (x: number) => Math.exp(Math.min(x, 100));

/** pn-junction voltage limiting (SPICE `pnjlim`) to keep Newton–Raphson stable. */
function pnjLim(vnew: number, vold: number, vt: number, vcrit: number): number {
    if (vnew > vcrit && Math.abs(vnew - vold) > 2 * vt) {
        if (vold > 0) {
            const arg = 1 + (vnew - vold) / vt;
            return arg > 0 ? vold + vt * Math.log(arg) : vcrit;
        }
        return vnew > 0 ? vt * Math.log(vnew / vt) : vnew;
    }
    return vnew;
}

const BJT_VCRIT = VT * Math.log(VT / (Math.SQRT2 * BJT_IS));

/**
 * Solve a diode-with-series-resistance for the terminal voltage `vTerm`:
 *   vTerm = vj + RS·I(vj),   I(vj) = Is·(exp(vj/vt) − 1)
 * via a damped local Newton iteration. Returns the terminal current `I`, the
 * Norton-equivalent terminal conductance `Geq`, and the junction voltage `vj`.
 */
function solveDiodeRs(vt: number, vTerm: number, rs: number, vjPrev: number) {
    let vj = Number.isFinite(vjPrev) ? vjPrev : 1.8;
    for (let k = 0; k < 30; k++) {
        const e = safeExp(vj / vt);
        const id = LED_IS * (e - 1);
        const gd = (LED_IS / vt) * e;
        const f = vj + rs * id - vTerm;
        let dvj = f / (1 + rs * gd);
        if (dvj > 0.5) dvj = 0.5;
        else if (dvj < -0.5) dvj = -0.5;
        vj -= dvj;
        if (Math.abs(dvj) < 1e-9) break;
    }
    const e = safeExp(vj / vt);
    const id = LED_IS * (e - 1);
    const gd = (LED_IS / vt) * e;
    const geq = gd / (1 + rs * gd) + GMIN;
    return { I: id, Geq: geq, vj };
}

interface CapState {
    _vPrev?: number;
}

/**
 * Solve the circuit for one timestep, writing node.voltage and component.current
 * (and LED param/burnt, transistor collector current).
 */
export function solveCircuit(nodes: CircuitNode[], components: AbstractComponent[], dt: number = 1 / 60): void {
    // Collect every node referenced (defensive: include component endpoints).
    const allNodes = new Set<CircuitNode>(nodes);
    for (const c of components) {
        allNodes.add(c.n1);
        allNodes.add(c.n2);
        if (c.n3) allNodes.add(c.n3);
    }
    const nodeList = [...allNodes];
    if (nodeList.length === 0) return;

    // Sanitize prior voltages (used as the Newton–Raphson warm start).
    for (const nd of nodeList) {
        if (!Number.isFinite(nd.voltage)) nd.voltage = 0;
    }

    // Ground = the first battery's negative terminal, else the first node.
    let ground: CircuitNode | null = null;
    for (const c of components) {
        if (c.type === TYPES.BATTERY) {
            ground = c.n2;
            break;
        }
    }
    if (!ground) ground = nodeList[0];

    // Index node-voltage unknowns (ground excluded).
    const nodeIdx = new Map<CircuitNode, number>();
    let nn = 0;
    for (const nd of nodeList) {
        if (nd === ground) continue;
        nodeIdx.set(nd, nn++);
    }
    const idxOf = (nd: CircuitNode | null | undefined): number =>
        nd && nd !== ground ? nodeIdx.get(nd)! : -1;

    // Battery branches.
    const batteries = components.filter((c) => c.type === TYPES.BATTERY);
    const branchOf = new Map<AbstractComponent, number>();
    batteries.forEach((b, i) => branchOf.set(b, nn + i));

    const size = nn + batteries.length;
    if (size === 0) {
        for (const nd of nodeList) nd.voltage = 0;
        for (const c of components) c.current = 0;
        return;
    }

    // Working node-voltage vector (warm start from prior solution).
    const V = new Array<number>(nn).fill(0);
    for (const nd of nodeList) {
        const i = idxOf(nd);
        if (i >= 0) V[i] = nd.voltage;
    }
    const voltAt = (nd: CircuitNode): number => {
        const i = idxOf(nd);
        return i < 0 ? 0 : V[i];
    };

    // Per-junction limited voltages across NR iterations.
    const ledVd = new Map<AbstractComponent, number>();
    const bjtVbe = new Map<AbstractComponent, number>();
    const bjtVbc = new Map<AbstractComponent, number>();
    for (const c of components) {
        // NOTE: don't seed ledVd from the terminal voltage — with series RS the
        // junction voltage is much lower; the LED stamp warm-starts at ~1.8V.
        if (c.type === TYPES.TRANSISTOR && c.n3) {
            bjtVbe.set(c, voltAt(c.n3) - voltAt(c.n1));
            bjtVbc.set(c, voltAt(c.n3) - voltAt(c.n2));
        }
    }

    const hasNonlinear = components.some(
        (c) => (c.type === TYPES.LED && !(c as unknown as { burnt?: boolean }).burnt) || (c.type === TYPES.TRANSISTOR && c.n3)
    );

    // One full Newton-Raphson solve at a given ground-shunt conductance `gmin`.
    const runNewton = (gmin: number): boolean => {
      let converged = false;
      for (let iter = 0; iter < NR_MAX_ITER; iter++) {
        const G: number[][] = Array.from({ length: size }, () => new Array<number>(size).fill(0));
        const z = new Array<number>(size).fill(0);
        // True while any pn-junction is still being voltage-limited — convergence
        // isn't real until limiting stops (otherwise node voltages can momentarily
        // plateau while a junction is still climbing toward its operating point).
        let limited = false;

        const stampG = (a: number, b: number, g: number) => {
            if (a >= 0) G[a][a] += g;
            if (b >= 0) G[b][b] += g;
            if (a >= 0 && b >= 0) {
                G[a][b] -= g;
                G[b][a] -= g;
            }
        };
        const addZ = (i: number, val: number) => {
            if (i >= 0) z[i] += val;
        };

        // Shunt conductance to ground on every node (homotopy parameter).
        for (let i = 0; i < nn; i++) G[i][i] += gmin;

        for (const c of components) {
            const a = idxOf(c.n1);
            const b = idxOf(c.n2);

            switch (c.type) {
                case TYPES.WIRE:
                    stampG(a, b, G_WIRE);
                    break;
                case TYPES.RESISTOR: {
                    const r = (c as unknown as { resistance: number }).resistance;
                    stampG(a, b, 1 / Math.max(1e-6, r));
                    break;
                }
                case TYPES.SWITCH:
                    if (c.param === 1) stampG(a, b, G_WIRE); // closed = short; open = nothing
                    break;
                case TYPES.CAPACITOR: {
                    const cap = (c as unknown as { capacitance: number } & CapState);
                    const C = Math.max(1e-12, cap.capacitance * 1e-6);
                    const geq = C / dt;
                    const vPrev = cap._vPrev ?? 0;
                    stampG(a, b, geq);
                    addZ(a, geq * vPrev);
                    addZ(b, -geq * vPrev);
                    break;
                }
                case TYPES.BATTERY: {
                    const k = branchOf.get(c)!;
                    const value = (c as unknown as { voltage: number }).voltage ?? 0;
                    if (a >= 0) {
                        G[a][k] += 1;
                        G[k][a] += 1;
                    }
                    if (b >= 0) {
                        G[b][k] -= 1;
                        G[k][b] -= 1;
                    }
                    z[k] += value;
                    break;
                }
                case TYPES.LED: {
                    if ((c as unknown as { burnt?: boolean }).burnt) break; // open circuit
                    const vTerm = voltAt(c.n1) - voltAt(c.n2);
                    const { I: id, Geq, vj } = solveDiodeRs(LED_VT, vTerm, LED_RS, ledVd.get(c) ?? 1.8);
                    ledVd.set(c, vj);
                    stampG(a, b, Geq);
                    const ieq = id - Geq * vTerm;
                    addZ(a, -ieq);
                    addZ(b, ieq);
                    break;
                }
                case TYPES.TRANSISTOR: {
                    if (!c.n3) break; // base unconnected → off
                    const E = a;
                    const Ccol = b;
                    const B = idxOf(c.n3);

                    const vbeRaw = voltAt(c.n3) - voltAt(c.n1);
                    const vbcRaw = voltAt(c.n3) - voltAt(c.n2);
                    const vbe = pnjLim(vbeRaw, bjtVbe.get(c) ?? vbeRaw, VT, BJT_VCRIT);
                    const vbc = pnjLim(vbcRaw, bjtVbc.get(c) ?? vbcRaw, VT, BJT_VCRIT);
                    if (vbe !== vbeRaw || vbc !== vbcRaw) limited = true;
                    bjtVbe.set(c, vbe);
                    bjtVbc.set(c, vbc);

                    const ef = safeExp(vbe / VT);
                    const er = safeExp(vbc / VT);
                    const iF = BJT_IS * (ef - 1);
                    const iR = BJT_IS * (er - 1);
                    const gif = (BJT_IS / VT) * ef + GMIN;
                    const gir = (BJT_IS / VT) * er + GMIN;

                    // Terminal currents (into device) and base partials wrt Vbe, Vbc.
                    const Ic = iF - iR * (1 + 1 / BJT_BR);
                    const Ib = iF / BJT_BF + iR / BJT_BR;
                    const Ie = -(Ic + Ib);

                    const dIc_be = gif,
                        dIc_bc = -gir * (1 + 1 / BJT_BR);
                    const dIb_be = gif / BJT_BF,
                        dIb_bc = gir / BJT_BR;
                    const dIe_be = -(dIc_be + dIb_be),
                        dIe_bc = -(dIc_bc + dIb_bc);

                    // J[t][s], s in order [E, C, B]; ∂/∂Ve=-∂/∂Vbe, ∂/∂Vc=-∂/∂Vbc, ∂/∂Vb=∂/∂Vbe+∂/∂Vbc
                    const term = [E, Ccol, B];
                    const I = [Ie, Ic, Ib];
                    const J = [
                        [-dIe_be, -dIe_bc, dIe_be + dIe_bc],
                        [-dIc_be, -dIc_bc, dIc_be + dIc_bc],
                        [-dIb_be, -dIb_bc, dIb_be + dIb_bc],
                    ];
                    const Vg = [voltAt(c.n1), voltAt(c.n2), voltAt(c.n3)];

                    for (let t = 0; t < 3; t++) {
                        if (term[t] < 0) continue;
                        let ieq = I[t];
                        for (let s = 0; s < 3; s++) ieq -= J[t][s] * Vg[s];
                        z[term[t]] -= ieq;
                        for (let s = 0; s < 3; s++) {
                            if (term[s] < 0) continue;
                            G[term[t]][term[s]] += J[t][s];
                        }
                    }
                    break;
                }
                case TYPES.CHIP: {
                    // Norton output driver: pull n1 toward 0/9V through ~10Ω based on inputs.
                    const signal = chipSignal(c, nodeList);
                    const gd = 0.1;
                    if (a >= 0) {
                        G[a][a] += gd;
                        z[a] += gd * (signal ? 9 : 0);
                    }
                    break;
                }
            }
        }

        const x = solveLinear(G, z);
        if (!x) break; // singular — keep last good solution

        // Damp the Newton step on nonlinear circuits to prevent junction
        // oscillation; linear circuits solve exactly in a single step.
        const stepLimit = hasNonlinear ? NR_MAX_STEP : Infinity;
        let maxDelta = 0;
        for (let i = 0; i < nn; i++) {
            let xi = x[i];
            if (!Number.isFinite(xi)) xi = 0;
            const dv = xi - V[i];
            if (dv > stepLimit) xi = V[i] + stepLimit;
            else if (dv < -stepLimit) xi = V[i] - stepLimit;
            if (xi > V_CLAMP) xi = V_CLAMP;
            else if (xi < -V_CLAMP) xi = -V_CLAMP;
            maxDelta = Math.max(maxDelta, Math.abs(xi - V[i]));
            V[i] = xi;
        }

            if (!hasNonlinear || (iter > 0 && maxDelta < NR_TOL && !limited)) {
                converged = true;
                break;
            }
      }
      return converged;
    };

    let converged = runNewton(GMIN);
    if (!converged && hasNonlinear) {
        // GMIN homotopy: start strongly shunted to ground (well-conditioned),
        // then relax the shunt toward the real solution, warm-starting each step.
        for (let i = 0; i < nn; i++) V[i] = 0;
        ledVd.clear();
        bjtVbe.clear();
        bjtVbc.clear();
        for (const g of [1, 1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8]) runNewton(g);
        converged = runNewton(GMIN);
    }

    // Write node voltages.
    for (const nd of nodeList) {
        const i = idxOf(nd);
        const v = i < 0 ? 0 : V[i];
        nd.voltage = Number.isFinite(v) ? v : 0;
    }

    writeComponentResults(components, dt, converged);
}

function chipSignal(chip: AbstractComponent, nodeList: CircuitNode[]): boolean {
    const logic = (chip as unknown as { logic?: string }).logic ?? 'AND';
    const midX = (chip.n1.x + chip.n2.x) / 2;
    const midY = (chip.n1.y + chip.n2.y) / 2;
    const inputs = nodeList.filter(
        (n) => Math.hypot(n.x - midX, n.y - midY) < 30 && n !== chip.n1 && n !== chip.n2
    );
    const a = inputs[0] ? inputs[0].voltage > 2 : false;
    const b = inputs[1] ? inputs[1].voltage > 2 : false;
    switch (logic) {
        case 'OR':
            return a || b;
        case 'NAND':
            return !(a && b);
        case 'NOR':
            return !(a || b);
        case 'XOR':
            return a !== b;
        case 'NOT':
            return !a;
        case 'AND':
        default:
            return a && b;
    }
}

function writeComponentResults(
    components: AbstractComponent[],
    dt: number,
    converged: boolean
): void {
    for (const c of components) {
        const v1 = Number.isFinite(c.n1.voltage) ? c.n1.voltage : 0;
        const v2 = Number.isFinite(c.n2.voltage) ? c.n2.voltage : 0;
        const vd = v1 - v2;

        switch (c.type) {
            case TYPES.WIRE:
                c.current = vd * G_WIRE;
                break;
            case TYPES.RESISTOR: {
                const r = (c as unknown as { resistance: number }).resistance;
                c.current = vd / Math.max(1e-6, r);
                break;
            }
            case TYPES.SWITCH:
                c.current = c.param === 1 ? vd * G_WIRE : 0;
                break;
            case TYPES.CAPACITOR: {
                const cap = c as unknown as { capacitance: number } & CapState;
                const C = Math.max(1e-12, cap.capacitance * 1e-6);
                const geq = C / dt;
                const vPrev = cap._vPrev ?? 0;
                c.current = geq * (vd - vPrev);
                cap._vPrev = vd; // store for next timestep
                break;
            }
            case TYPES.BATTERY:
                // Hide internal battery current to avoid "ghost current" visualization.
                c.current = 0;
                break;
            case TYPES.LED: {
                const led = c as unknown as { burnt?: boolean };
                if (led.burnt) {
                    c.current = 0;
                    c.param = 0;
                    break;
                }
                const { I: id } = solveDiodeRs(LED_VT, vd, LED_RS, 1.8);
                c.current = id;
                // Only latch a burn at a converged operating point — never on a
                // transient Newton iterate.
                if (converged && Math.abs(id) > LED_BURN_CURRENT) {
                    led.burnt = true;
                    c.param = 0;
                } else {
                    c.param = id > LED_ON_CURRENT ? 1 : 0;
                }
                break;
            }
            case TYPES.TRANSISTOR: {
                if (!c.n3) {
                    c.current = 0;
                    break;
                }
                const vbe = (c.n3.voltage || 0) - v1;
                const vbc = (c.n3.voltage || 0) - v2;
                const iF = BJT_IS * (safeExp(vbe / VT) - 1);
                const iR = BJT_IS * (safeExp(vbc / VT) - 1);
                c.current = iF - iR * (1 + 1 / BJT_BR); // collector current
                break;
            }
            case TYPES.CHIP:
                c.current = 0;
                break;
            default:
                c.current = 0;
        }
        if (!Number.isFinite(c.current)) c.current = 0;
    }
}
