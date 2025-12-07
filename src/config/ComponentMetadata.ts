import { TYPES, ComponentType } from './gameConfig';

export interface ComponentMetadata {
    name: string;
    category: 'Basic' | 'Passive' | 'Active' | 'Power' | 'Control' | 'Output' | 'Abstraction';
    color: string;
    description?: string;
}

export const COMPONENT_METADATA: Record<ComponentType, ComponentMetadata> = {
    [TYPES.WIRE]: {
        name: 'Wire',
        category: 'Basic',
        color: '#565f89',
        description: 'Connects components'
    },
    [TYPES.RESISTOR]: {
        name: 'Resistor',
        category: 'Passive',
        color: '#d4af37',
        description: 'Limits current flow'
    },
    [TYPES.CAPACITOR]: {
        name: 'Capacitor',
        category: 'Passive',
        color: '#3d59a1',
        description: 'Stores charge'
    },
    [TYPES.BATTERY]: {
        name: 'Battery',
        category: 'Power',
        color: '#f7768e',
        description: 'Voltage source'
    },
    [TYPES.LED]: {
        name: 'LED',
        category: 'Output',
        color: '#f7768e',
        description: 'Light Emitting Diode'
    },
    [TYPES.SWITCH]: {
        name: 'Switch',
        category: 'Control',
        color: '#ff9e64',
        description: 'Toggle connection'
    },
    [TYPES.TRANSISTOR]: {
        name: 'Transistor',
        category: 'Active',
        color: '#9ece6a',
        description: 'NPN Transistor'
    },
    [TYPES.CHIP]: {
        name: 'Logic Chip',
        category: 'Abstraction',
        color: '#bb9af7',
        description: 'Digital Logic Gate'
    }
};
