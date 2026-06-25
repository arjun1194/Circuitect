import { AbstractComponent } from '../../engine/Physics';
import { TYPES } from '../../config/gameConfig';
import { Bug, Zap, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { IconButton } from './primitives';

interface DebugPanelProps {
    components: AbstractComponent[];
    onClose: () => void;
}

interface DiagnosticMessage {
    type: 'error' | 'warning' | 'info' | 'success';
    component: string;
    message: string;
}

export default function DebugPanel({ components, onClose }: DebugPanelProps) {
    const diagnostics: DiagnosticMessage[] = [];

    components.forEach((c, index) => {
        const compName = `${c.type} #${index + 1}`;

        if (c.type === TYPES.TRANSISTOR) {
            const baseV = c.n3?.voltage ?? 0;
            const emitterV = c.n1.voltage;
            const collectorV = c.n2.voltage;
            const vBE = baseV - emitterV;

            if (isNaN(baseV) || isNaN(emitterV) || isNaN(collectorV)) {
                diagnostics.push({ type: 'error', component: compName, message: 'NaN voltage detected - check connections' });
            } else if (!c.n3) {
                diagnostics.push({ type: 'error', component: compName, message: 'Base terminal not connected' });
            } else if (vBE < 0.1) {
                diagnostics.push({ type: 'warning', component: compName, message: `OFF: V_BE = ${vBE.toFixed(2)}V (needs > 0.6V to turn on)` });
            } else if (vBE < 0.6) {
                diagnostics.push({ type: 'warning', component: compName, message: `Almost ON: V_BE = ${vBE.toFixed(2)}V (threshold is 0.6V)` });
            } else {
                diagnostics.push({ type: 'success', component: compName, message: `ON: V_BE = ${vBE.toFixed(2)}V, conducting E→C` });
            }

            diagnostics.push({ type: 'info', component: compName, message: `B=${baseV.toFixed(1)}V, E=${emitterV.toFixed(1)}V, C=${collectorV.toFixed(1)}V` });
        }

        if (c.type === TYPES.LED) {
            const led = c as unknown as { burnt?: boolean; maxVoltage?: number };
            const vDiff = c.n1.voltage - c.n2.voltage;

            if (led.burnt) {
                diagnostics.push({ type: 'error', component: compName, message: `BURNT! Exceeded max voltage (${led.maxVoltage}V)` });
            } else if (vDiff < 0) {
                diagnostics.push({ type: 'warning', component: compName, message: 'Reverse biased - check polarity' });
            } else if (vDiff < 1.5) {
                diagnostics.push({ type: 'warning', component: compName, message: `OFF: Forward voltage ${vDiff.toFixed(2)}V (needs > 1.5V)` });
            } else {
                diagnostics.push({ type: 'success', component: compName, message: `ON: Forward voltage ${vDiff.toFixed(2)}V` });
            }
        }

        if (c.type === TYPES.SWITCH) {
            diagnostics.push({
                type: c.param ? 'success' : 'warning',
                component: compName,
                message: c.param ? 'CLOSED (conducting)' : 'OPEN (not conducting)',
            });
        }

        if (c.type === TYPES.BATTERY) {
            diagnostics.push({ type: 'info', component: compName, message: `Supplying ${c.getSourceVoltage()}V (+ at n1, - at n2)` });
        }
    });

    if (components.length === 0) {
        diagnostics.push({ type: 'warning', component: 'Circuit', message: 'No components in circuit' });
    }

    if (!components.some((c) => c.type === TYPES.BATTERY) && components.length > 0) {
        diagnostics.push({ type: 'error', component: 'Circuit', message: 'No power source (battery) found' });
    }

    const icons = {
        error: <AlertTriangle size={14} className="text-danger" />,
        warning: <AlertTriangle size={14} className="text-warning" />,
        success: <CheckCircle size={14} className="text-success" />,
        info: <Zap size={14} className="text-accent" />,
    };

    const tones = {
        error: 'border-danger/30 bg-danger/10',
        warning: 'border-warning/30 bg-warning/10',
        success: 'border-success/30 bg-success/10',
        info: 'border-accent/30 bg-accent/10',
    };

    return (
        <div className="absolute right-3 top-3 z-30 flex max-h-[calc(100%-1.5rem)] w-80 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <Bug size={18} className="text-accent" />
                    <span className="text-sm font-medium text-text">Circuit debugger</span>
                </div>
                <IconButton label="Close debugger" size="sm" onClick={onClose}>
                    <X size={16} />
                </IconButton>
            </div>

            <div className="cx-scroll overflow-y-auto p-3">
                {diagnostics.length === 0 ? (
                    <p className="py-4 text-center text-sm text-faint">Add components to see diagnostics</p>
                ) : (
                    <div className="space-y-2">
                        {diagnostics.map((d, i) => (
                            <div key={i} className={`rounded-lg border p-2 text-xs ${tones[d.type]}`}>
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 shrink-0">{icons[d.type]}</span>
                                    <div>
                                        <span className="font-medium text-text">{d.component}</span>
                                        <p className="mt-0.5 text-muted">{d.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-faint">Transistor guide</p>
                    <div className="space-y-1 text-[11px] text-muted">
                        <p>• V_BE = Base voltage − Emitter voltage</p>
                        <p>• Transistor turns ON when V_BE &gt; 0.6V</p>
                        <p>• E=Emitter, B=Base, C=Collector</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
