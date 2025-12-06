/**
 * Circuit Architect - State Management
 * Centralized state with localStorage persistence
 */

import { TYPES, STORAGE_KEY } from './config.js';

// Global game state
export const state = {
    nodes: [],
    components: [],
    width: 0,
    height: 0,
    selectedTool: TYPES.WIRE,
    isDragging: false,
    dragStart: null,
    mouseGrid: { x: 0, y: 0 },
    hoverNode: null,
    level: 0,
    won: false,
    toolMode: 'build',
    editingComponent: null,
    currentHintIndex: 0
};

/**
 * Save progress to localStorage
 * @param {number} completedLevel - The level that was just completed
 */
export function saveProgress(completedLevel) {
    try {
        const data = {
            completedLevel: completedLevel,
            timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log(`Progress saved: Level ${completedLevel + 1} completed`);
    } catch (e) {
        console.warn('Could not save progress:', e);
    }
}

/**
 * Load saved progress from localStorage
 * @returns {number} The next level to start from (0-indexed)
 */
export function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (typeof data.completedLevel === 'number' && data.completedLevel >= 0) {
                // Return next level (completedLevel + 1), capped at max level
                const nextLevel = Math.min(data.completedLevel + 1, 9);
                console.log(`Progress loaded: Starting at level ${nextLevel + 1}`);
                return nextLevel;
            }
        }
    } catch (e) {
        console.warn('Could not load progress:', e);
    }
    return 0; // Default to first level
}

/**
 * Reset all saved progress
 */
export function resetProgress() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Progress reset');
    } catch (e) {
        console.warn('Could not reset progress:', e);
    }
}

/**
 * Get the highest completed level
 * @returns {number} The highest completed level (0-indexed), or -1 if none
 */
export function getCompletedLevel() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (typeof data.completedLevel === 'number') {
                return data.completedLevel;
            }
        }
    } catch (e) {
        console.warn('Could not get completed level:', e);
    }
    return -1;
}
