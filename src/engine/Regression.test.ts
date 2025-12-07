import { describe, it, expect } from 'vitest';
import { CircuitNode, physicsStep, AbstractComponent } from './Physics';
import { Battery, LED } from './components/AdvancedComponents';
import { Wire } from './components/BasicComponents';

describe('Regression Tests', () => {

    // Helper to setup nodes and connections manually for test isolation
    const connect = (comp: AbstractComponent) => {
        comp.n1.connections.push(comp);
        comp.n2.connections.push(comp);
        if (comp.n3) comp.n3.connections.push(comp);
    };

    it('should NOT show current flow for an unconnected battery (Ghost Current)', () => {
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(100, 0);

        const battery = new Battery(n1, n2);
        connect(battery);

        physicsStep([n1, n2], [battery]);

        // "Current" on the battery component means current flowing THROUGH it.
        // For an open circuit, this should be 0.
        expect(battery.current).toBeLessThan(0.001);
    });

    it('should light up LED in a simple closed loop', () => {
        // Circuit: Battery(+) -> Wire -> LED -> Wire -> Battery(-)
        const nBatPos = new CircuitNode(0, 0);
        const nBatNeg = new CircuitNode(0, 100);

        const nLedPos = new CircuitNode(50, 0);
        const nLedNeg = new CircuitNode(50, 100);

        const battery = new Battery(nBatPos, nBatNeg);
        const wire1 = new Wire(nBatPos, nLedPos);
        const led = new LED(nLedPos, nLedNeg);
        const wire2 = new Wire(nLedNeg, nBatNeg);

        const components = [battery, wire1, led, wire2];
        const nodes = [nBatPos, nBatNeg, nLedPos, nLedNeg];

        components.forEach(connect);

        // Run simulation
        physicsStep(nodes, components);
        physicsStep(nodes, components);
        physicsStep(nodes, components); // Run a few times for convergence

        // Check Voltages
        // Battery Negative should be 0V (grounded by logic)
        expect(nBatNeg.voltage).toBeCloseTo(0, 1);
        // Battery Positive should be ~9V
        expect(nBatPos.voltage).toBeGreaterThan(8);

        // IDEAL WIRE CHECK: Voltage at nLedPos should be extremely close to nBatPos
        // (Since wire1 has R=0, drop should be tiny)
        expect(Math.abs(nBatPos.voltage - nLedPos.voltage)).toBeLessThan(0.01);

        // IDEAL WIRE CURRENT CHECK: 
        // Current in wire should match current in LED (Series circuit)
        // Previous bug: Wire current was 10x smaller due to dampening mismatch.
        // We use toBeCloseTo with precision 1 (so e.g. 0.04 vs 0.04)
        // Since floating point, we check ratio or difference.
        if (led.current > 0.001) {
            expect(wire1.current).toBeCloseTo(led.current, 4);
        }

        // Check LED state
        // LED param should be 1 (ON)
        expect(led.param).toBe(1);
    });
});
