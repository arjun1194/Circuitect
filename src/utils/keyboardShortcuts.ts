export type UndoRedoShortcutAction = 'undo' | 'redo';

type UndoRedoKeyboardEvent = Pick<
    KeyboardEvent,
    'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey' | 'target'
>;

const EDITABLE_TAGS = new Set(['input', 'select', 'textarea']);
const EDITABLE_SELECTOR = 'input, select, textarea, [contenteditable="true"], [contenteditable=""]';

function getTargetTagName(target: EventTarget | null): string {
    if (!target || typeof target !== 'object' || !('tagName' in target)) return '';
    return String(target.tagName).toLowerCase();
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
    if (!target || typeof target !== 'object') return false;

    if (EDITABLE_TAGS.has(getTargetTagName(target))) {
        return true;
    }

    if ('isContentEditable' in target && Boolean(target.isContentEditable)) {
        return true;
    }

    if ('closest' in target && typeof target.closest === 'function') {
        return Boolean(target.closest(EDITABLE_SELECTOR));
    }

    return false;
}

export function getUndoRedoShortcutAction(event: UndoRedoKeyboardEvent): UndoRedoShortcutAction | null {
    if (isEditableShortcutTarget(event.target)) return null;
    if (event.altKey) return null;
    if (!event.metaKey && !event.ctrlKey) return null;
    if (event.key.toLowerCase() !== 'z') return null;

    return event.shiftKey ? 'redo' : 'undo';
}
