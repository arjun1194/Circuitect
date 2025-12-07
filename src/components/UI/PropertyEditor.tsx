import { useState } from 'react';
import { AbstractComponent } from '../../engine/Physics';

import { TYPES } from '../../config/gameConfig';
import { X } from 'lucide-react';

interface PropertyEditorProps {
    component: AbstractComponent;
    onClose: () => void;
}

export default function PropertyEditor({ component, onClose }: PropertyEditorProps) {
    // Local state to handle live updates
    const [, forceUpdate] = useState({});

    // If no component selected, don't render
    if (!component) return null;

    const handleChange = (field: string, value: any) => {
        (component as any)[field] = value;
        forceUpdate({}); // Re-render this component
    };

    // TODO: Make this a directory and refactor each component type render into its own file
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#24283b] p-6 rounded-lg border border-[#7aa2f7] shadow-xl z-50 w-80">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Edit Component</h3>
                <button onClick={onClose} className="text-[#565f89] hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* BATTERY */}
            {component.type === TYPES.BATTERY && (
                <div className="mb-4">
                    <label className="block text-gray-400 text-xs mb-1">Voltage (V)</label>
                    <input
                        type="number"
                        value={(component as any).voltage || 0}
                        onChange={(e) => handleChange('voltage', parseFloat(e.target.value))}
                        className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
                    />
                </div>
            )}

            {/* Resistance */}
            {(component.type === TYPES.RESISTOR) && (
                <div className="mb-4">
                    <label className="block text-gray-400 text-xs mb-1">Resistance (Ω)</label>
                    <input
                        type="number"
                        value={(component as any).resistance || 0}
                        onChange={(e) => handleChange('resistance', parseFloat(e.target.value))}
                        className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
                    />
                </div>
            )}

            {/* Capacitance */}
            {(component.type === TYPES.CAPACITOR) && (
                <div className="mb-4">
                    <label className="block text-gray-400 text-xs mb-1">Capacitance (µF)</label>
                    <input
                        type="number"
                        value={(component as any).capacitance || 0}
                        onChange={(e) => handleChange('capacitance', parseFloat(e.target.value))}
                        className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
                    />
                </div>
            )}

            {/* LED Color */}
            {(component.type === TYPES.LED) && (
                <div className="mb-4">
                    <label className="block text-gray-400 text-xs mb-1">Color</label>
                    <select
                        value={(component as any).ledColor || 'red'}
                        onChange={(e) => handleChange('ledColor', e.target.value)}
                        className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
                    >
                        <option value="red">Red</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="yellow">Yellow</option>
                        <option value="white">White</option>
                    </select>
                </div>
            )}

            {/* Logic Gate Type */}
            {(component.type === TYPES.CHIP) && (
                <div className="mb-4">
                    <label className="block text-gray-400 text-xs mb-1">Gate Type</label>
                    <select
                        value={(component as any).logic || 'AND'}
                        onChange={(e) => handleChange('logic', e.target.value)}
                        className="w-full bg-[#1a1b26] border border-[#414868] rounded px-2 py-1 text-white text-sm"
                    >
                        <option value="AND">AND Gate</option>
                        <option value="OR">OR Gate</option>
                        <option value="XOR">XOR Gate</option>
                        <option value="NAND">NAND Gate</option>
                    </select>
                </div>
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
