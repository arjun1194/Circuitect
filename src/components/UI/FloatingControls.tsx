import clsx from 'clsx';
import { Wrench, Zap, Eraser, Bug } from 'lucide-react';
import { ToolMode } from '../../types';

interface FloatingControlsProps {
    currentMode: ToolMode;
    onSetMode: (mode: ToolMode) => void;
    showDebug?: boolean;
    onToggleDebug?: () => void;
}

type ModeDef = { mode: ToolMode; label: string; icon: typeof Wrench; activeClass: string };

const MODES: ModeDef[] = [
    { mode: ToolMode.BUILD, label: 'Build', icon: Wrench, activeClass: 'bg-accent/15 text-accent' },
    { mode: ToolMode.MEASURE, label: 'Measure', icon: Zap, activeClass: 'bg-warning/15 text-warning' },
    { mode: ToolMode.REMOVE, label: 'Erase', icon: Eraser, activeClass: 'bg-danger/15 text-danger' },
];

export default function FloatingControls({
    currentMode,
    onSetMode,
    showDebug,
    onToggleDebug,
}: FloatingControlsProps) {
    return (
        <div
            role="toolbar"
            aria-label="Canvas tools"
            className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md"
        >
            {MODES.map(({ mode, label, icon: Icon, activeClass }) => {
                const active = currentMode === mode;
                return (
                    <button
                        key={mode}
                        onClick={() => onSetMode(mode)}
                        aria-pressed={active}
                        className={clsx(
                            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                            active ? activeClass : 'text-muted hover:bg-surface-2 hover:text-text'
                        )}
                    >
                        <Icon size={17} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                );
            })}

            {onToggleDebug && (
                <>
                    <div className="mx-0.5 h-5 w-px bg-border" />
                    <button
                        onClick={onToggleDebug}
                        aria-pressed={showDebug}
                        aria-label="Circuit debugger"
                        title="Circuit debugger"
                        className={clsx(
                            'flex items-center rounded-full px-3 py-2 transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                            showDebug ? 'bg-purple/15 text-purple' : 'text-muted hover:bg-surface-2 hover:text-text'
                        )}
                    >
                        <Bug size={17} />
                    </button>
                </>
            )}
        </div>
    );
}
