/**
 * Circuit Serializer
 * Handles serialization and deserialization of circuit data for export/import
 */

import { CircuitNode, AbstractComponent } from '../engine/Physics';
import { ComponentFactory } from '../engine/ComponentFactory';
import { ComponentType, TYPES } from '../config/gameConfig';

// Serialized data structures
export interface SerializedNode {
    id: number;
    x: number;
    y: number;
}

export interface SerializedComponent {
    type: ComponentType;
    n1Id: number;
    n2Id: number;
    n3Id?: number;
    properties?: Record<string, unknown>;
}

export interface SerializedCircuit {
    version: 1;
    nodes: SerializedNode[];
    components: SerializedComponent[];
}

/**
 * Extracts component-specific properties for serialization
 */
function getComponentProperties(component: AbstractComponent): Record<string, unknown> | undefined {
    const props: Record<string, unknown> = {};

    // Extract type-specific properties
    switch (component.type) {
        case TYPES.RESISTOR:
            props.resistance = (component as any).resistance;
            break;
        case TYPES.CAPACITOR:
            props.capacitance = (component as any).capacitance;
            break;
        case TYPES.BATTERY:
            props.voltage = (component as any).voltage;
            break;
        case TYPES.LED:
            props.ledColor = (component as any).ledColor;
            break;
        case TYPES.SWITCH:
            props.param = component.param;
            break;
        case TYPES.CHIP:
            props.logic = (component as any).logic;
            break;
    }

    return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Applies component-specific properties after deserialization
 */
function applyComponentProperties(
    component: AbstractComponent,
    properties?: Record<string, unknown>
): void {
    if (!properties) return;

    switch (component.type) {
        case TYPES.RESISTOR:
            if (properties.resistance !== undefined) {
                (component as any).resistance = properties.resistance;
            }
            break;
        case TYPES.CAPACITOR:
            if (properties.capacitance !== undefined) {
                (component as any).capacitance = properties.capacitance;
            }
            break;
        case TYPES.BATTERY:
            if (properties.voltage !== undefined) {
                (component as any).voltage = properties.voltage;
            }
            break;
        case TYPES.LED:
            if (properties.ledColor !== undefined) {
                (component as any).ledColor = properties.ledColor;
            }
            break;
        case TYPES.SWITCH:
            if (properties.param !== undefined) {
                component.param = properties.param as number;
            }
            break;
        case TYPES.CHIP:
            if (properties.logic !== undefined) {
                (component as any).logic = properties.logic;
            }
            break;
    }
}

/**
 * Serializes circuit state to a JSON-compatible object
 */
export function serializeCircuit(
    nodes: CircuitNode[],
    components: AbstractComponent[]
): SerializedCircuit {
    // Create node ID map (index-based)
    const nodeIdMap = new Map<CircuitNode, number>();
    nodes.forEach((node, index) => {
        nodeIdMap.set(node, index);
    });

    // Serialize nodes
    const serializedNodes: SerializedNode[] = nodes.map((node, index) => ({
        id: index,
        x: node.x,
        y: node.y
    }));

    // Serialize components
    const serializedComponents: SerializedComponent[] = components.map(comp => {
        const serialized: SerializedComponent = {
            type: comp.type,
            n1Id: nodeIdMap.get(comp.n1) ?? -1,
            n2Id: nodeIdMap.get(comp.n2) ?? -1
        };

        // Handle transistor base node
        if (comp.n3) {
            serialized.n3Id = nodeIdMap.get(comp.n3);
        }

        // Add component-specific properties
        const properties = getComponentProperties(comp);
        if (properties) {
            serialized.properties = properties;
        }

        return serialized;
    });

    return {
        version: 1,
        nodes: serializedNodes,
        components: serializedComponents
    };
}

/**
 * Deserializes circuit data from a JSON object
 * Returns the reconstructed nodes and components
 */
export function deserializeCircuit(
    data: SerializedCircuit
): { nodes: CircuitNode[]; components: AbstractComponent[] } {
    // Validate version
    if (data.version !== 1) {
        throw new Error(`Unsupported circuit format version: ${data.version}`);
    }

    // Reconstruct nodes
    const nodes: CircuitNode[] = data.nodes.map(serializedNode => {
        return new CircuitNode(serializedNode.x, serializedNode.y);
    });

    // Reconstruct components
    const components: AbstractComponent[] = data.components.map(serializedComp => {
        const n1 = nodes[serializedComp.n1Id];
        const n2 = nodes[serializedComp.n2Id];

        if (!n1 || !n2) {
            throw new Error(`Invalid node reference in component: n1=${serializedComp.n1Id}, n2=${serializedComp.n2Id}`);
        }

        const component = ComponentFactory.create(serializedComp.type, n1, n2);

        // Handle transistor base node
        if (serializedComp.n3Id !== undefined) {
            const n3 = nodes[serializedComp.n3Id];
            if (n3) {
                component.n3 = n3;
                n3.connections.push(component);
            }
        }

        // Apply component-specific properties
        applyComponentProperties(component, serializedComp.properties);

        // Add component to node connections
        n1.connections.push(component);
        n2.connections.push(component);

        return component;
    });

    return { nodes, components };
}

/**
 * Serializes circuit to a JSON string
 */
export function circuitToJson(
    nodes: CircuitNode[],
    components: AbstractComponent[]
): string {
    const data = serializeCircuit(nodes, components);
    return JSON.stringify(data, null, 2);
}

/**
 * Deserializes circuit from a JSON string
 */
export function circuitFromJson(
    json: string
): { nodes: CircuitNode[]; components: AbstractComponent[] } {
    const data = JSON.parse(json) as SerializedCircuit;
    return deserializeCircuit(data);
}
