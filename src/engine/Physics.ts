import { ComponentType } from '../config/gameConfig';
import { solveCircuit } from './mnaSolver';


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
 * Run one step of circuit simulation.
 *
 * Solves the circuit with Modified Nodal Analysis (see mnaSolver.ts): an exact
 * matrix solve with SPICE-grade device models, replacing the previous iterative
 * relaxation. `dt` is the timestep used for capacitor transient behavior.
 */
export function physicsStep(nodes: CircuitNode[], components: AbstractComponent[], dt: number = 1 / 60) {
    solveCircuit(nodes, components, dt);
}
