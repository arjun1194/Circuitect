import { EditorInput } from './EditorComponents';

interface ResistorEditorProps {
    resistance: number;
    onChange: (field: string, value: any) => void;
}

export default function ResistorEditor({ resistance, onChange }: ResistorEditorProps) {
    return (
        <EditorInput
            label="Resistance"
            type="number"
            value={resistance}
            onChange={(v) => onChange('resistance', v)}
            unit="Ω"
        />
    );
}
