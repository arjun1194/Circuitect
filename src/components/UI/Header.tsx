import ExportImportButtons from './ExportImportButtons';
import UndoRedoButtons from './UndoRedoButtons';

interface HeaderProps {
    levelTitle: string;
    onReset: () => void;
    onClear: () => void;
    onNextLevel: () => void;
    onShowHints: () => void;
    onShowSolution: () => void;
    onResetProgress: () => void;
    onExport: () => void;
    onImport: (json: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isLastLevel: boolean;
    actionLabel?: string;
}

export default function Header({
    levelTitle,

    onClear,
    onNextLevel,
    onShowHints,
    onShowSolution,
    onResetProgress,
    onExport,
    onImport,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    isLastLevel,
    actionLabel
}: HeaderProps) {
    return (
        <div className="h-16 bg-[#24283b] flex items-center justify-between px-6 border-b border-[#333] shadow-md z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-[#c0caf5] font-bold text-xl tracking-wide">
                    Circuit Architect <span className="text-[#7aa2f7] text-sm ml-2 font-normal">React Edition</span>
                </h1>
                <div className="h-6 w-px bg-[#414868]"></div>
                <div className="text-[#9aa5ce] font-medium">
                    {levelTitle}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <UndoRedoButtons
                    onUndo={onUndo}
                    onRedo={onRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
                <div className="h-6 w-px bg-[#414868]"></div>
                <ExportImportButtons onExport={onExport} onImport={onImport} />
                <div className="h-6 w-px bg-[#414868]"></div>
                <button
                    onClick={onResetProgress}
                    className="px-3 py-1.5 text-xs text-[#565f89] border border-[#414868] rounded hover:bg-[#2f3549] transition-colors"
                >
                    Reset Progress
                </button>
                <div className="h-6 w-px bg-[#414868]"></div>
                <button
                    onClick={onClear}
                    className="bg-[#f7768e] text-white px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-transform active:scale-95"
                >
                    Clear Board
                </button>
                <button
                    onClick={onShowHints}
                    className="bg-transparent border border-[#7aa2f7] text-[#7aa2f7] px-4 py-2 rounded font-bold text-sm hover:bg-[#7aa2f7] hover:text-[#1a1c23] transition-colors"
                >
                    Show Hint
                </button>
                <button
                    onClick={onShowSolution}
                    className="bg-transparent border border-[#bb9af7] text-[#bb9af7] px-4 py-2 rounded font-bold text-sm hover:bg-[#bb9af7] hover:text-[#1a1c23] transition-colors"
                    title="Load the correct solution for this level"
                >
                    See Solution
                </button>
                <button
                    onClick={onNextLevel}
                    className="bg-[#e0af68] text-[#1a1c23] px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-transform active:scale-95 ml-2 shadow-[0_0_10px_rgba(224,175,104,0.3)]"
                >
                    {actionLabel || (isLastLevel ? 'Finish Game' : 'Next Level')}
                </button>
            </div>
        </div>
    );
}
