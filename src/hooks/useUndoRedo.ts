/**
 * useUndoRedo - Custom hook for managing undo/redo state
 * 
 * Uses a history stack of serialized circuit states to enable
 * reverting and redoing component changes.
 */

import { useRef, useCallback } from 'react';
import { SerializedCircuit, serializeCircuit, deserializeCircuit } from '../utils/CircuitSerializer';
import { CircuitNode, AbstractComponent } from '../engine/Physics';

const MAX_HISTORY_SIZE = 50;

export interface UndoRedoState {
    canUndo: boolean;
    canRedo: boolean;
}

export interface UndoRedoController {
    /** Save current circuit state to history */
    pushState: (nodes: CircuitNode[], components: AbstractComponent[]) => void;
    /** Undo to previous state, returns the restored state or null */
    undo: () => { nodes: CircuitNode[]; components: AbstractComponent[] } | null;
    /** Redo to next state, returns the restored state or null */
    redo: () => { nodes: CircuitNode[]; components: AbstractComponent[] } | null;
    /** Check if undo is available */
    canUndo: () => boolean;
    /** Check if redo is available */
    canRedo: () => boolean;
    /** Clear all history */
    clearHistory: () => void;
}

interface HistoryState {
    stack: SerializedCircuit[];
    index: number;  // Points to current state (-1 means no history)
}

export function useUndoRedo(): UndoRedoController {
    const historyRef = useRef<HistoryState>({
        stack: [],
        index: -1
    });

    const pushState = useCallback((nodes: CircuitNode[], components: AbstractComponent[]) => {
        const history = historyRef.current;
        const serialized = serializeCircuit(nodes, components);

        // If we're not at the end, truncate the redo stack
        if (history.index < history.stack.length - 1) {
            history.stack = history.stack.slice(0, history.index + 1);
        }

        // Add new state
        history.stack.push(serialized);
        history.index = history.stack.length - 1;

        // Limit history size
        if (history.stack.length > MAX_HISTORY_SIZE) {
            history.stack.shift();
            history.index--;
        }
    }, []);

    const undo = useCallback((): { nodes: CircuitNode[]; components: AbstractComponent[] } | null => {
        const history = historyRef.current;

        if (history.index <= 0) {
            // At the beginning or no history - restore to empty state
            if (history.index === 0) {
                history.index = -1;
                return { nodes: [], components: [] };
            }
            return null;
        }

        history.index--;
        const state = history.stack[history.index];
        return deserializeCircuit(state);
    }, []);

    const redo = useCallback((): { nodes: CircuitNode[]; components: AbstractComponent[] } | null => {
        const history = historyRef.current;

        if (history.index >= history.stack.length - 1) {
            return null;  // Nothing to redo
        }

        history.index++;
        const state = history.stack[history.index];
        return deserializeCircuit(state);
    }, []);

    const canUndo = useCallback((): boolean => {
        return historyRef.current.index >= 0;
    }, []);

    const canRedo = useCallback((): boolean => {
        const history = historyRef.current;
        return history.index < history.stack.length - 1;
    }, []);

    const clearHistory = useCallback(() => {
        historyRef.current = {
            stack: [],
            index: -1
        };
    }, []);

    return {
        pushState,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory
    };
}
