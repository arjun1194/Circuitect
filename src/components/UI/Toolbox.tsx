import { useMemo, useState } from 'react';
import { ComponentType } from '../../config/gameConfig';
import { COMPONENT_METADATA } from '../../config/ComponentMetadata';
import clsx from 'clsx';
import { ToolMode } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ToolboxProps {
    selectedTool: ComponentType;
    onSelectTool: (t: ComponentType) => void;
    currentMode: ToolMode;
    onSetMode: (m: ToolMode) => void;
}

export default function Toolbox({ selectedTool, onSelectTool }: ToolboxProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    // Memoize categories to prevent recalculation on every render
    const categoryEntries = useMemo(() => {
        const categories: Record<string, string[]> = {
            'Basic': [],
            'Passive': [],
            'Active': [],
            'Power': [],
            'Control': [],
            'Output': [],
            'Abstraction': []
        };

        Object.keys(COMPONENT_METADATA).forEach(key => {
            const type = key as ComponentType;
            const def = COMPONENT_METADATA[type];
            if (categories[def.category]) {
                categories[def.category].push(type);
            }
        });

        return Object.entries(categories).filter(([, types]) => types.length > 0);
    }, []);

    // Minimized state - show only expand button
    if (isMinimized) {
        return (
            <div className="bg-[#24283b] flex flex-col items-center py-4 border-l border-[#333] shadow-lg">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="p-2 text-[#7aa2f7] hover:bg-[#3b4261] rounded transition-colors"
                    title="Expand Toolbox"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="mt-4 flex flex-col gap-2">
                    {/* Show selected tool indicator */}
                    <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs border-2 border-[#7aa2f7]"
                        style={{ background: COMPONENT_METADATA[selectedTool]?.color }}
                        title={COMPONENT_METADATA[selectedTool]?.name}
                    >
                        {COMPONENT_METADATA[selectedTool]?.name[0]}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-60 bg-[#24283b] flex flex-col p-4 border-l border-[#333] shadow-lg overflow-y-auto">
            {/* Header with minimize button */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-[#7aa2f7] font-bold">Toolbox</span>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 text-[#565f89] hover:text-[#f7768e] transition-colors"
                    title="Minimize"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Components List */}
            <div className="flex-1 overflow-y-auto mt-2">
                {categoryEntries.map(([cat, types]) => {
                    return (
                        <div key={cat} className="mb-4">
                            <h3 className="text-[11px] uppercase tracking-wider text-[#565f89] font-bold mb-2">{cat}</h3>
                            <div className="space-y-1">
                                {types.map(t => {
                                    const type = t as ComponentType;
                                    const def = COMPONENT_METADATA[type];
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
