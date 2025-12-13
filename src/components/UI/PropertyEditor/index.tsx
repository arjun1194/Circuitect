import { useState } from 'react';
import { AbstractComponent } from '../../../engine/Physics';
import { TYPES } from '../../../config/gameConfig';
import { X } from 'lucide-react';

import BatteryEditor from './BatteryEditor';
import ResistorEditor from './ResistorEditor';
import CapacitorEditor from './CapacitorEditor';
import LEDEditor from './LEDEditor';
import LogicChipEditor from './LogicChipEditor';

interface PropertyEditorProps {
    component: AbstractComponent;
    onClose: () => void;
}

export default function PropertyEditor({ component, onClose }: PropertyEditorProps) {
    const [, forceUpdate] = useState({});

    if (!component) return null;

    const handleChange = (field: string, value: any) => {
        (component as any)[field] = value;
        forceUpdate({});
    };

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#24283b] p-6 rounded-lg border border-[#7aa2f7] shadow-xl z-50 w-80">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Edit Component</h3>
                <button onClick={onClose} className="text-[#565f89] hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {component.type === TYPES.BATTERY && (
                <BatteryEditor
                    voltage={(component as any).voltage || 0}
                    onChange={handleChange}
                />
            )}

            {component.type === TYPES.RESISTOR && (
                <ResistorEditor
                    resistance={(component as any).resistance || 0}
                    onChange={handleChange}
                />
            )}

            {component.type === TYPES.CAPACITOR && (
                <CapacitorEditor
                    capacitance={(component as any).capacitance || 0}
                    onChange={handleChange}
                />
            )}

            {component.type === TYPES.LED && (
                <LEDEditor
                    ledColor={(component as any).ledColor || 'red'}
                    maxVoltage={(component as any).maxVoltage || 3}
                    burnt={(component as any).burnt || false}
                    onChange={handleChange}
                />
            )}

            {component.type === TYPES.CHIP && (
                <LogicChipEditor
                    logic={(component as any).logic || 'AND'}
                    onChange={handleChange}
                />
            )}

            <button
                onClick={onClose}
                className="w-full mt-6 bg-[#9ece6a] text-[#1a1c23] font-bold py-2 rounded hover:opacity-90"
            >
                Done
            </button>
        </div>
    );
}
