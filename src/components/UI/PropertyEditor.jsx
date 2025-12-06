import React, { useState, useEffect } from 'react';
import { TYPES, DEFAULT_BATTERY_VOLTAGE } from '../../config/gameConfig';
import { X } from 'lucide-react';

export default function PropertyEditor({ component, onClose }) {
    // Local state to handle input before blur/save, or live update?
    // Live update is better. But modification needs to affect the actual component instance.
    // Since component is passed by reference (from GameLoop), mutating it works directly for the physics engine.
    // However, to trigger React re-renders if needed, we might need a forceUpdate? 
    // Actually the Canvas renders on RequestAnimationFrame, so mutation is visible immediately on next frame.
    // React UI might need update.

    // We'll use a forceUpdate to ensure input fields reflect changes.
    const [, forceUpdate] = useState({});

    // If no component selected, don't render
    if (!component) return null;

    const handleChange = (field, value) => {
        component[field] = value;
        forceUpdate({}); // Re-render this component
    };

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
                <div>
                    <label className="block text-[#aaa] text-xs mb-1">Voltage (V)</label>
                    <input
                        type="number"
                        value={component.voltage || DEFAULT_BATTERY_VOLTAGE}
                        onChange={(e) => handleChange('voltage', parseFloat(e.target.value))}
                        className="w-full bg-[#1a1c23] text-white p-2 rounded border border-[#444] mb-2"
                        min="1" max="48" step="0.5"
                    />
                    <p className="text-[11px] text-[#565f89] italic">Adjust battery voltage (1V - 48V)</p>
                </div>
            )}

            {/* RESISTOR */}
            {component.type === TYPES.RESISTOR && (
                <div>
                    <label className="block text-[#aaa] text-xs mb-1">Resistance (Ω)</label>
                    <input
                        type="number"
                        value={component.resistance || 220}
                        onChange={(e) => handleChange('resistance', parseInt(e.target.value))}
                        className="w-full bg-[#1a1c23] text-white p-2 rounded border border-[#444]"
                        min="1" max="1000000"
                    />
                </div>
            )}

            {/* CAPACITOR */}
            {component.type === TYPES.CAPACITOR && (
                <div>
                    <label className="block text-[#aaa] text-xs mb-1">Capacitance (µF)</label>
                    <input
                        type="number"
                        value={component.capacitance || 10}
                        onChange={(e) => handleChange('capacitance', parseInt(e.target.value))}
                        className="w-full bg-[#1a1c23] text-white p-2 rounded border border-[#444] mb-2"
                        min="1" max="1000"
                    />
                    <p className="text-[11px] text-[#565f89] italic">Acts as open circuit when charged.</p>
                </div>
            )}

            {/* LED - Dynamic Color Config (User Request) */}
            {component.type === TYPES.LED && (
                <div>
                    <label className="block text-[#aaa] text-xs mb-1">LED Color</label>
                    <select
                        value={component.ledColor || 'red'}
                        onChange={(e) => handleChange('ledColor', e.target.value)}
                        className="w-full bg-[#1a1c23] text-white p-2 rounded border border-[#444] mb-2"
                    >
                        <option value="red">🔴 Red</option>
                        <option value="green">🟢 Green</option>
                        <option value="blue">🔵 Blue</option>
                        <option value="yellow">🟡 Yellow</option>
                        <option value="white">⚪ White</option>
                    </select>
                </div>
            )}

            {/* CHIP */}
            {component.type === TYPES.CHIP && (
                <div>
                    <label className="block text-[#aaa] text-xs mb-1">Logic Type</label>
                    <select
                        value={component.logic || 'AND'}
                        onChange={(e) => handleChange('logic', e.target.value)}
                        className="w-full bg-[#1a1c23] text-white p-2 rounded border border-[#444]"
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
