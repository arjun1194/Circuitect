import { AlertTriangle } from 'lucide-react';
import { EditorSelect, EditorSlider } from './EditorComponents';

interface LEDEditorProps {
    ledColor: string;
    maxVoltage: number;
    burnt: boolean;
    onChange: (field: string, value: string | number) => void;
}

const LED_COLORS = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'white', label: 'White' },
];

export default function LEDEditor({ ledColor, maxVoltage, burnt, onChange }: LEDEditorProps) {
    return (
        <div>
            <EditorSelect
                label="Color"
                value={ledColor}
                options={LED_COLORS}
                onChange={(v) => onChange('ledColor', v)}
            />
            <EditorSlider
                label="Max voltage (V)"
                value={maxVoltage}
                min={1}
                max={12}
                step={0.5}
                onChange={(v) => onChange('maxVoltage', v)}
            />
            {burnt && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                    <AlertTriangle size={16} className="shrink-0" />
                    LED is burnt — replace it to fix.
                </div>
            )}
        </div>
    );
}
