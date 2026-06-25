import { describe, it, expect } from 'vitest';
import { CircuitNode, physicsStep, AbstractComponent } from './Physics';
import { Battery, Switch, Resistor, Transistor } from './components';

/**
 * NPN transistor as a switch, in a proper common-emitter configuration:
 *   Vcc → Rc → collector;  emitter = ground;  base biased from Vcc via a switch.
 * With the MNA + Ebers–Moll engine the transistor conducts when the base is
 * driven (collector pulled low) and is off when the base is floating
 * (collector pulled up to Vcc).
 */
describe('Transistor switch (common-emitter)', () => {
    const build = (switchClosed: boolean) => {
        const nVcc = new CircuitNode(0, 0);
        const nGnd = new CircuitNode(0, 100);
        const nSw = new CircuitNode(50, 0);
        const nBase = new CircuitNode(100, 0);
        const nCol = new CircuitNode(100, -50);

        const battery = new Battery(nVcc, nGnd);
        battery.voltage = 5;
        const rc = new Resistor(nVcc, nCol);
        rc.resistance = 1000;
        const sw = new Switch(nVcc, nSw);
        sw.param = switchClosed ? 1 : 0;
        const rb = new Resistor(nSw, nBase);
        rb.resistance = 4700;
        const transistor = new Transistor(nGnd, nCol); // n1 = emitter (gnd), n2 = collector
        transistor.n3 = nBase;

        const nodes = [nVcc, nGnd, nSw, nBase, nCol];
        const components: AbstractComponent[] = [battery, rc, sw, rb, transistor];
        for (let i = 0; i < 5; i++) physicsStep(nodes, components);
        return { nBase, nGnd, nCol, transistor };
    };

    it('turns ON when the base switch is CLOSED (collector pulled low)', () => {
        const { nBase, nGnd, nCol } = build(true);
        expect(nBase.voltage - nGnd.voltage).toBeGreaterThan(0.5); // V_BE clamps ~0.7
        expect(nCol.voltage).toBeLessThan(2); // conducting / saturated
    });

    it('stays OFF when the base switch is OPEN (collector near Vcc)', () => {
        const { nBase, nGnd, nCol } = build(false);
        expect(nBase.voltage - nGnd.voltage).toBeLessThan(0.5);
        expect(nCol.voltage).toBeGreaterThan(4);
    });

    it('toggles collector state as the switch changes', () => {
        expect(build(true).nCol.voltage).toBeLessThan(2);
        expect(build(false).nCol.voltage).toBeGreaterThan(4);
    });
});
