
import clsx from 'clsx';
import { Wrench, Zap } from 'lucide-react';

interface FloatingControlsProps {
    currentMode: string;
    onSetMode: (mode: string) => void;
}

export default function FloatingControls({ currentMode, onSetMode }: FloatingControlsProps) {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#24283b] p-1.5 rounded-full border border-[#414868] shadow-2xl flex gap-1 z-50">
            <button
                onClick={() => onSetMode('build')}
                className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                    currentMode === 'build'
                        ? "bg-[#7aa2f7] text-[#1a1c23] shadow-lg scale-105"
                        : "text-[#9aa5ce] hover:bg-[#2f3549] hover:text-white"
                )}
            >
                <Wrench size={18} />
                Build
            </button>
            <div className="w-px bg-[#414868] my-2"></div>
            <button
                onClick={() => onSetMode('measure')}
                className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                    currentMode === 'measure'
                        ? "bg-[#e0af68] text-[#1a1c23] shadow-lg scale-105"
                        : "text-[#9aa5ce] hover:bg-[#2f3549] hover:text-white"
                )}
            >
                <Zap size={18} />
                Measure
            </button>
        </div>
    );
}
