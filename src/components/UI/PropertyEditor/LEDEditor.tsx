import { EditorSelect, EditorSlider } from './EditorComponents';

interface LEDEditorProps {
    ledColor: string;
    maxVoltage: number;
    burnt: boolean;
    onChange: (field: string, value: any) => void;
}

const LED_COLORS = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'white', label: 'White' }
];

export default function LEDEditor({ ledColor, maxVoltage, burnt, onChange }: LEDEditorProps) {
    return (
        <div className="space-y-4">
            <EditorSelect
                label="Color"
                value={ledColor}
                options={LED_COLORS}
                onChange={(v) => onChange('ledColor', v)}
            />
            <EditorSlider
                label="Max Voltage (V)"
                value={maxVoltage}
                min={1}
                max={12}
                step={0.5}
                onChange={(v) => onChange('maxVoltage', v)}
            />
            <div className="text-sm text-[#9aa5ce]">
                Rating: <span className="text-[#7aa2f7] font-bold">{maxVoltage}V</span>
            </div>
            {burnt && (
                <div className="bg-[#f7768e]/20 border border-[#f7768e] rounded px-3 py-2 text-sm text-[#f7768e] font-bold">
                    ⚠️ LED is burnt! Replace to fix.
                </div>
            )}
        </div>
    );
}
