import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { IconButton } from './IconButton';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md';
    /** Hide the header close button (e.g. for forced-choice dialogs). */
    hideClose?: boolean;
    closeOnOverlay?: boolean;
}

const FOCUSABLE =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    size = 'sm',
    hideClose = false,
    closeOnOverlay = true,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const prevFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;
        prevFocus.current = document.activeElement as HTMLElement;
        const panel = panelRef.current;
        panel?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key === 'Tab' && panel) {
                const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                    (el) => !el.hasAttribute('disabled')
                );
                if (items.length === 0) {
                    e.preventDefault();
                    return;
                }
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', onKey, true);
        return () => {
            document.removeEventListener('keydown', onKey, true);
            prevFocus.current?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (closeOnOverlay && e.target === e.currentTarget) onClose();
            }}
            role="presentation"
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                className={clsx(
                    'w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl outline-none',
                    size === 'sm' ? 'max-w-sm' : 'max-w-lg'
                )}
            >
                {title && (
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <h2 className="text-base font-medium text-text">{title}</h2>
                        {!hideClose && (
                            <IconButton label="Close" size="sm" onClick={onClose}>
                                <X size={16} />
                            </IconButton>
                        )}
                    </div>
                )}
                <div className="px-5 py-4 text-sm leading-relaxed text-muted">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>
                )}
            </div>
        </div>,
        document.body
    );
}
