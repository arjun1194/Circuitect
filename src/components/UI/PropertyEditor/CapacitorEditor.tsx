import { EditorInput } from './EditorComponents';

interface CapacitorEditorProps {
    capacitance: number;
    onChange: (field: string, value: any) => void;
}

export default function CapacitorEditor({ capacitance, onChange }: CapacitorEditorProps) {
    return (
        <EditorInput
            label="Capacitance"
            type="number"
            value={capacitance}
            onChange={(v) => onChange('capacitance', v)}
            unit="µF"
        />
    );
}
