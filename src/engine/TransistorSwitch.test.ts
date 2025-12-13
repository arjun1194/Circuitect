import { describe, it, expect } from 'vitest';
import { CircuitNode, physicsStep, AbstractComponent } from './Physics';
import { Battery, Switch, Resistor, Transistor, Wire } from './components';

/**
 * Tests for transistor switching behavior
 * 
 * Simple circuit: Battery → Switch → Resistor → Transistor Base
 *                 Emitter grounded, Collector has load
 */
describe('Transistor Switch Circuit Tests', () => {

    // Helper to setup connections
    const connect = (comp: AbstractComponent) => {
        comp.n1.connections.push(comp);
        comp.n2.connections.push(comp);
        if (comp.n3) comp.n3.connections.push(comp);
    };

    // Run physics for convergence
    const runSimulation = (nodes: CircuitNode[], components: AbstractComponent[], iterations = 20) => {
        for (let i = 0; i < iterations; i++) {
            physicsStep(nodes, components);
        }
    };

    it('should turn transistor ON when base switch is CLOSED', () => {
        // Simple circuit: Battery(5V) → Switch(closed) → Resistor(1k) → Base
        //                 Emitter grounded, Collector connected to power via resistor

        const nPower = new CircuitNode(0, 0);        // 5V positive
        const nGround = new CircuitNode(0, 100);     // Ground (0V)
        const nAfterSwitch = new CircuitNode(50, 0); // After switch
        const nBase = new CircuitNode(100, 0);       // Transistor base
        const nEmitter = new CircuitNode(100, 100);  // Transistor emitter (grounded)
        const nCollector = new CircuitNode(100, -50);// Transistor collector

        // Components
        const battery = new Battery(nPower, nGround);
        (battery as any).voltage = 5;

        const sw = new Switch(nPower, nAfterSwitch);
        sw.param = 1; // CLOSED

        const baseResistor = new Resistor(nAfterSwitch, nBase);
        (baseResistor as any).resistance = 1000;

        const transistor = new Transistor(nEmitter, nCollector);
        transistor.n3 = nBase;
        nBase.connections.push(transistor);

        // Ground connection for emitter
        const groundWire = new Wire(nEmitter, nGround);

        const components = [battery, sw, baseResistor, transistor, groundWire];
        const nodes = [nPower, nGround, nAfterSwitch, nBase, nEmitter, nCollector];

        components.forEach(connect);
        runSimulation(nodes, components);

        // Check V_BE
        const vBE = nBase.voltage - nEmitter.voltage;

        // With switch closed, V_BE should be significant (above threshold)
        // Base should get ~5V through 1k resistor, emitter ~0V
        expect(vBE).toBeGreaterThan(0.5);
    });

    it('should turn transistor OFF when base switch is OPEN', () => {
        const nPower = new CircuitNode(0, 0);
        const nGround = new CircuitNode(0, 100);
        const nAfterSwitch = new CircuitNode(50, 0);
        const nBase = new CircuitNode(100, 0);
        const nEmitter = new CircuitNode(100, 100);
        const nCollector = new CircuitNode(100, -50);

        const battery = new Battery(nPower, nGround);
        (battery as any).voltage = 5;

        const sw = new Switch(nPower, nAfterSwitch);
        sw.param = 0; // OPEN

        const baseResistor = new Resistor(nAfterSwitch, nBase);
        (baseResistor as any).resistance = 1000;

        const transistor = new Transistor(nEmitter, nCollector);
        transistor.n3 = nBase;
        nBase.connections.push(transistor);

        const groundWire = new Wire(nEmitter, nGround);

        const components = [battery, sw, baseResistor, transistor, groundWire];
        const nodes = [nPower, nGround, nAfterSwitch, nBase, nEmitter, nCollector];

        components.forEach(connect);
        runSimulation(nodes, components);

        const vBE = nBase.voltage - nEmitter.voltage;

        // With switch open, base is floating → V_BE should be near 0
        expect(vBE).toBeLessThan(0.6);
    });

    it('should toggle transistor state when switch changes', () => {
        const nPower = new CircuitNode(0, 0);
        const nGround = new CircuitNode(0, 100);
        const nAfterSwitch = new CircuitNode(50, 0);
        const nBase = new CircuitNode(100, 0);
        const nEmitter = new CircuitNode(100, 100);
        const nCollector = new CircuitNode(100, -50);

        const battery = new Battery(nPower, nGround);
        (battery as any).voltage = 5;

        const sw = new Switch(nPower, nAfterSwitch);
        sw.param = 0; // Start OPEN

        const baseResistor = new Resistor(nAfterSwitch, nBase);
        (baseResistor as any).resistance = 1000;

        const transistor = new Transistor(nEmitter, nCollector);
        transistor.n3 = nBase;
        nBase.connections.push(transistor);

        const groundWire = new Wire(nEmitter, nGround);

        const components = [battery, sw, baseResistor, transistor, groundWire];
        const nodes = [nPower, nGround, nAfterSwitch, nBase, nEmitter, nCollector];

        components.forEach(connect);

        // Initially OPEN
        runSimulation(nodes, components);
        expect(nBase.voltage - nEmitter.voltage).toBeLessThan(0.6);

        // Close switch
        sw.param = 1;
        runSimulation(nodes, components);
        expect(nBase.voltage - nEmitter.voltage).toBeGreaterThan(0.5);

        // Open switch again
        sw.param = 0;
        runSimulation(nodes, components);
        expect(nBase.voltage - nEmitter.voltage).toBeLessThan(0.6);
    });
});

