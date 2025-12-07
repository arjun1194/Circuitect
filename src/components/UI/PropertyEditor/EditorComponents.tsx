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
