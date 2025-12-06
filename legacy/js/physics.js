/**
 * Circuit Architect - Physics Engine
 * Circuit simulation with node voltage analysis
 */

import { TYPES, GRID_SIZE, UPDATE_ITERATIONS, DEFAULT_BATTERY_VOLTAGE } from './config.js';
import { COMPONENTS } from './components.js';
import { state } from './state.js';

// Circuit Node class
export class CircuitNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.voltage = 0;
        this.fixed = false;
        this.connections = [];
    }
}

// Component class
export class Component {
    constructor(type, n1, n2) {
        this.type = type;
        this.n1 = n1;
        this.n2 = n2;
        this.n3 = null;
        this.current = 0;
        this.param = 0;
        this.particles = [];
        for (let i = 0; i < 3; i++) {
            this.particles.push(Math.random());
        }

        // Default Properties from component definitions
        const def = COMPONENTS[type];
        this.resistance = def.r || 100;
        this.capacitance = 10;
        this.logic = 'AND';
        this.voltage = def.voltage || DEFAULT_BATTERY_VOLTAGE;
    }

    getResistance() {
        if (this.type === TYPES.WIRE) return 0.1;
        if (this.type === TYPES.SWITCH) return this.param === 1 ? 0.1 : 999999999;
        if (this.type === TYPES.TRANSISTOR) return 1000000;
        if (this.type === TYPES.CHIP) return 10000;
        if (this.type === TYPES.RESISTOR) return this.resistance;
        if (this.type === TYPES.CAPACITOR) return 1000000;
        return this.resistance;
    }

    getSourceVoltage() {
        return (this.type === TYPES.BATTERY) ? this.voltage : 0;
    }
}

// Physics simulation step
export function physicsStep() {
    state.nodes.forEach(n => { n.fixed = false; });

    for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
        state.nodes.forEach(node => {
            if (node.fixed) return;

            let numerator = 0;
            let denominator = 0;
            let hasBatteryNegative = false;

            node.connections.forEach(comp => {
                const other = (comp.n1 === node) ? comp.n2 : (comp.n2 === node ? comp.n1 : null);

                if (comp.type === TYPES.TRANSISTOR && comp.n3 === node) {
                    numerator += 0;
                    denominator += 0.00001;
                    return;
                }

                if (!other && comp.type !== TYPES.TRANSISTOR) return;

                let R = comp.getResistance();

                // Transistor Logic
                if (comp.type === TYPES.TRANSISTOR) {
                    if (comp.n3) {
                        if (comp.n3.voltage > comp.n2.voltage + 0.6) R = 10;
                        else R = 10000000;
                    } else R = 10000000;
                }

                // Chip Logic
                if (comp.type === TYPES.CHIP) {
                    const midX = (comp.n1.x + comp.n2.x) / 2;
                    const midY = (comp.n1.y + comp.n2.y) / 2;
                    const inputs = state.nodes.filter(n =>
                        Math.hypot(n.x - midX, n.y - midY) < 30 && n !== comp.n1
                    );

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
                        numerator += (other.voltage + voltage) * sourceG;
                    } else {
                        numerator += (other.voltage - voltage) * sourceG;
                        hasBatteryNegative = true;
                    }
                    denominator += sourceG;
                } else {
                    const G = 1 / Math.max(0.01, R);
                    if (other) numerator += other.voltage * G;
                    denominator += G;
                }
            });

            if (hasBatteryNegative && node === state.nodes.find(n =>
                n.connections.some(c => c.type === TYPES.BATTERY && c.n2 === n)
            )) {
                node.voltage = 0;
                node.fixed = true;
            } else if (denominator > 0) {
                node.voltage = numerator / denominator;
            }
        });
    }

    state.components.forEach(c => {
        const vDiff = c.n1.voltage - c.n2.voltage;
        const R = c.getResistance();
        c.current = vDiff / Math.max(0.1, R);

        if (c.type === TYPES.LED) {
            c.param = (c.n1.voltage > c.n2.voltage + 1.5) ? 1 : 0;
        }
    });
}
