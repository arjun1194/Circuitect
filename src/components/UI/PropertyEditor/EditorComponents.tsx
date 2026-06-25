import { useEffect, useState } from 'react';

const fieldClass =
    'w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-text outline-none transition-colors focus:border-accent';
const labelClass = 'mb-1.5 block text-xs font-medium text-muted';

interface EditorInputProps {
    label: string;
    type: 'number' | 'text';
    value: string | number;
    onChange: (value: string | number) => void;
    unit?: string;
    /** Minimum value for number inputs (defaults to 0). */
    min?: number;
}

export function EditorInput({ label, type, value, onChange, unit, min = 0 }: EditorInputProps) {
    if (type === 'number') {
        return <NumberInput label={label} value={Number(value)} onChange={onChange} unit={unit} min={min} />;
    }
    return (
        <div className="mb-4">
            <label className={labelClass}>
                {label}
                {unit && ` (${unit})`}
            </label>
            <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className={fieldClass}
            />
        </div>
    );
}

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    unit?: string;
    min: number;
}

/**
 * Number field that buffers keystrokes locally and commits a sanitized number on
 * blur/Enter, so an empty or partial value can never write NaN onto the model.
 */
function NumberInput({ label, value, onChange, unit, min }: NumberInputProps) {
    const [draft, setDraft] = useState(String(value ?? ''));

    useEffect(() => {
        setDraft(String(value ?? ''));
    }, [value]);

    const commit = () => {
        const parsed = parseFloat(draft);
        const safe = Number.isFinite(parsed) ? Math.max(min, parsed) : value ?? 0;
        onChange(safe);
        setDraft(String(safe));
    };

    return (
        <div className="mb-4">
            <label className={labelClass}>
                {label}
                {unit && ` (${unit})`}
            </label>
            <input
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                className={fieldClass}
            />
        </div>
    );
}

interface EditorSelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

export function EditorSelect({ label, value, options, onChange }: EditorSelectProps) {
    return (
        <div className="mb-4">
            <label className={labelClass}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface EditorSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}

export function EditorSlider({ label, value, min, max, step = 1, onChange }: EditorSliderProps) {
    return (
        <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
                {label}: <span className="font-mono text-accent">{value}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--c-accent)' }}
            />
        </div>
    );
}
