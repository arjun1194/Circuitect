import { ReactNode, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { CircuitBoard, Play, MoreVertical, Eraser, Lightbulb, RotateCcw, PanelLeft } from 'lucide-react';
import ExportImportButtons from './ExportImportButtons';
import UndoRedoButtons from './UndoRedoButtons';
import { Button, IconButton, ThemeToggle } from './primitives';

interface HeaderProps {
    levelTitle: string;
    levelIndex: number;
    totalLevels: number;
    onTest: () => void;
    onClear: () => void;
    onShowSolution: () => void;
    onResetProgress: () => void;
    onExport: () => void;
    onImport: (json: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onOpenPalette: () => void;
}

interface MenuItem {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    danger?: boolean;
}

function OverflowMenu({ items }: { items: MenuItem[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <IconButton
                label="More actions"
                active={open}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                <MoreVertical size={18} />
            </IconButton>
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-border bg-surface p-1 shadow-2xl"
                >
                    {items.map((it) => (
                        <button
                            key={it.label}
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                it.onClick();
                            }}
                            className={clsx(
                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2',
                                it.danger ? 'text-danger' : 'text-text'
                            )}
                        >
                            <span className="shrink-0 text-faint">{it.icon}</span>
                            {it.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Header({
    levelTitle,
    levelIndex,
    totalLevels,
    onTest,
    onClear,
    onShowSolution,
    onResetProgress,
    onExport,
    onImport,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onOpenPalette,
}: HeaderProps) {
    const progress = totalLevels > 0 ? ((levelIndex + 1) / totalLevels) * 100 : 0;

    const menuItems: MenuItem[] = [
        { label: 'See solution', icon: <Lightbulb size={16} />, onClick: onShowSolution },
        { label: 'Clear board', icon: <Eraser size={16} />, onClick: onClear },
        { label: 'Reset progress', icon: <RotateCcw size={16} />, onClick: onResetProgress, danger: true },
    ];

    return (
        <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-surface px-3 sm:px-4">
            {/* Left: palette toggle (mobile) + brand + level */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <IconButton label="Open components" className="md:hidden" onClick={onOpenPalette}>
                    <PanelLeft size={18} />
                </IconButton>

                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast">
                        <CircuitBoard size={18} />
                    </div>
                    <span className="hidden text-[15px] font-medium text-text sm:block">Circuitect</span>
                </div>

                <div className="mx-1 hidden h-6 w-px bg-border md:block" />

                <div className="hidden min-w-0 md:block">
                    <div className="truncate text-[13px] font-medium text-text">{levelTitle}</div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-faint">
                            Level {levelIndex + 1} / {totalLevels}
                        </span>
                        <div className="h-[3px] w-20 overflow-hidden rounded-full bg-border">
                            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: theme, history, io, overflow, primary action */}
            <div className="flex items-center gap-1 sm:gap-1.5">
                <ThemeToggle />
                <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
                <UndoRedoButtons onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo} />
                <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
                <div className="hidden sm:block">
                    <ExportImportButtons onExport={onExport} onImport={onImport} />
                </div>
                <OverflowMenu items={menuItems} />
                <Button variant="primary" onClick={onTest} className="ml-1">
                    <Play size={15} />
                    <span className="hidden sm:inline">Test circuit</span>
                </Button>
            </div>
        </header>
    );
}
