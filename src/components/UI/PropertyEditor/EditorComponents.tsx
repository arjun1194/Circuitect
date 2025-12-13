interface EditorInputProps {
    label: string;
    type: 'number' | 'text';
    value: any;
    onChange: (value: any) => void;
    unit?: string;
}

export function EditorInput({ label, type, value, onChange, unit }: EditorInputProps) {
    return (
        <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">
                {label}{unit && ` (${unit})`}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
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
            <label className="block text-gray-400 text-xs mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            <label className="block text-gray-400 text-xs mb-1">
                {label}: <span className="text-[#7aa2f7]">{value}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-[#7aa2f7]"
            />
        </div>
    );
}
