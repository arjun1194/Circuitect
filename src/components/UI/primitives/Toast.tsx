import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    notify: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
}

const ICONS = { success: CheckCircle, error: AlertTriangle, info: Info } as const;
const ACCENTS: Record<ToastType, string> = {
    success: 'text-success',
    error: 'text-danger',
    info: 'text-accent',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((list) => list.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback(
        (message: string, type: ToastType = 'info') => {
            const id = ++idRef.current;
            setToasts((list) => [...list, { id, type, message }]);
            window.setTimeout(() => dismiss(id), 4000);
        },
        [dismiss]
    );

    const value = useMemo(() => ({ notify }), [notify]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {createPortal(
                <div
                    className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2"
                    role="region"
                    aria-label="Notifications"
                    aria-live="polite"
                >
                    {toasts.map((t) => {
                        const Icon = ICONS[t.type];
                        return (
                            <div
                                key={t.id}
                                role="status"
                                className="flex min-w-[220px] max-w-sm items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-2xl"
                            >
                                <Icon size={18} className={clsx('shrink-0', ACCENTS[t.type])} />
                                <span className="flex-1 text-sm text-text">{t.message}</span>
                                <button
                                    aria-label="Dismiss notification"
                                    onClick={() => dismiss(t.id)}
                                    className="text-faint transition-colors hover:text-text"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}
