import { describe, it, expect } from 'vitest';
import { LEVELS } from './levels';
import { LEVEL_SOLUTIONS } from './solutions';
import { circuitFromJson } from '../utils/CircuitSerializer';
import { physicsStep } from '../engine/Physics';

/**
 * Every built-in "See Solution" circuit must actually satisfy its level's checker
 * under the MNA engine — otherwise the solution button would load a losing board.
 */
describe('Level solutions pass their checkers (MNA engine)', () => {
    LEVELS.forEach((level, i) => {
        it(`level ${i + 1} solution satisfies "${level.title}"`, () => {
            const solution = LEVEL_SOLUTIONS[i];
            expect(solution, `missing solution for level ${i + 1}`).toBeTruthy();
            const { nodes, components } = circuitFromJson(JSON.stringify(solution));
            for (let k = 0; k < 30; k++) physicsStep(nodes, components);
            expect(level.check(components)).toBe(true);
        });
    });
});
