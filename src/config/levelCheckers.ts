/**
 * Circuit Architect - Level Checker Functions
 * Validation logic for each level, separated from level configuration.
 */

import { AbstractComponent } from '../engine/Physics';
import { TYPES } from './gameConfig';

/**
 * Level 1: Check if any LED is lit (basic closed loop)
 */
export const checkClosedLoop = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.LED && c.param === 1);

/**
 * Level 2: Check for lit LED and presence of a switch
 */
export const checkSwitchControl = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.LED && c.param === 1) &&
    components.some(c => c.type === TYPES.SWITCH);

/**
 * Level 3: Check for resistor and lit LED
 */
export const checkCurrentLimiting = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.RESISTOR) &&
    components.some(c => c.type === TYPES.LED && c.param === 1);

/**
 * Level 4: Check for at least 2 lit LEDs (parallel circuit)
 */
export const checkParallelLEDs = (components: AbstractComponent[]): boolean =>
    components.filter(c => c.type === TYPES.LED && c.param === 1).length >= 2;

/**
 * Level 5: Check for capacitor presence
 */
export const checkCapacitor = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.CAPACITOR);

/**
 * Level 6: Check for transistor and lit LED
 */
export const checkTransistorSwitch = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.TRANSISTOR) &&
    components.some(c => c.type === TYPES.LED && c.param === 1);

/**
 * Level 7: Check for transistor (NOT gate building block)
 */
export const checkNotGate = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.TRANSISTOR);

/**
 * Level 8: Check for at least 2 switches (AND gate with switches)
 */
export const checkAndGateSwitches = (components: AbstractComponent[]): boolean =>
    components.filter(c => c.type === TYPES.SWITCH).length >= 2;

/**
 * Level 9: Check for XOR logic chip
 */
export const checkXorChip = (components: AbstractComponent[]): boolean =>
    components.some(c => c.type === TYPES.CHIP && (c as any).logic === 'XOR');

/**
 * Level 10: Check for both XOR and AND chips (half adder)
 */
export const checkHalfAdder = (components: AbstractComponent[]): boolean =>
    components.some(c => (c as any).logic === 'XOR') &&
    components.some(c => (c as any).logic === 'AND');
