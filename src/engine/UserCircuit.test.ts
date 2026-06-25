import { describe, it, expect } from 'vitest';
import { physicsStep, CircuitNode, AbstractComponent } from './Physics';
import { circuitFromJson } from '../utils/CircuitSerializer';

/**
 * A real, complex user circuit (two batteries, a switch, transistor, LED) loaded
 * from JSON. This previously drove the relaxation engine to nonsense values; with
 * the MNA solver it must load correctly and settle to finite, bounded voltages.
 * Acts as a robustness regression for the solver (no NaN / no runaway).
 */
describe('User transistor circuit (JSON, robustness)', () => {
    const circuitClosed =
        '{"version":1,"nodes":[{"id":0,"x":175,"y":450},{"id":1,"x":175,"y":525},{"id":2,"x":250,"y":450},{"id":3,"x":300,"y":450},{"id":4,"x":350,"y":550},{"id":5,"x":350,"y":350},{"id":6,"x":325,"y":450},{"id":7,"x":350,"y":225},{"id":8,"x":575,"y":225},{"id":9,"x":575,"y":350},{"id":10,"x":575,"y":550}],"components":[{"type":"BATTERY","n1Id":0,"n2Id":1,"properties":{"voltage":5}},{"type":"SWITCH","n1Id":0,"n2Id":2,"properties":{"param":1}},{"type":"RESISTOR","n1Id":2,"n2Id":3,"properties":{"resistance":10000}},{"type":"TRANSISTOR","n1Id":4,"n2Id":5,"n3Id":6},{"type":"WIRE","n1Id":3,"n2Id":6},{"type":"RESISTOR","n1Id":5,"n2Id":7,"properties":{"resistance":200}},{"type":"BATTERY","n1Id":7,"n2Id":8,"properties":{"voltage":5}},{"type":"WIRE","n1Id":8,"n2Id":9},{"type":"WIRE","n1Id":4,"n2Id":10},{"type":"WIRE","n1Id":10,"n2Id":9},{"type":"WIRE","n1Id":1,"n2Id":4},{"type":"LED","n1Id":5,"n2Id":9,"properties":{"ledColor":"red"}}]}';

    const run = (nodes: CircuitNode[], components: AbstractComponent[], iterations = 20) => {
        for (let i = 0; i < iterations; i++) physicsStep(nodes, components);
    };

    it('loads the circuit topology from JSON', () => {
        const { nodes, components } = circuitFromJson(circuitClosed);
        expect(nodes).toHaveLength(11);
        expect(components).toHaveLength(12);
    });

    it('settles to finite, bounded node voltages (no runaway / NaN)', () => {
        const { nodes, components } = circuitFromJson(circuitClosed);
        run(nodes, components);

        for (const n of nodes) {
            expect(Number.isFinite(n.voltage)).toBe(true);
            expect(Math.abs(n.voltage)).toBeLessThan(100); // two 5V supplies → well bounded
        }
        for (const c of components) {
            expect(Number.isFinite(c.current)).toBe(true);
        }
    });

    it('keeps the transistor V_BE physically bounded', () => {
        const { nodes, components } = circuitFromJson(circuitClosed);
        run(nodes, components);

        const base = nodes.find((n) => n.x === 325 && n.y === 450)!;
        const emitter = nodes.find((n) => n.x === 350 && n.y === 550)!;
        const vBE = base.voltage - emitter.voltage;
        // A silicon junction never forward-biases much past ~0.8V.
        expect(vBE).toBeLessThan(0.9);
    });
});
