import React, { useRef, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';

export default function GameCanvas({ toolMode, selectedTool, onComponentSelect, onMountController }) {
    const canvasRef = useRef(null);
    const { handleMouseDown, handleMouseMove, handleMouseUp, clearCircuit, getComponents } =
        useGameLoop(canvasRef, toolMode, selectedTool, onComponentSelect);

    // Expose controller to parent
    useEffect(() => {
        if (onMountController) {
            onMountController({
                clear: clearCircuit,
                getComponents: getComponents
            });
        }
    }, [onMountController, clearCircuit, getComponents]);

    return (
        <div className="flex-1 relative bg-[#131318] overflow-hidden" id="canvas-container">
            <canvas
                ref={canvasRef}
                className="block w-full h-full cursor-crosshair touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
            {/* HUD / Overlay items can go here */}
        </div>
    );
}
