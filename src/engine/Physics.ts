import { TYPES, UPDATE_ITERATIONS, ComponentType } from '../config/gameConfig';


export class CircuitNode {
    x: number;
    y: number;
    voltage: number;
    fixed: boolean;
    connections: AbstractComponent[]; // Array of Component instances

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.voltage = 0;
        this.fixed = false;
        this.connections = []; // Array of Component instances
    }
}

export abstract class AbstractComponent {
    type: ComponentType;
    n1: CircuitNode;
    n2: CircuitNode;
    n3: CircuitNode | null; // For transistor base
    current: number;
    param: number; // State param (e.g. switch on/off, LED state)
    particles: number[];

    constructor(type: ComponentType, n1: CircuitNode, n2: CircuitNode) {
        this.type = type;
        this.n1 = n1;
        this.n2 = n2;
        this.n3 = null; // For transistor base
        this.current = 0;
        this.param = 0; // State param (e.g. switch on/off, LED state)
        this.particles = [];
        for (let i = 0; i < 3; i++) {
            this.particles.push(Math.random());
        }
    }

    abstract draw(ctx: CanvasRenderingContext2D, theme: any): void;
    abstract getResistance(): number;

    getSourceVoltage(): number {
        return 0;
    }
}

/**
 * Run one step of circuit simulation
 */
export function physicsStep(nodes: CircuitNode[], components: AbstractComponent[]) {
    // Initialize any NaN voltages to 0
    nodes.forEach(n => {
        n.fixed = false;
        if (isNaN(n.voltage) || !isFinite(n.voltage)) {
            n.voltage = 0;
        }
    });

    // INSTANT RESPONSE: Reset floating nodes immediately to 0V
    // A node is floating if all its connections have infinite resistance (open switches, etc.)
    nodes.forEach(node => {
        if (node.connections.length === 0) {
            node.voltage = 0;
            return;
        }

        // Check if node has any path to power (finite resistance connection)
        let hasPowerPath = false;
        node.connections.forEach(comp => {
            const R = comp.getResistance();
            // Battery provides power, or component has finite resistance
            if (comp.type === TYPES.BATTERY || (isFinite(R) && R < 10000000)) {
                hasPowerPath = true;
            }
        });

        // If no power path, instantly decay voltage toward 0
        if (!hasPowerPath) {
            node.voltage *= 0.1; // Fast decay - 90% reduction per step
        }
    });

    for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
        nodes.forEach(node => {
            if (node.fixed) return;

            let numerator = 0;
            let denominator = 0.000001; // 1 MOhm pull-down resistor to prevent floating voltages
            let hasBatteryNegative = false;

            node.connections.forEach(comp => {
                const other = (comp.n1 === node) ? comp.n2 : (comp.n2 === node ? comp.n1 : null);

                // Handle transistor Base connection (high impedance)
                if (comp.type === TYPES.TRANSISTOR && comp.n3 === node) {
                    numerator += 0;
                    denominator += 0.00001;
                    return;
                }

                if (!other && comp.type !== TYPES.TRANSISTOR) return;

                // For transistors, we need to find the proper 'other' node for the E-C path
                let transistorOther: CircuitNode | null = null;
                if (comp.type === TYPES.TRANSISTOR) {
                    // Only process if current node is Emitter (n1) or Collector (n2)
                    if (comp.n1 === node) {
                        transistorOther = comp.n2;
                    } else if (comp.n2 === node) {
                        transistorOther = comp.n1;
                    } else {
                        // Node is not part of E-C path, skip
                        return;
                    }
                }

                let R = comp.getResistance();

                // Skip components with infinite resistance (e.g., open switches)
                // They provide no electrical path, so should not influence voltage
                if (!isFinite(R)) {
                    return;
                }

                // Transistor Logic (NPN)
                // n1 = Emitter, n2 = Collector, n3 = Base
                if (comp.type === TYPES.TRANSISTOR) {
                    if (comp.n3) {
                        // Guard against NaN in base/emitter voltage comparison
                        const baseV = isNaN(comp.n3.voltage) ? 0 : comp.n3.voltage;
                        const emitterV = isNaN(comp.n1.voltage) ? 0 : comp.n1.voltage;
                        // If base voltage > Emitter + 0.6V, turn on (NPN forward bias)
                        if (baseV > emitterV + 0.6) R = 10;
                        else R = 10000000;
                    } else R = 10000000;
                }

                // Chip Logic
                if (comp.type === TYPES.CHIP) {
                    // Find input nodes near the chip body center (approx)
                    const midX = (comp.n1.x + comp.n2.x) / 2;
                    const midY = (comp.n1.y + comp.n2.y) / 2;
                    // Filter nodes near center that are NOT connection pins
                    const inputs = nodes.filter(n =>
                        Math.hypot(n.x - midX, n.y - midY) < 30 && n !== comp.n1 && n !== comp.n2
                    );

                    let signal = false;
                    const valA = inputs[0] ? (isNaN(inputs[0].voltage) ? 0 : inputs[0].voltage) > 2 : false;
                    const valB = inputs[1] ? (isNaN(inputs[1].voltage) ? 0 : inputs[1].voltage) > 2 : false;

                    if ((comp as any).logic === 'AND') signal = valA && valB;
                    if ((comp as any).logic === 'OR') signal = valA || valB;
                    if ((comp as any).logic === 'NAND') signal = !(valA && valB);
                    if ((comp as any).logic === 'XOR') signal = (valA !== valB);

                    if (comp.n1 === node) {
                        const target = signal ? 9 : 0;
                        numerator += target * 10;
                        denominator += 10;
                        return;
                    }
                }

                // Battery Logic
                if (comp.type === TYPES.BATTERY) {
                    const voltage = comp.getSourceVoltage();
                    const sourceG = 10.0;
                    // Guard against null other (shouldn't happen for batteries but be safe)
                    const otherVoltage = other ? (isNaN(other.voltage) ? 0 : other.voltage) : 0;
                    if (comp.n1 === node) {
                        numerator += (otherVoltage + voltage) * sourceG;
                    } else {
                        numerator += (otherVoltage - voltage) * sourceG;
                        hasBatteryNegative = true;
                    }
                    denominator += sourceG;
                } else {
                    const G = 1 / Math.max(0.01, R);
                    // Use transistorOther for transistors, otherwise use other
                    const effectiveOther = comp.type === TYPES.TRANSISTOR ? transistorOther : other;
                    if (effectiveOther) {
                        const otherV = isNaN(effectiveOther.voltage) ? 0 : effectiveOther.voltage;
                        numerator += otherV * G;
                    }
                    denominator += G;
                }
            });

            // Ground handling for Battery Negative (simplified nodal analysis fix)
            if (hasBatteryNegative && node === nodes.find(n =>
                n.connections.some(c => c.type === TYPES.BATTERY && c.n2 === n)
            )) {
                node.voltage = 0;
                node.fixed = true;
            } else if (denominator > 0) {
                const newVoltage = numerator / denominator;
                // Guard against NaN/Infinity results
                node.voltage = (isNaN(newVoltage) || !isFinite(newVoltage)) ? 0 : newVoltage;
            }
        });
    }

    // Update component states (Current, LED param)
    components.forEach(c => {
        if (c.type === TYPES.BATTERY) {
            c.current = 0; // Don't visualize internal flow for batteries to avoid "ghost current"
        } else {
            const v1 = isNaN(c.n1.voltage) ? 0 : c.n1.voltage;
            const v2 = isNaN(c.n2.voltage) ? 0 : c.n2.voltage;
            const vDiff = v1 - v2;
            const R = c.getResistance();
            c.current = vDiff / Math.max(0.01, R);
        }

        if (c.type === TYPES.LED) {
            const led = c as any;
            const v1 = isNaN(c.n1.voltage) ? 0 : c.n1.voltage;
            const v2 = isNaN(c.n2.voltage) ? 0 : c.n2.voltage;
            const vDiff = Math.abs(v1 - v2);

            // Check for burn condition (voltage exceeds max rating)
            if (!led.burnt && vDiff > (led.maxVoltage || 10)) {
                led.burnt = true;
            }

            // LED turns on if forward biased by at least 1.5V and not burnt
            c.param = (!led.burnt && v1 > v2 + 1.5) ? 1 : 0;
        }
    });
}
