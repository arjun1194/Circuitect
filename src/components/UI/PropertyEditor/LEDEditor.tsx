import { EditorSelect } from './EditorComponents';

interface LEDEditorProps {
    ledColor: string;
    onChange: (field: string, value: any) => void;
}

const LED_COLORS = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'white', label: 'White' }
];

export default function LEDEditor({ ledColor, onChange }: LEDEditorProps) {
    return (
        <EditorSelect
            label="Color"
            value={ledColor}
            options={LED_COLORS}
            onChange={(v) => onChange('ledColor', v)}
        />
    );
}
