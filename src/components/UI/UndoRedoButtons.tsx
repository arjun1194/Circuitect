import { Undo2, Redo2 } from 'lucide-react';
import { IconButton } from './primitives';

interface UndoRedoButtonsProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export default function UndoRedoButtons({ onUndo, onRedo, canUndo, canRedo }: UndoRedoButtonsProps) {
    return (
        <div className="flex items-center gap-0.5">
            <IconButton label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
                <Undo2 size={18} />
            </IconButton>
            <IconButton label="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={!canRedo}>
                <Redo2 size={18} />
            </IconButton>
        </div>
    );
}
