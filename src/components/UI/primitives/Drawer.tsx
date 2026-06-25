import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    side?: 'left' | 'right' | 'bottom';
    children: ReactNode;
}

export function Drawer({ open, onClose, title, side = 'left', children }: DrawerProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const panelPos =
        side === 'left'
            ? 'left-0 top-0 h-full w-72 max-w-[85vw] border-r'
            : side === 'right'
              ? 'right-0 top-0 h-full w-80 max-w-[90vw] border-l'
              : 'left-0 right-0 bottom-0 max-h-[80vh] rounded-t-2xl border-t';

    return createPortal(
        <div
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-[2px]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={clsx('absolute flex flex-col border-border bg-surface shadow-2xl', panelPos)}
            >
                {title && (
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h2 className="text-sm font-medium text-text">{title}</h2>
                        <IconButton label="Close" size="sm" onClick={onClose}>
                            <X size={16} />
                        </IconButton>
                    </div>
                )}
                <div className="cx-scroll flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>,
        document.body
    );
}
