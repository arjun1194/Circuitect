import { useState } from 'react';
import { Level } from '../../config/levels';
import { Lightbulb, Minus, Plus } from 'lucide-react';
import { IconButton } from './primitives';

interface LevelHUDProps {
    level: Level;
    levelIndex: number;
    hintsShown: number;
    onShowHint: () => void;
    children?: React.ReactNode; // For HintsPanel
}

export default function LevelHUD({ level, levelIndex, hintsShown, onShowHint, children }: LevelHUDProps) {
    const [collapsed, setCollapsed] = useState(false);

    if (collapsed) {
        return (
            <div className="pointer-events-none absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
                <button
                    onClick={() => setCollapsed(false)}
                    className="pointer-events-auto flex items-center gap-2 rounded-xl border border-border bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-surface-2"
                >
                    <Plus size={15} className="text-accent" />
                    <span className="text-sm font-medium text-text">{level.title}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="pointer-events-none absolute left-3 top-3 z-10 w-[min(20rem,calc(100vw-1.5rem))] sm:left-4 sm:top-4">
            <div className="pointer-events-auto rounded-2xl border border-border bg-surface/90 p-4 shadow-2xl backdrop-blur-md">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-faint">
                            Level {levelIndex + 1}
                        </div>
                        <h2 className="text-base font-medium text-text">{level.title}</h2>
                    </div>
                    <IconButton label="Collapse objective" size="sm" onClick={() => setCollapsed(true)}>
                        <Minus size={16} />
                    </IconButton>
                </div>

                <p className="mb-3 text-sm leading-relaxed text-muted">{level.desc}</p>

                <div className="rounded-lg border-l-2 border-cyan bg-bg/60 p-3">
                    <p className="text-xs italic leading-relaxed text-faint">{level.theory}</p>
                </div>

                {/* Hints (HintsPanel) */}
                {children}

                {hintsShown < level.hints.length && (
                    <button
                        onClick={onShowHint}
                        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-warning transition-colors hover:brightness-110"
                    >
                        <Lightbulb size={14} />
                        Show hint ({hintsShown}/{level.hints.length})
                    </button>
                )}
            </div>
        </div>
    );
}
