import { Level } from '../../config/levels';

interface LevelHUDProps {
    level: Level;
    levelIndex: number;
    hintsShown: number;
    onShowHint: () => void;
    children?: React.ReactNode; // For HintsPanel
}

export default function LevelHUD({ level, levelIndex, hintsShown, onShowHint, children }: LevelHUDProps) {
    return (
        <div className="absolute top-5 left-5 pointer-events-none z-10 max-w-md">
            <div className="bg-[#24283b]/95 border border-[#7aa2f7] p-5 rounded-xl shadow-2xl backdrop-blur-sm pointer-events-auto">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-[#7aa2f7]">{level.title}</h2>
                    <span className="text-xs text-[#565f89]">#{levelIndex + 1}</span>
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
