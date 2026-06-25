import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TYPES } from '../config/gameConfig';
import { physicsStep } from '../engine/Physics';
import {
    deserializeCircuit,
    SerializedCircuit,
    SerializedComponent,
    SerializedNode,
} from './CircuitSerializer';

type InputName = 'A' | 'B' | 'Cin';

interface LabeledNode extends SerializedNode {
    label?: string;
}

interface LabeledComponent extends SerializedComponent {
    properties?: Record<string, unknown> & {
        label?: string;
        param?: number;
    };
}

interface FullAdderFixture extends SerializedCircuit {
    nodes: LabeledNode[];
    components: LabeledComponent[];
}

const fixturePath = resolve(process.cwd(), 'full-adder-transistor.json');

function loadFixture(inputs: Record<InputName, 0 | 1>) {
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as FullAdderFixture;
    const switchStates: Record<string, 0 | 1> = {
        A_TRUE: inputs.A,
        A_FALSE: inputs.A === 1 ? 0 : 1,
        B_TRUE: inputs.B,
        B_FALSE: inputs.B === 1 ? 0 : 1,
        CIN_TRUE: inputs.Cin,
        CIN_FALSE: inputs.Cin === 1 ? 0 : 1,
    };

    for (const component of fixture.components) {
        if (component.type !== TYPES.SWITCH) continue;
        const label = component.properties?.label;
        if (label && label in switchStates) {
            component.properties = {
                ...component.properties,
                param: switchStates[label],
            };
        }
    }

    return {
        fixture,
        circuit: deserializeCircuit(fixture),
    };
}

function findComponentIndex(fixture: FullAdderFixture, label: string): number {
    const index = fixture.components.findIndex((component) => component.properties?.label === label);
    if (index < 0) throw new Error(`Missing fixture component: ${label}`);
    return index;
}

describe('transistor full-adder fixture', () => {
    it('uses only discrete circuit components', () => {
        const { fixture } = loadFixture({ A: 0, B: 0, Cin: 0 });

        expect(fixture.components.some((component) => component.type === TYPES.CHIP)).toBe(false);
        expect(fixture.components.filter((component) => component.type === TYPES.TRANSISTOR).length).toBe(7);
    });

    it.each([
        { A: 0, B: 0, Cin: 0, Sum: 0, Carry: 0 },
        { A: 0, B: 0, Cin: 1, Sum: 1, Carry: 0 },
        { A: 0, B: 1, Cin: 0, Sum: 1, Carry: 0 },
        { A: 0, B: 1, Cin: 1, Sum: 0, Carry: 1 },
        { A: 1, B: 0, Cin: 0, Sum: 1, Carry: 0 },
        { A: 1, B: 0, Cin: 1, Sum: 0, Carry: 1 },
        { A: 1, B: 1, Cin: 0, Sum: 0, Carry: 1 },
        { A: 1, B: 1, Cin: 1, Sum: 1, Carry: 1 },
    ] as const)('matches the full-adder truth table for A=$A B=$B Cin=$Cin', ({ A, B, Cin, Sum, Carry }) => {
        const { fixture, circuit } = loadFixture({ A, B, Cin });
        const sumLedIndex = findComponentIndex(fixture, 'SUM output indicator LED');
        const carryLedIndex = findComponentIndex(fixture, 'CARRY output indicator LED');

        for (let i = 0; i < 10; i++) {
            physicsStep(circuit.nodes, circuit.components);
        }

        const sumHigh = circuit.components[sumLedIndex].param > 0;
        const carryHigh = circuit.components[carryLedIndex].param > 0;

        expect(Number(sumHigh)).toBe(Sum);
        expect(Number(carryHigh)).toBe(Carry);
    });
});
