import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-[background-color,filter,transform] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-accent-contrast hover:brightness-110 active:scale-[0.98]',
    secondary: 'bg-surface-2 text-text hover:bg-border-strong active:scale-[0.98]',
    ghost: 'text-muted hover:bg-surface-2 hover:text-text',
    outline: 'border border-border-strong text-text hover:bg-surface-2',
    danger: 'bg-danger text-white hover:brightness-110 active:scale-[0.98]',
};

const sizes: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'secondary', size = 'md', className, ...props }, ref) => (
        <button ref={ref} className={clsx(base, variants[variant], sizes[size], className)} {...props} />
    )
);
Button.displayName = 'Button';
