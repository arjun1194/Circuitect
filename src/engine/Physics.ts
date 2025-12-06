import { TYPES, UPDATE_ITERATIONS, DEFAULT_BATTERY_VOLTAGE, ComponentType } from '../config/gameConfig';
import { COMPONENT_DEFS } from './ComponentDefinitions';

export class CircuitNode {
    x: number;
    y: number;
    voltage: number;
    fixed: boolean;
    connections: Component[]; // Array of Component instances

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.voltage = 0;
        this.fixed = false;
        this.connections = []; // Array of Component instances
    }
}

export class Component {
    type: ComponentType;
    n1: CircuitNode;
    n2: CircuitNode;
    n3: CircuitNode | null; // For transistor base
    current: number;
    param: number; // State param (e.g. switch on/off, LED state)
    particles: number[];
    resistance: number;
    capacitance: number;
    logic: string;
    voltage: number;
    ledColor?: string;

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

        const def = COMPONENT_DEFS[type];
        this.resistance = def.r || 100;
        this.capacitance = 10;
        this.logic = 'AND';
        this.voltage = def.voltage || DEFAULT_BATTERY_VOLTAGE;

        // Custom props
        if (type === TYPES.LED) {
            this.ledColor = 'red';
        }
    }

    getResistance(): number {
        if (this.type === TYPES.WIRE) return 0.1;
        if (this.type === TYPES.SWITCH) return this.param === 1 ? 0.1 : 999999999;
        if (this.type === TYPES.TRANSISTOR) return 1000000;
        if (this.type === TYPES.CHIP) return 10000;
        if (this.type === TYPES.RESISTOR) return this.resistance;
        if (this.type === TYPES.CAPACITOR) return 1000000;
        return this.resistance;
    }

    getSourceVoltage(): number {
        return (this.type === TYPES.BATTERY) ? this.voltage : 0;
    }
}

/**
 * Run one step of circuit simulation
 */
export function physicsStep(nodes: CircuitNode[], components: Component[]) {
    nodes.forEach(n => { n.fixed = false; });

    for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
        nodes.forEach(node => {
            if (node.fixed) return;

            let numerator = 0;
            let denominator = 0;
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

                let R = comp.getResistance();

                // Transistor Logic (NPN)
                if (comp.type === TYPES.TRANSISTOR) {
                    if (comp.n3) {
                        // If base voltage > Emitter (approx) + 0.6V, turn on
                        // Here we simplify: if Base > Emitter + 0.6, R is low.
                        // Ideally we check V_base - V_emitter.
                        if (comp.n3.voltage > comp.n2.voltage + 0.6) R = 10;
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

                    // Actually original logic was "n !== comp.n1". n2 is usually ground for chips?
                    // In legacy: "n !== comp.n1" was the check. 
                    // Let's assume n1 is output, n2 is ground? 
                    // Actually Legacy Code: `const inputs = ... && n !== comp.n1;`

                    let signal = false;
                    const valA = inputs[0] ? inputs[0].voltage > 2 : false;
                    const valB = inputs[1] ? inputs[1].voltage > 2 : false;

                    if (comp.logic === 'AND') signal = valA && valB;
                    if (comp.logic === 'OR') signal = valA || valB;
                    if (comp.logic === 'NAND') signal = !(valA && valB);
                    if (comp.logic === 'XOR') signal = (valA !== valB);

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
                    if (comp.n1 === node) {
                        numerator += (other!.voltage + voltage) * sourceG;
                    } else {
                        numerator += (other!.voltage - voltage) * sourceG;
                        hasBatteryNegative = true;
                    }
                    denominator += sourceG;
                } else {
                    const G = 1 / Math.max(0.01, R);
                    if (other) numerator += other.voltage * G;
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
                node.voltage = numerator / denominator;
            }
        });
    }

    // Update component states (Current, LED param)
    components.forEach(c => {
        const vDiff = c.n1.voltage - c.n2.voltage;
        const R = c.getResistance();
        c.current = vDiff / Math.max(0.1, R);

        if (c.type === TYPES.LED) {
            c.param = (c.n1.voltage > c.n2.voltage + 1.5) ? 1 : 0;
        }
    });
}
