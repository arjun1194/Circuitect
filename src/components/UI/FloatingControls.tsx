import clsx from 'clsx';
import { Wrench, Zap, Trash2, Bug } from 'lucide-react';
import { ToolMode } from '../../types';

interface FloatingControlsProps {
    currentMode: ToolMode;
    onSetMode: (mode: ToolMode) => void;
    showDebug?: boolean;
    onToggleDebug?: () => void;
}

export default function FloatingControls({ currentMode, onSetMode, showDebug, onToggleDebug }: FloatingControlsProps) {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#24283b] p-1.5 rounded-full border border-[#414868] shadow-2xl flex gap-1 z-50">
            <button
                onClick={() => onSetMode(ToolMode.BUILD)}
                className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                    currentMode === ToolMode.BUILD
                        ? "bg-[#7aa2f7] text-[#1a1c23] shadow-lg scale-105"
                        : "text-[#9aa5ce] hover:bg-[#2f3549] hover:text-white"
                )}
            >
                <Wrench size={18} />
                Build
            </button>
            <div className="w-px bg-[#414868] my-2"></div>
            <button
                onClick={() => onSetMode(ToolMode.MEASURE)}
                className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                    currentMode === ToolMode.MEASURE
                        ? "bg-[#e0af68] text-[#1a1c23] shadow-lg scale-105"
                        : "text-[#9aa5ce] hover:bg-[#2f3549] hover:text-white"
                )}
            >
                <Zap size={18} />
                Measure
            </button>
            <div className="w-px bg-[#414868] my-2"></div>
            <button
                onClick={() => onSetMode(ToolMode.REMOVE)}
                className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                    currentMode === ToolMode.REMOVE
                        ? "bg-[#f7768e] text-[#1a1c23] shadow-lg scale-105"
                        : "text-[#9aa5ce] hover:bg-[#2f3549] hover:text-white"
                )}
            >
                <Trash2 size={18} />
                Remove
            </button>
            {onToggleDebug && (
                <>
                    <div className="w-px bg-[#414868] my-2"></div>
                    <button
                        onClick={onToggleDebug}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-3 rounded-full font-bold transition-all",
                            showDebug
                                ? "bg-[#bb9af7] text-[#1a1c23] shadow-lg scale-105"
                                : "text-[#9aa5ce] hover:bg-[#2f3549] hover:text-white"
                        )}
                        title="Circuit Debugger"
                    >
                        <Bug size={18} />
                    </button>
                </>
            )}
        </div>
    );
}
