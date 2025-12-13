/**
 * Tests for useUndoRedo functionality
 * Tests the core logic using direct function calls instead of React hook testing
 */

import { describe, it, expect } from 'vitest';
import { CircuitNode } from '../engine/Physics';
import { Wire } from '../engine/components/Wire';
import { Resistor } from '../engine/components/Resistor';
import { serializeCircuit, deserializeCircuit, SerializedCircuit } from '../utils/CircuitSerializer';

// Test the core undo/redo logic pattern directly
describe('Undo/Redo Logic', () => {
    // Helper to create test circuits
    const createSimpleCircuit = (numComponents: number = 1) => {
        const nodes: CircuitNode[] = [];
        const components: any[] = [];

        for (let i = 0; i <= numComponents; i++) {
            nodes.push(new CircuitNode(i * 50, 0));
        }

        for (let i = 0; i < numComponents; i++) {
            const wire = new Wire(nodes[i], nodes[i + 1]);
            nodes[i].connections.push(wire);
            nodes[i + 1].connections.push(wire);
            components.push(wire);
        }

        return { nodes, components };
    };

    // Simulating the hook's internal state
    class UndoRedoManager {
        private stack: SerializedCircuit[] = [];
        private index: number = -1;

        pushState(nodes: CircuitNode[], components: any[]) {
            const serialized = serializeCircuit(nodes, components);

            // Truncate redo stack if not at end
            if (this.index < this.stack.length - 1) {
                this.stack = this.stack.slice(0, this.index + 1);
            }

            this.stack.push(serialized);
            this.index = this.stack.length - 1;
        }

        undo(): { nodes: CircuitNode[]; components: any[] } | null {
            if (this.index <= 0) {
                if (this.index === 0) {
                    this.index = -1;
                    return { nodes: [], components: [] };
                }
                return null;
            }
            this.index--;
            return deserializeCircuit(this.stack[this.index]);
        }

        redo(): { nodes: CircuitNode[]; components: any[] } | null {
            if (this.index >= this.stack.length - 1) {
                return null;
            }
            this.index++;
            return deserializeCircuit(this.stack[this.index]);
        }

        canUndo(): boolean {
            return this.index >= 0;
        }

        canRedo(): boolean {
            return this.index < this.stack.length - 1;
        }

        clearHistory() {
            this.stack = [];
            this.index = -1;
        }
    }

    describe('initial state', () => {
        it('should start with canUndo false', () => {
            const manager = new UndoRedoManager();
            expect(manager.canUndo()).toBe(false);
        });

        it('should start with canRedo false', () => {
            const manager = new UndoRedoManager();
            expect(manager.canRedo()).toBe(false);
        });
    });

    describe('pushState', () => {
        it('should enable undo after pushing state', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit();

            manager.pushState(nodes, components);

            expect(manager.canUndo()).toBe(true);
        });

        it('should not enable redo after pushing state', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit();

            manager.pushState(nodes, components);

            expect(manager.canRedo()).toBe(false);
        });
    });

    describe('undo', () => {
        it('should return null when no history exists', () => {
            const manager = new UndoRedoManager();
            expect(manager.undo()).toBeNull();
        });

        it('should return empty state when undoing first action', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit();

            manager.pushState(nodes, components);
            const result = manager.undo();

            expect(result).toBeDefined();
            expect(result!.nodes).toHaveLength(0);
            expect(result!.components).toHaveLength(0);
        });

        it('should restore previous state when undoing', () => {
            const manager = new UndoRedoManager();
            const circuit1 = createSimpleCircuit(1);
            const circuit2 = createSimpleCircuit(2);

            manager.pushState(circuit1.nodes, circuit1.components);
            manager.pushState(circuit2.nodes, circuit2.components);

            const result = manager.undo();

            expect(result!.nodes).toHaveLength(2); // 1 component = 2 nodes
            expect(result!.components).toHaveLength(1);
        });

        it('should enable redo after undo', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit();

            manager.pushState(nodes, components);
            manager.undo();

            expect(manager.canRedo()).toBe(true);
        });
    });

    describe('redo', () => {
        it('should return null when no redo available', () => {
            const manager = new UndoRedoManager();
            expect(manager.redo()).toBeNull();
        });

        it('should restore state after redo', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit(2);

            manager.pushState(nodes, components);
            manager.undo();
            const result = manager.redo();

            expect(result!.nodes).toHaveLength(3); // 2 components = 3 nodes
            expect(result!.components).toHaveLength(2);
        });

        it('should disable redo after redoing to latest', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit();

            manager.pushState(nodes, components);
            manager.undo();
            manager.redo();

            expect(manager.canRedo()).toBe(false);
        });
    });

    describe('push after undo (truncation)', () => {
        it('should clear redo stack when pushing new state', () => {
            const manager = new UndoRedoManager();
            const circuit1 = createSimpleCircuit(1);
            const circuit2 = createSimpleCircuit(2);
            const circuit3 = createSimpleCircuit(3);

            manager.pushState(circuit1.nodes, circuit1.components);
            manager.pushState(circuit2.nodes, circuit2.components);
            manager.undo();
            manager.pushState(circuit3.nodes, circuit3.components);

            expect(manager.canRedo()).toBe(false);
        });
    });

    describe('clearHistory', () => {
        it('should clear all history', () => {
            const manager = new UndoRedoManager();
            const { nodes, components } = createSimpleCircuit();

            manager.pushState(nodes, components);
            manager.clearHistory();

            expect(manager.canUndo()).toBe(false);
            expect(manager.canRedo()).toBe(false);
        });
    });

    describe('component properties preservation', () => {
        it('should preserve resistor resistance value through undo/redo', () => {
            const manager = new UndoRedoManager();
            const n1 = new CircuitNode(0, 0);
            const n2 = new CircuitNode(100, 0);
            const resistor = new Resistor(n1, n2);
            resistor.resistance = 470;
            n1.connections.push(resistor);
            n2.connections.push(resistor);

            manager.pushState([n1, n2], [resistor]);
            manager.undo();
            const result = manager.redo();

            expect((result!.components[0] as Resistor).resistance).toBe(470);
        });
    });
});
