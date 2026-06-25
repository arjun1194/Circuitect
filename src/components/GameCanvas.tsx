import { useRef, useEffect } from 'react';
import { useGameLoop, GameLoopController } from '../hooks/useGameLoop';
import { GRID_SIZE, ComponentType } from '../config/gameConfig';
import { AbstractComponent } from '../engine/Physics';

interface GameCanvasProps {
    toolMode: string;
    selectedTool: ComponentType;
    onComponentSelect: (c: AbstractComponent) => void;
    onMountController: (controller: GameLoopController) => void;
}

export default function GameCanvas({ toolMode, selectedTool, onComponentSelect, onMountController }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const controller = useGameLoop(canvasRef, toolMode, selectedTool, onComponentSelect);

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
                onMouseDown={controller.handleMouseDown}
                onMouseMove={controller.handleMouseMove}
                onMouseUp={controller.handleMouseUp}
                onMouseLeave={controller.handleMouseUp}
                className="block w-full h-full"
                style={{ touchAction: 'none' }}
            />
            {/* HUD / Overlay items can go here */}
        </div>
    );
}
