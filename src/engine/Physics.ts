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
    nodes.forEach(n => { n.fixed = false; });

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
        if (c.type === TYPES.BATTERY) {
            c.current = 0; // Don't visualize internal flow for batteries to avoid "ghost current"
        } else {
            const vDiff = c.n1.voltage - c.n2.voltage;
            const R = c.getResistance();
            c.current = vDiff / Math.max(0.01, R);
        }

        if (c.type === TYPES.LED) {
            c.param = (c.n1.voltage > c.n2.voltage + 1.5) ? 1 : 0;
        }
    });
}
