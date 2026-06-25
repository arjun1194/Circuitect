import { describe, expect, it } from 'vitest';
import { getUndoRedoShortcutAction, isEditableShortcutTarget } from './keyboardShortcuts';

function keyEvent(
    overrides: Partial<Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey' | 'target'>>,
) {
    return {
        altKey: false,
        ctrlKey: false,
        key: '',
        metaKey: false,
        shiftKey: false,
        target: null,
        ...overrides,
    } as KeyboardEvent;
}

describe('keyboard shortcuts', () => {
    describe('getUndoRedoShortcutAction', () => {
        it('maps Command+Z to undo', () => {
            expect(getUndoRedoShortcutAction(keyEvent({ key: 'z', metaKey: true }))).toBe('undo');
        });

        it('maps Command+Shift+Z to redo', () => {
            expect(getUndoRedoShortcutAction(keyEvent({ key: 'Z', metaKey: true, shiftKey: true }))).toBe('redo');
        });

        it('also supports Ctrl+Z and Ctrl+Shift+Z', () => {
            expect(getUndoRedoShortcutAction(keyEvent({ key: 'z', ctrlKey: true }))).toBe('undo');
            expect(getUndoRedoShortcutAction(keyEvent({ key: 'z', ctrlKey: true, shiftKey: true }))).toBe('redo');
        });

        it('ignores non-Z shortcuts and Alt-modified chords', () => {
            expect(getUndoRedoShortcutAction(keyEvent({ key: 'x', metaKey: true }))).toBeNull();
            expect(getUndoRedoShortcutAction(keyEvent({ key: 'z', metaKey: true, altKey: true }))).toBeNull();
        });

        it('does not steal native undo from editable fields', () => {
            const input = { tagName: 'INPUT' } as EventTarget;

            expect(getUndoRedoShortcutAction(keyEvent({ key: 'z', metaKey: true, target: input }))).toBeNull();
        });
    });

    describe('isEditableShortcutTarget', () => {
        it('recognizes text-entry targets by tag name', () => {
            expect(isEditableShortcutTarget({ tagName: 'textarea' } as EventTarget)).toBe(true);
            expect(isEditableShortcutTarget({ tagName: 'select' } as EventTarget)).toBe(true);
        });

        it('recognizes contenteditable targets and descendants', () => {
            expect(isEditableShortcutTarget({ isContentEditable: true } as EventTarget)).toBe(true);
            expect(
                isEditableShortcutTarget({
                    closest: (selector: string) => (selector.includes('contenteditable') ? {} : null),
                } as EventTarget),
            ).toBe(true);
        });
    });
});
