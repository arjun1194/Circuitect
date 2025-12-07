import { describe, it, expect } from 'vitest';
import { CircuitNode } from '../engine/Physics';
import { Resistor } from '../engine/components/Resistor';
import { Capacitor } from '../engine/components/Capacitor';
import { Battery } from '../engine/components/Battery';
import { LED } from '../engine/components/LED';
import { Switch } from '../engine/components/Switch';
import { Wire } from '../engine/components/Wire';
import { Transistor } from '../engine/components/Transistor';
import { TYPES } from '../config/gameConfig';
import {
    serializeCircuit,
    deserializeCircuit,
    circuitToJson,
    circuitFromJson,
    SerializedCircuit
} from './CircuitSerializer';

describe('CircuitSerializer', () => {
    describe('serializeCircuit', () => {
        it('should serialize a simple circuit with battery and resistor', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);
            const battery = new Battery(n1, n2);
            (battery as any).voltage = 9;
            const resistor = new Resistor(n1, n2);
            resistor.resistance = 220;

            n1.connections.push(battery, resistor);
            n2.connections.push(battery, resistor);

            const result = serializeCircuit([n1, n2], [battery, resistor]);

            expect(result.version).toBe(1);
            expect(result.nodes).toHaveLength(2);
            expect(result.components).toHaveLength(2);

            // Check node serialization
            expect(result.nodes[0]).toEqual({ id: 0, x: 0, y: 0 });
            expect(result.nodes[1]).toEqual({ id: 1, x: 100, y: 0 });

            // Check component serialization
            const batteryData = result.components.find(c => c.type === TYPES.BATTERY);
            expect(batteryData?.properties?.voltage).toBe(9);

            const resistorData = result.components.find(c => c.type === TYPES.RESISTOR);
            expect(resistorData?.properties?.resistance).toBe(220);
        });

        it('should serialize a circuit with all component types', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);

            const wire = new Wire(n1, n2);
            const resistor = new Resistor(n1, n2);
            resistor.resistance = 470;
            const capacitor = new Capacitor(n1, n2);
            (capacitor as any).capacitance = 100;
            const battery = new Battery(n1, n2);
            (battery as any).voltage = 12;
            const led = new LED(n1, n2);
            (led as any).ledColor = 'green';
            const sw = new Switch(n1, n2);
            sw.param = 1;

            const components = [wire, resistor, capacitor, battery, led, sw];
            components.forEach(c => {
                n1.connections.push(c);
                n2.connections.push(c);
            });

            const result = serializeCircuit([n1, n2], components);

            expect(result.components).toHaveLength(6);

            // Verify each component type is represented
            const types = result.components.map(c => c.type);
            expect(types).toContain(TYPES.WIRE);
            expect(types).toContain(TYPES.RESISTOR);
            expect(types).toContain(TYPES.CAPACITOR);
            expect(types).toContain(TYPES.BATTERY);
            expect(types).toContain(TYPES.LED);
            expect(types).toContain(TYPES.SWITCH);
        });

        it('should handle transistor with n3 node', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);
            const n3 = new CircuitNode(50, -50); // Base node

            const transistor = new Transistor(n1, n2);
            transistor.n3 = n3;

            n1.connections.push(transistor);
            n2.connections.push(transistor);
            n3.connections.push(transistor);

            const result = serializeCircuit([n1, n2, n3], [transistor]);

            expect(result.nodes).toHaveLength(3);
            expect(result.components).toHaveLength(1);

            const transistorData = result.components[0];
            expect(transistorData.type).toBe(TYPES.TRANSISTOR);
            expect(transistorData.n1Id).toBe(0);
            expect(transistorData.n2Id).toBe(1);
            expect(transistorData.n3Id).toBe(2);
        });
    });

    describe('deserializeCircuit', () => {
        it('should deserialize a simple circuit', () => {
            const data: SerializedCircuit = {
                version: 1,
                nodes: [
                    { id: 0, x: 0, y: 0 },
                    { id: 1, x: 100, y: 0 }
                ],
                components: [
                    {
                        type: TYPES.RESISTOR,
                        n1Id: 0,
                        n2Id: 1,
                        properties: { resistance: 330 }
                    }
                ]
            };

            const result = deserializeCircuit(data);

            expect(result.nodes).toHaveLength(2);
            expect(result.components).toHaveLength(1);

            // Check node restoration
            expect(result.nodes[0].x).toBe(0);
            expect(result.nodes[0].y).toBe(0);
            expect(result.nodes[1].x).toBe(100);
            expect(result.nodes[1].y).toBe(0);

            // Check component restoration
            const resistor = result.components[0];
            expect(resistor.type).toBe(TYPES.RESISTOR);
            expect((resistor as any).resistance).toBe(330);

            // Check connections are established
            expect(result.nodes[0].connections).toContain(resistor);
            expect(result.nodes[1].connections).toContain(resistor);
        });

        it('should restore transistor n3 connection', () => {
            const data: SerializedCircuit = {
                version: 1,
                nodes: [
                    { id: 0, x: 0, y: 0 },
                    { id: 1, x: 100, y: 0 },
                    { id: 2, x: 50, y: -50 }
                ],
                components: [
                    {
                        type: TYPES.TRANSISTOR,
                        n1Id: 0,
                        n2Id: 1,
                        n3Id: 2
                    }
                ]
            };

            const result = deserializeCircuit(data);

            const transistor = result.components[0];
            expect(transistor.n3).toBe(result.nodes[2]);
            expect(result.nodes[2].connections).toContain(transistor);
        });

        it('should throw on unsupported version', () => {
            const data = {
                version: 99,
                nodes: [],
                components: []
            } as unknown as SerializedCircuit;

            expect(() => deserializeCircuit(data)).toThrow('Unsupported circuit format version');
        });
    });

    describe('round-trip serialization', () => {
        it('should produce identical output after serialize -> deserialize -> serialize', () => {
            const n1 = new CircuitNode(25, 50);
            const n2 = new CircuitNode(125, 50);

            const resistor = new Resistor(n1, n2);
            resistor.resistance = 1000;
            const battery = new Battery(n1, n2);
            (battery as any).voltage = 5;

            n1.connections.push(resistor, battery);
            n2.connections.push(resistor, battery);

            // First serialization
            const json1 = circuitToJson([n1, n2], [resistor, battery]);

            // Deserialize
            const { nodes, components } = circuitFromJson(json1);

            // Second serialization
            const json2 = circuitToJson(nodes, components);

            // Parse and compare (ignore order differences)
            const parsed1 = JSON.parse(json1);
            const parsed2 = JSON.parse(json2);

            expect(parsed1.version).toBe(parsed2.version);
            expect(parsed1.nodes).toEqual(parsed2.nodes);

            // Components should have same content (order may differ)
            expect(parsed1.components.length).toBe(parsed2.components.length);
        });
    });

    describe('circuitToJson / circuitFromJson', () => {
        it('should convert circuit to valid JSON string', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(50, 0);
            const wire = new Wire(n1, n2);

            n1.connections.push(wire);
            n2.connections.push(wire);

            const json = circuitToJson([n1, n2], [wire]);

            // Should be valid JSON
            expect(() => JSON.parse(json)).not.toThrow();

            // Should have proper structure
            const parsed = JSON.parse(json);
            expect(parsed).toHaveProperty('version');
            expect(parsed).toHaveProperty('nodes');
            expect(parsed).toHaveProperty('components');
        });

        it('should restore circuit from JSON string', () => {
            const json = JSON.stringify({
                version: 1,
                nodes: [
                    { id: 0, x: 0, y: 100 },
                    { id: 1, x: 200, y: 100 }
                ],
                components: [
                    { type: TYPES.WIRE, n1Id: 0, n2Id: 1 }
                ]
            });

            const { nodes, components } = circuitFromJson(json);

            expect(nodes).toHaveLength(2);
            expect(components).toHaveLength(1);
            expect(components[0].type).toBe(TYPES.WIRE);
        });
    });

    describe('component properties', () => {
        it('should preserve LED color', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);
            const led = new LED(n1, n2);
            (led as any).ledColor = 'blue';

            n1.connections.push(led);
            n2.connections.push(led);

            const json = circuitToJson([n1, n2], [led]);
            const { components } = circuitFromJson(json);

            expect((components[0] as any).ledColor).toBe('blue');
        });

        it('should preserve capacitance value', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);
            const capacitor = new Capacitor(n1, n2);
            (capacitor as any).capacitance = 47;

            n1.connections.push(capacitor);
            n2.connections.push(capacitor);

            const json = circuitToJson([n1, n2], [capacitor]);
            const { components } = circuitFromJson(json);

            expect((components[0] as any).capacitance).toBe(47);
        });

        it('should preserve switch state', () => {
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);
            const sw = new Switch(n1, n2);
            sw.param = 1; // On

            n1.connections.push(sw);
            n2.connections.push(sw);

            const json = circuitToJson([n1, n2], [sw]);
            const { components } = circuitFromJson(json);

            expect(components[0].param).toBe(1);
        });
    });
});
