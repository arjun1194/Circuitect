import { useMemo } from 'react';
import { ComponentType } from '../../config/gameConfig';
import { COMPONENT_METADATA } from '../../config/ComponentMetadata';
import clsx from 'clsx';

interface ToolboxProps {
    selectedTool: ComponentType;
    onSelectTool: (t: ComponentType) => void;
    /** Called after a tool is picked — used to close the mobile drawer. */
    onPick?: () => void;
}

const CATEGORY_ORDER = ['Basic', 'Passive', 'Power', 'Output', 'Control', 'Active', 'Abstraction'];

export default function Toolbox({ selectedTool, onSelectTool, onPick }: ToolboxProps) {
    const categoryEntries = useMemo(() => {
        const categories: Record<string, ComponentType[]> = {};
        for (const cat of CATEGORY_ORDER) categories[cat] = [];

        (Object.keys(COMPONENT_METADATA) as ComponentType[]).forEach((type) => {
            const def = COMPONENT_METADATA[type];
            if (categories[def.category]) categories[def.category].push(type);
        });

        return Object.entries(categories).filter(([, types]) => types.length > 0);
    }, []);

    return (
        <div className="p-3">
            {categoryEntries.map(([cat, types]) => (
                <div key={cat} className="mb-4 last:mb-0">
                    <h3 className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-faint">
                        {cat}
                    </h3>
                    <div className="space-y-1">
                        {types.map((type) => {
                            const def = COMPONENT_METADATA[type];
                            const selected = selectedTool === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onSelectTool(type);
                                        onPick?.();
                                    }}
                                    aria-pressed={selected}
                                    title={def.description}
                                    className={clsx(
                                        'flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                        selected
                                            ? 'border-accent bg-accent/10 text-text'
                                            : 'border-transparent text-muted hover:bg-surface-2 hover:text-text'
                                    )}
                                >
                                    <span
                                        className="h-4 w-4 shrink-0 rounded"
                                        style={{ background: def.color }}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">{def.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
