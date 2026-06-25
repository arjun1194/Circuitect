import { useReducer } from 'react';
import { X } from 'lucide-react';
import { AbstractComponent } from '../../../engine/Physics';
import { TYPES } from '../../../config/gameConfig';
import { COMPONENT_METADATA } from '../../../config/ComponentMetadata';
import { Button, IconButton } from '../primitives';

import BatteryEditor from './BatteryEditor';
import ResistorEditor from './ResistorEditor';
import CapacitorEditor from './CapacitorEditor';
import LEDEditor from './LEDEditor';
import LogicChipEditor from './LogicChipEditor';

interface PropertyEditorProps {
    component: AbstractComponent;
    onClose: () => void;
}

const EDITABLE = new Set<string>([TYPES.BATTERY, TYPES.RESISTOR, TYPES.CAPACITOR, TYPES.LED, TYPES.CHIP]);

export default function PropertyEditor({ component, onClose }: PropertyEditorProps) {
    const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

    if (!component) return null;

    const meta = COMPONENT_METADATA[component.type];
    const comp = component as unknown as Record<string, unknown>;

    const handleChange = (field: string, value: string | number) => {
        comp[field] = value;
        forceUpdate();
    };

    return (
        <div
            role="dialog"
            aria-label={`Edit ${meta?.name ?? 'component'}`}
            className="absolute bottom-3 right-3 top-3 z-30 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-border bg-surface shadow-2xl"
        >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="h-4 w-4 shrink-0 rounded" style={{ background: meta?.color }} aria-hidden="true" />
                    <h3 className="text-sm font-medium text-text">{meta?.name ?? 'Component'}</h3>
                </div>
                <IconButton label="Close editor" size="sm" onClick={onClose}>
                    <X size={16} />
                </IconButton>
            </div>

            <div className="cx-scroll flex-1 overflow-y-auto px-4 py-4">
                {component.type === TYPES.BATTERY && (
                    <BatteryEditor voltage={Number(comp.voltage) || 0} onChange={handleChange} />
                )}
                {component.type === TYPES.RESISTOR && (
                    <ResistorEditor resistance={Number(comp.resistance) || 0} onChange={handleChange} />
                )}
                {component.type === TYPES.CAPACITOR && (
                    <CapacitorEditor capacitance={Number(comp.capacitance) || 0} onChange={handleChange} />
                )}
                {component.type === TYPES.LED && (
                    <LEDEditor
                        ledColor={(comp.ledColor as string) || 'red'}
                        maxVoltage={Number(comp.maxVoltage) || 3}
                        burnt={Boolean(comp.burnt)}
                        onChange={handleChange}
                    />
                )}
                {component.type === TYPES.CHIP && (
                    <LogicChipEditor logic={(comp.logic as string) || 'AND'} onChange={handleChange} />
                )}

                {!EDITABLE.has(component.type) && (
                    <p className="text-sm leading-relaxed text-muted">
                        This component has no editable properties.
                    </p>
                )}
            </div>

            <div className="border-t border-border px-4 py-3">
                <Button variant="primary" className="w-full" onClick={onClose}>
                    Done
                </Button>
            </div>
        </div>
    );
}
