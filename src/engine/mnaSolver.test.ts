import { describe, it, expect } from 'vitest';
import { CircuitNode } from './Physics';
import { Battery, Resistor, Wire, Switch, LED, Transistor, Capacitor } from './components';
import { solveCircuit } from './mnaSolver';

describe('MNA solver — linear', () => {
    it('solves a battery + resistor loop exactly (Ohm law)', () => {
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(50, 0);
        const bat = new Battery(n1, n2);
        bat.voltage = 9;
        const r = new Resistor(n1, n2);
        r.resistance = 100;

        solveCircuit([n1, n2], [bat, r]);

        expect(n2.voltage).toBeCloseTo(0, 6);
        expect(n1.voltage).toBeCloseTo(9, 4);
        expect(r.current).toBeCloseTo(0.09, 4); // 9V / 100Ω
    });

    it('solves a series battery → resistor → wire loop with ideal wire', () => {
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(10, 0);
        const n3 = new CircuitNode(20, 0);
        const b = new Battery(n1, n2);
        b.voltage = 10;
        const r = new Resistor(n2, n3);
        r.resistance = 100;
        const w = new Wire(n3, n1);

        solveCircuit([n1, n2, n3], [b, r, w]);

        expect(n2.voltage).toBeCloseTo(0, 4);
        expect(n1.voltage).toBeCloseTo(10, 2);
        // Series current ~ 10/100 = 0.1A through both resistor and wire.
        expect(Math.abs(r.current)).toBeCloseTo(0.1, 3);
        expect(Math.abs(w.current)).toBeCloseTo(0.1, 3);
    });

    it('open switch carries no current', () => {
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(50, 0);
        const bat = new Battery(n1, n2);
        bat.voltage = 9;
        const sw = new Switch(n1, n2);
        sw.param = 0; // open

        solveCircuit([n1, n2], [bat, sw]);

        expect(Math.abs(sw.current)).toBeLessThan(1e-3);
    });
});

describe('MNA solver — LED (Shockley diode)', () => {
    it('lights an LED with a current-limiting resistor and does not burn it', () => {
        const nPos = new CircuitNode(0, 0);
        const nGnd = new CircuitNode(0, 100);
        const nMid = new CircuitNode(50, 0);
        const bat = new Battery(nPos, nGnd);
        bat.voltage = 9;
        const r = new Resistor(nPos, nMid);
        r.resistance = 470;
        const led = new LED(nMid, nGnd);

        solveCircuit([nPos, nGnd, nMid], [bat, r, led]);

        expect(led.burnt).toBe(false);
        expect(led.param).toBe(1); // lit
        // Forward current limited to a sane mA range.
        expect(led.current).toBeGreaterThan(0.003);
        expect(led.current).toBeLessThan(0.03);
        // LED terminal voltage (junction + series RS) sits between the supply and ~junction.
        expect(nMid.voltage).toBeGreaterThan(2);
        expect(nMid.voltage).toBeLessThan(7);
    });

    it('burns an LED driven well over its current rating (no current limiting)', () => {
        const nPos = new CircuitNode(0, 0);
        const nGnd = new CircuitNode(0, 100);
        const bat = new Battery(nPos, nGnd);
        bat.voltage = 24; // far above what the LED's series RS can survive
        const led = new LED(nPos, nGnd);

        solveCircuit([nPos, nGnd], [bat, led]);

        expect(led.burnt).toBe(true);
        expect(led.param).toBe(0);
    });
});

describe('MNA solver — NPN transistor (Ebers–Moll)', () => {
    // Common-emitter switch: Vcc → Rc → collector; emitter = ground;
    // base biased from Vcc through a switch + resistor.
    const build = (switchClosed: boolean) => {
        const nVcc = new CircuitNode(0, 0);
        const nGnd = new CircuitNode(0, 100);
        const nSw = new CircuitNode(50, 0);
        const nBase = new CircuitNode(100, 0);
        const nCol = new CircuitNode(100, -50);

        const bat = new Battery(nVcc, nGnd);
        bat.voltage = 5;
        const rc = new Resistor(nVcc, nCol);
        rc.resistance = 1000;
        const sw = new Switch(nVcc, nSw);
        sw.param = switchClosed ? 1 : 0;
        const rb = new Resistor(nSw, nBase);
        rb.resistance = 10000;
        const t = new Transistor(nGnd, nCol); // n1=emitter(gnd), n2=collector
        t.n3 = nBase;

        const nodes = [nVcc, nGnd, nSw, nBase, nCol];
        const comps = [bat, rc, sw, rb, t];
        // A few steps for the Newton-Raphson warm start to settle.
        for (let i = 0; i < 5; i++) solveCircuit(nodes, comps);
        return { nBase, nGnd, nCol, t };
    };

    it('turns ON (collector pulled low) when base is driven', () => {
        const { nBase, nCol } = build(true);
        expect(nBase.voltage).toBeGreaterThan(0.5); // V_BE clamped ~0.7
        expect(nCol.voltage).toBeLessThan(2); // saturated / conducting
    });

    it('stays OFF (collector near Vcc) when base is floating', () => {
        const { nBase, nCol } = build(false);
        expect(nBase.voltage).toBeLessThan(0.5);
        expect(nCol.voltage).toBeGreaterThan(4); // pulled up to Vcc
    });
});

describe('MNA solver — capacitor (transient)', () => {
    it('charges through a resistor and blocks DC at steady state', () => {
        const nPos = new CircuitNode(0, 0);
        const nGnd = new CircuitNode(0, 100);
        const nMid = new CircuitNode(50, 0);
        const bat = new Battery(nPos, nGnd);
        bat.voltage = 5;
        const r = new Resistor(nPos, nMid);
        r.resistance = 1000;
        const cap = new Capacitor(nMid, nGnd);
        cap.capacitance = 10; // µF

        const nodes = [nPos, nGnd, nMid];
        const comps = [bat, r, cap];
        for (let i = 0; i < 80; i++) solveCircuit(nodes, comps, 1 / 60);

        // Fully charged: capacitor node ~ supply, ~no current (blocks DC).
        expect(nMid.voltage).toBeCloseTo(5, 1);
        expect(Math.abs(cap.current)).toBeLessThan(1e-3);
    });
});
