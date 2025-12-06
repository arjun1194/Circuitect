import React, { useRef, useEffect } from 'react';
import { useGameLoop, GameLoopController } from '../hooks/useGameLoop';
import { theme } from '../config/theme';
import { GRID_SIZE, ComponentType } from '../config/gameConfig';
import { Component } from '../engine/Physics';

interface GameCanvasProps {
    toolMode: string;
    selectedTool: ComponentType;
    onComponentSelect: (c: Component) => void;
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
        <div className="absolute inset-0 bg-[#16161e] cursor-crosshair overflow-hidden">
            {/* Grid Pattern using CSS */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `radial-gradient(${theme.colors.grid} 1.5px, transparent 1.5px)`,
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
            />
            {/* HUD / Overlay items can go here */}
        </div>
    );
}
