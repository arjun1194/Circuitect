import { Undo2, Redo2 } from 'lucide-react';

interface UndoRedoButtonsProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export default function UndoRedoButtons({
    onUndo,
    onRedo,
    canUndo,
    canRedo
}: UndoRedoButtonsProps) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded transition-colors ${canUndo
                        ? 'text-[#7aa2f7] hover:bg-[#2f3549] active:scale-95'
                        : 'text-[#414868] cursor-not-allowed'
                    }`}
                title="Undo (Ctrl+Z)"
            >
                <Undo2 size={18} />
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded transition-colors ${canRedo
                        ? 'text-[#7aa2f7] hover:bg-[#2f3549] active:scale-95'
                        : 'text-[#414868] cursor-not-allowed'
                    }`}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo2 size={18} />
            </button>
        </div>
    );
}
