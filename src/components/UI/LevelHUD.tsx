import { useState } from 'react';
import { Level } from '../../config/levels';
import { X, ChevronDown } from 'lucide-react';

interface LevelHUDProps {
    level: Level;
    levelIndex: number;
    hintsShown: number;
    onShowHint: () => void;
    children?: React.ReactNode; // For HintsPanel
}

export default function LevelHUD({ level, levelIndex, hintsShown, onShowHint, children }: LevelHUDProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    if (isMinimized) {
        return (
            <div className="absolute top-5 left-5 pointer-events-none z-10">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-[#24283b]/95 border border-[#7aa2f7] px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto hover:bg-[#3b4261] transition-all flex items-center gap-2"
                >
                    <ChevronDown size={16} className="text-[#7aa2f7]" />
                    <span className="text-sm font-bold text-[#7aa2f7]">{level.title}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="absolute top-5 left-5 pointer-events-none z-10 max-w-md">
            <div className="bg-[#24283b]/95 border border-[#7aa2f7] p-5 rounded-xl shadow-2xl backdrop-blur-sm pointer-events-auto">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-[#7aa2f7]">{level.title}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#565f89]">#{levelIndex + 1}</span>
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="text-[#565f89] hover:text-[#f7768e] transition-colors"
                            title="Minimize"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <p className="text-sm text-[#a9b1d6] mb-3">{level.desc}</p>
                <div className="bg-[#1a1b26] p-3 rounded border-l-2 border-[#7dcfff]">
                    <p className="text-xs text-[#9aa5ce] italic">{level.theory}</p>
                </div>

                {/* Hints Section */}
                {children}

                {/* Show Hint Button */}
                {hintsShown < level.hints.length && (
                    <button
                        onClick={onShowHint}
                        className="mt-3 text-xs text-[#7aa2f7] hover:text-[#7dcfff] underline"
                    >
                        💡 Show Hint ({hintsShown}/{level.hints.length})
                    </button>
                )}
            </div>
        </div>
    );
}
