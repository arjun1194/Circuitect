/**
 * Circuit Architect - Game Configuration
 * Constants
 */
export const GRID_SIZE: number = 25;
export const UPDATE_ITERATIONS: number = 5;
export const PARTICLE_SPEED_FACTOR: number = 0.5;
export const DEFAULT_BATTERY_VOLTAGE: number = 9;
export const STORAGE_KEY: string = 'circuit_architect_save';

// Component Types Enum
export const TYPES = {
    WIRE: 'WIRE',
    RESISTOR: 'RESISTOR',
    BATTERY: 'BATTERY',
    LED: 'LED',
    SWITCH: 'SWITCH',
    CAPACITOR: 'CAPACITOR', // Future
    TRANSISTOR: 'TRANSISTOR',
    CHIP: 'CHIP'
} as const;

export type ComponentType = typeof TYPES[keyof typeof TYPES];
