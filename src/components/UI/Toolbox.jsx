import React from 'react';
import { TYPES } from '../../config/gameConfig';
import { COMPONENT_DEFS } from '../../engine/ComponentDefinitions';
import clsx from 'clsx';

export default function Toolbox({ selectedTool, onSelectTool, currentMode, onSetMode }) {
    // Group by category
    const categories = {
        'Basic': [],
        'Passive': [],
        'Active': [],
        'Power': [],
        'Control': [],
        'Output': [],
        'Abstraction': []
    };

    Object.keys(COMPONENT_DEFS).forEach(type => {
        const def = COMPONENT_DEFS[type];
        if (categories[def.category]) {
            categories[def.category].push(type);
        }
    });

    return (
        <div className="w-60 bg-[#24283b] flex flex-col p-4 border-l border-[#333] shadow-lg overflow-y-auto">

            {/* Mode Switcher (Integrated into Toolbox for cleaner UI, or keep separate?) 
                Legacy had it floating. Let's put it at top of toolbox for better UX. */}
            <div className="flex mb-6 bg-[#1a1c23] p-1 rounded-lg border border-[#414868]">
                <button
                    onClick={() => onSetMode('build')}
                    className={clsx(
                        "flex-1 py-2 text-sm font-bold rounded transition-colors",
                        currentMode === 'build' ? "bg-[#7aa2f7] text-[#1a1c23]" : "text-[#565f89] hover:bg-[#2f3549]"
                    )}
                >
                    🔨 Build
                </button>
                <button
                    onClick={() => onSetMode('measure')}
                    className={clsx(
                        "flex-1 py-2 text-sm font-bold rounded transition-colors",
                        currentMode === 'measure' ? "bg-[#e0af68] text-[#1a1c23]" : "text-[#565f89] hover:bg-[#2f3549]"
                    )}
                >
                    ⚡ Measure
                </button>
            </div>

            {/* Components List */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(categories).map(([cat, types]) => {
                    if (types.length === 0) return null;
                    return (
                        <div key={cat} className="mb-4">
                            <h3 className="text-[11px] uppercase tracking-wider text-[#565f89] font-bold mb-2">{cat}</h3>
                            <div className="space-y-1">
                                {types.map(type => {
                                    const def = COMPONENT_DEFS[type];
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => onSelectTool(type)}
                                            className={clsx(
                                                "w-full flex items-center p-2 rounded text-sm transition-all text-left",
                                                selectedTool === type
                                                    ? "bg-[#3b4261] border border-[#7aa2f7] shadow-[0_0_8px_rgba(122,162,247,0.4)] text-white translate-x-1"
                                                    : "bg-[#2f3549] border border-[#414868] text-white hover:bg-[#414868] hover:translate-x-1"
                                            )}
                                        >
                                            <div
                                                className="w-5 h-5 mr-3 rounded flex items-center justify-center font-bold text-xs"
                                                style={{ background: def.color }}
                                            >
                                                {def.name[0]}
                                            </div>
                                            {def.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
