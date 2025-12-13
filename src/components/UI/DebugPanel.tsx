import { AbstractComponent } from '../../engine/Physics';
import { TYPES } from '../../config/gameConfig';
import { Bug, X, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

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
    // Generate diagnostics
    const diagnostics: DiagnosticMessage[] = [];

    // Analyze each component
    components.forEach((c, index) => {
        const compName = `${c.type} #${index + 1}`;

        // Transistor Analysis
        if (c.type === TYPES.TRANSISTOR) {
            const baseV = c.n3?.voltage ?? 0;
            const emitterV = c.n1.voltage;
            const collectorV = c.n2.voltage;
            const vBE = baseV - emitterV;

            if (isNaN(baseV) || isNaN(emitterV) || isNaN(collectorV)) {
                diagnostics.push({
                    type: 'error',
                    component: compName,
                    message: 'NaN voltage detected - check connections'
                });
            } else if (!c.n3) {
                diagnostics.push({
                    type: 'error',
                    component: compName,
                    message: 'Base terminal not connected'
                });
            } else if (vBE < 0.1) {
                diagnostics.push({
                    type: 'warning',
                    component: compName,
                    message: `OFF: V_BE = ${vBE.toFixed(2)}V (needs > 0.6V to turn on)`
                });
            } else if (vBE < 0.6) {
                diagnostics.push({
                    type: 'warning',
                    component: compName,
                    message: `Almost ON: V_BE = ${vBE.toFixed(2)}V (threshold is 0.6V)`
                });
            } else {
                diagnostics.push({
                    type: 'success',
                    component: compName,
                    message: `ON: V_BE = ${vBE.toFixed(2)}V, conducting E→C`
                });
            }

            // Additional info
            diagnostics.push({
                type: 'info',
                component: compName,
                message: `B=${baseV.toFixed(1)}V, E=${emitterV.toFixed(1)}V, C=${collectorV.toFixed(1)}V`
            });
        }

        // LED Analysis
        if (c.type === TYPES.LED) {
            const led = c as any;
            const vDiff = c.n1.voltage - c.n2.voltage;

            if (led.burnt) {
                diagnostics.push({
                    type: 'error',
                    component: compName,
                    message: `BURNT! Exceeded max voltage (${led.maxVoltage}V)`
                });
            } else if (vDiff < 1.5) {
                diagnostics.push({
                    type: 'warning',
                    component: compName,
                    message: `OFF: Forward voltage ${vDiff.toFixed(2)}V (needs > 1.5V)`
                });
            } else if (vDiff < 0) {
                diagnostics.push({
                    type: 'warning',
                    component: compName,
                    message: 'Reverse biased - check polarity'
                });
            } else {
                diagnostics.push({
                    type: 'success',
                    component: compName,
                    message: `ON: Forward voltage ${vDiff.toFixed(2)}V`
                });
            }
        }

        // Switch Analysis
        if (c.type === TYPES.SWITCH) {
            diagnostics.push({
                type: c.param ? 'success' : 'warning',
                component: compName,
                message: c.param ? 'CLOSED (conducting)' : 'OPEN (not conducting)'
            });
        }

        // Battery Analysis
        if (c.type === TYPES.BATTERY) {
            const voltage = c.getSourceVoltage();
            diagnostics.push({
                type: 'info',
                component: compName,
                message: `Supplying ${voltage}V (+ at n1, - at n2)`
            });
        }
    });

    // Check for potential issues
    if (components.length === 0) {
        diagnostics.push({
            type: 'warning',
            component: 'Circuit',
            message: 'No components in circuit'
        });
    }

    const hasBattery = components.some(c => c.type === TYPES.BATTERY);
    if (!hasBattery && components.length > 0) {
        diagnostics.push({
            type: 'error',
            component: 'Circuit',
            message: 'No power source (battery) found'
        });
    }

    const getIcon = (type: DiagnosticMessage['type']) => {
        switch (type) {
            case 'error': return <AlertTriangle size={14} className="text-[#f7768e]" />;
            case 'warning': return <AlertTriangle size={14} className="text-[#e0af68]" />;
            case 'success': return <CheckCircle size={14} className="text-[#9ece6a]" />;
            case 'info': return <Zap size={14} className="text-[#7aa2f7]" />;
        }
    };

    const getBgColor = (type: DiagnosticMessage['type']) => {
        switch (type) {
            case 'error': return 'bg-[#f7768e]/10 border-[#f7768e]/30';
            case 'warning': return 'bg-[#e0af68]/10 border-[#e0af68]/30';
            case 'success': return 'bg-[#9ece6a]/10 border-[#9ece6a]/30';
            case 'info': return 'bg-[#7aa2f7]/10 border-[#7aa2f7]/30';
        }
    };

    return (
        <div className="absolute top-5 right-72 w-80 max-h-[80vh] bg-[#24283b]/95 border border-[#7aa2f7] rounded-xl shadow-2xl backdrop-blur-sm z-30 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[#414868]">
                <div className="flex items-center gap-2">
                    <Bug size={18} className="text-[#7aa2f7]" />
                    <span className="font-bold text-[#7aa2f7]">Circuit Debugger</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-[#565f89] hover:text-[#f7768e] transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-3 overflow-y-auto max-h-[calc(80vh-50px)]">
                {diagnostics.length === 0 ? (
                    <p className="text-sm text-[#565f89] text-center py-4">
                        Add components to see diagnostics
                    </p>
                ) : (
                    <div className="space-y-2">
                        {diagnostics.map((d, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded border text-xs ${getBgColor(d.type)}`}
                            >
                                <div className="flex items-start gap-2">
                                    {getIcon(d.type)}
                                    <div>
                                        <span className="font-bold text-[#c0caf5]">{d.component}</span>
                                        <p className="text-[#9aa5ce] mt-0.5">{d.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-[#414868]">
                    <p className="text-[10px] text-[#565f89] uppercase tracking-wider mb-2">Transistor Guide</p>
                    <div className="text-[11px] text-[#9aa5ce] space-y-1">
                        <p>• V_BE = Base voltage - Emitter voltage</p>
                        <p>• Transistor turns ON when V_BE &gt; 0.6V</p>
                        <p>• E=Emitter, B=Base, C=Collector</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
