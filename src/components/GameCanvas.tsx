import { useRef, useEffect } from 'react';
import { useGameLoop, GameLoopController } from '../hooks/useGameLoop';
import { GRID_SIZE, ComponentType } from '../config/gameConfig';
import { AbstractComponent } from '../engine/Physics';

interface GameCanvasProps {
    toolMode: string;
    selectedTool: ComponentType;
    onComponentSelect: (c: AbstractComponent) => void;
    onMountController: (controller: GameLoopController) => void;
    onHistoryChange?: () => void;
}

export default function GameCanvas({ toolMode, selectedTool, onComponentSelect, onMountController, onHistoryChange }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const controller = useGameLoop(canvasRef, toolMode, selectedTool, onComponentSelect, onHistoryChange);

    // Pass controller up to parent
    useEffect(() => {
        if (onMountController && controller) {
            onMountController(controller);
        }
    }, [controller, onMountController]);

    return (
        <div className="absolute inset-0 bg-canvas cursor-crosshair overflow-hidden">
            {/* Grid Pattern using CSS — color follows the active theme token */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(var(--c-grid) 1.5px, transparent 1.5px)`,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                }}
            />

            <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                    // Capture so drag/up keep firing even if the pointer leaves the canvas (mouse + touch).
                    try {
                        e.currentTarget.setPointerCapture?.(e.pointerId);
                    } catch {
                        /* setPointerCapture can throw for inactive pointers — safe to ignore */
                    }
                    controller.handlePointerDown(e);
                }}
                onPointerMove={controller.handlePointerMove}
                onPointerUp={controller.handlePointerUp}
                onPointerCancel={controller.handlePointerUp}
                className="block w-full h-full"
                style={{ touchAction: 'none' }}
                aria-label="Circuit canvas"
                role="img"
            />
            {/* HUD / Overlay items can go here */}
        </div>
    );
}
