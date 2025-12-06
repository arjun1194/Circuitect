import { describe, it, expect } from 'vitest';
import { Component, CircuitNode, physicsStep } from './Physics';
import { TYPES, DEFAULT_BATTERY_VOLTAGE } from '../config/gameConfig';

describe('Physics Engine', () => {
    describe('Component', () => {
        it('should initialize with correct default values', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(10, 0);
            const comp = new Component(TYPES.RESISTOR, n1, n2);

            expect(comp.type).toBe(TYPES.RESISTOR);
            expect(comp.resistance).toBe(220); // Default resistor value
            expect(comp.n1).toBe(n1);
            expect(comp.n2).toBe(n2);
        });

        it('should return correct resistance for different types', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(10, 0);

            const wire = new Component(TYPES.WIRE, n1, n2);
            expect(wire.getResistance()).toBe(0.1);

            const resistor = new Component(TYPES.RESISTOR, n1, n2);
            resistor.resistance = 1000;
            expect(resistor.getResistance()).toBe(1000);

            const openSwitch = new Component(TYPES.SWITCH, n1, n2);
            openSwitch.param = 0; // Off
            expect(openSwitch.getResistance()).toBeGreaterThan(1000000);

            const closedSwitch = new Component(TYPES.SWITCH, n1, n2);
            closedSwitch.param = 1; // On
            expect(closedSwitch.getResistance()).toBe(0.1);
        });

        it('should return correct source voltage for battery', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(10, 0);
            const battery = new Component(TYPES.BATTERY, n1, n2);

            expect(battery.getSourceVoltage()).toBe(DEFAULT_BATTERY_VOLTAGE);

            battery.voltage = 12;
            expect(battery.getSourceVoltage()).toBe(12);

            const resistor = new Component(TYPES.RESISTOR, n1, n2);
            expect(resistor.getSourceVoltage()).toBe(0);
        });
    });

    describe('Simulation (physicsStep)', () => {
        it('should solve a simple battery-resistor circuit', () => {
            // Simple loop: Battery(+) -> n1 -> Resistor -> n2 -> Battery(-)
            // Battery connected n1 to n2? No.
            // Let's make: Battery(n1, n2), Resistor(n1, n2). Parallel?
            // If Battery is n1->n2, then n1 is (+) relative to n2 if drawn that way?
            // ComponentDefinitions: Battery draw uses n1, n2. 
            // Physics: if (comp.n1 === node) numerator += (other.voltage + voltage)...
            // Checks out.

            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(50, 0);
            const nodes = [n1, n2];

            const battery = new Component(TYPES.BATTERY, n1, n2); // n1 is (+), n2 is (-) usually?
            // In physics: if (comp.n1 === node) ... + voltage. So n1 is positive terminal side?
            // Wait, logic: `numerator += (other.voltage + voltage) * sourceG;`. 
            // If calculating node (n1), other is n2. voltage is V. target = n2.v + V.
            // So n1 wants to be V higher than n2. So n1 is positive.

            const resistor = new Component(TYPES.RESISTOR, n1, n2);
            resistor.resistance = 100;

            const components = [battery, resistor];

            // Link connections (Required for physicsStep)
            n1.connections = [battery, resistor];
            n2.connections = [battery, resistor];

            // Run simulation
            physicsStep(nodes, components);

            // Check Voltages
            // n2 should typically be grounded or relative.
            // The engine handles floating grounds by "battery negative grounding" logic if needed.
            // Logic: `hasBatteryNegative = true; ... node.voltage = 0`.
            // If n2 is connected to battery n2 (comp.n2 === n2), and battery is (n1, n2).
            // Yes.

            expect(n2.voltage).toBeCloseTo(0, 1);
            expect(n1.voltage).toBeCloseTo(DEFAULT_BATTERY_VOLTAGE, 1);

            // Check Current
            // I = V/R = 9 / 100 = 0.09
            // Resistor current
            expect(resistor.current).toBeCloseTo(DEFAULT_BATTERY_VOLTAGE / 100, 2);
        });

        it('should handle open switch (zero current)', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(50, 0);
            const nodes = [n1, n2];

            const battery = new Component(TYPES.BATTERY, n1, n2);
            const switchComp = new Component(TYPES.SWITCH, n1, n2);
            switchComp.param = 0; // Open

            const components = [battery, switchComp];

            // Link connections
            n1.connections = [battery, switchComp];
            n2.connections = [battery, switchComp];

            physicsStep(nodes, components);

            // With open switch, resistance is huge. Current should be near 0.
            expect(switchComp.current).toBeCloseTo(0, 5);
        });
    });
});
