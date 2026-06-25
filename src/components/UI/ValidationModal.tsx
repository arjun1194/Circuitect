import { useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './primitives';

interface ValidationModalProps {
    success: boolean;
    message: string;
    onNext: () => void;
    onRetry: () => void;
    isLastLevel: boolean;
}

export default function ValidationModal({ success, message, onNext, onRetry, isLastLevel }: ValidationModalProps) {
    const actionRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        actionRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onRetry();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onRetry]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onRetry();
            }}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={success ? 'Circuit functional' : 'Test failed'}
                className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            >
                <div className="flex flex-col items-center text-center">
                    <div
                        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                            success ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                        }`}
                    >
                        {success ? <CheckCircle size={36} /> : <AlertTriangle size={36} />}
                    </div>

                    <h2 className="mb-2 text-xl font-medium text-text">
                        {success ? 'Circuit functional!' : 'Test failed'}
                    </h2>

                    <p className="mb-6 leading-relaxed text-muted">{message}</p>

                    <div className="flex w-full gap-3">
                        {success ? (
                            <Button ref={actionRef} variant="primary" className="flex-1 py-3" onClick={onNext}>
                                {isLastLevel ? 'Finish game' : 'Next level'}
                            </Button>
                        ) : (
                            <Button ref={actionRef} variant="secondary" className="flex-1 py-3" onClick={onRetry}>
                                Try again
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
