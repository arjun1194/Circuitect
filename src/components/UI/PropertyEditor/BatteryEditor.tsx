import { EditorInput } from './EditorComponents';

interface BatteryEditorProps {
    voltage: number;
    onChange: (field: string, value: any) => void;
}

export default function BatteryEditor({ voltage, onChange }: BatteryEditorProps) {
    return (
        <EditorInput
            label="Voltage"
            type="number"
            value={voltage}
            onChange={(v) => onChange('voltage', v)}
            unit="V"
        />
    );
}
