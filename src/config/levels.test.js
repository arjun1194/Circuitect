import { describe, it, expect } from 'vitest';
import { LEVELS } from '../config/levels';
import { TYPES } from '../config/gameConfig';

// Mock Component helper
const createComp = (type, props = {}) => ({ type, ...props });

describe('Level Validation Logic', () => {
    describe('Level 1: The Closed Loop', () => {
        const level = LEVELS[0];
        it('should pass if LED is on', () => {
            // param: 1 means ON for LED (set by physics)
            const components = [
                createComp(TYPES.BATTERY),
                createComp(TYPES.WIRE),
                createComp(TYPES.LED, { param: 1 })
            ];
            expect(level.check(components)).toBe(true);
        });

        it('should fail if LED is off', () => {
            const components = [
                createComp(TYPES.BATTERY),
                createComp(TYPES.LED, { param: 0 })
            ];
            expect(level.check(components)).toBe(false);
        });
    });

    describe('Level 2: Control with a Switch', () => {
        const level = LEVELS[1];
        it('should pass if LED is on AND Switch exists', () => {
            const components = [
                createComp(TYPES.BATTERY),
                createComp(TYPES.SWITCH),
                createComp(TYPES.LED, { param: 1 })
            ];
            expect(level.check(components)).toBe(true);
        });

        it('should fail if Switch is missing', () => {
            const components = [
                createComp(TYPES.BATTERY),
                createComp(TYPES.LED, { param: 1 })
            ];
            // Level 2 requires a switch component to be present? 
            // "check: (components) => components.some(...) && components.some(SWITCH)"
            expect(level.check(components)).toBe(false);
        });
    });

    // We can add similar tests for other levels...
    describe('Level 8: AND Gate', () => {
        // Index 7
        const level = LEVELS[7];
        it('should pass if 2 switches exist', () => {
            const components = [
                createComp(TYPES.SWITCH),
                createComp(TYPES.SWITCH),
                createComp(TYPES.LED)
            ];
            expect(level.check(components)).toBe(true);
        });

        it('should fail if only 1 switch', () => {
            const components = [
                createComp(TYPES.SWITCH),
                createComp(TYPES.LED)
            ];
            expect(level.check(components)).toBe(false);
        });
    });
});
