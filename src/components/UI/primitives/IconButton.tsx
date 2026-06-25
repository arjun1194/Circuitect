import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Accessible name — applied as both aria-label and title (required). */
    label: string;
    active?: boolean;
    size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ label, active = false, size = 'md', className, children, ...props }, ref) => (
        <button
            ref={ref}
            aria-label={label}
            title={label}
            aria-pressed={active || undefined}
            className={clsx(
                'inline-flex items-center justify-center rounded-lg transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
                active ? 'bg-accent/15 text-accent' : 'text-muted hover:bg-surface-2 hover:text-text',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
);
IconButton.displayName = 'IconButton';
