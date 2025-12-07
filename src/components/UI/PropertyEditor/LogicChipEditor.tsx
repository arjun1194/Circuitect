import { EditorSelect } from './EditorComponents';

interface LogicChipEditorProps {
    logic: string;
    onChange: (field: string, value: any) => void;
}

const GATE_TYPES = [
    { value: 'AND', label: 'AND Gate' },
    { value: 'OR', label: 'OR Gate' },
    { value: 'XOR', label: 'XOR Gate' },
    { value: 'NAND', label: 'NAND Gate' }
];

export default function LogicChipEditor({ logic, onChange }: LogicChipEditorProps) {
    return (
        <EditorSelect
            label="Gate Type"
            value={logic}
            options={GATE_TYPES}
            onChange={(v) => onChange('logic', v)}
        />
    );
}
