import { useRef, useEffect, useState, useCallback } from 'react';
import { Renderer } from '../engine/Renderer';
import { physicsStep, CircuitNode, Component } from '../engine/Physics';
import { GRID_SIZE, TYPES } from '../config/gameConfig';
import { theme } from '../config/theme';

export function useGameLoop(canvasRef, toolMode, selectedTool, onComponentSelect) {
    // Game State (Refs for mutable game loop state to avoid re-renders)
    const stateRef = useRef({
        nodes: [],
        components: [],
        renderer: null,
        dragStart: null,
        currentMouse: null,
        isDragging: false,
        hoverNode: null,
        lastTime: 0
    });

    const [fps, setFps] = useState(0);

    // Initialize Renderer
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        stateRef.current.renderer = new Renderer(canvas, theme);

        // Handle Resize
        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                stateRef.current.renderer.setSize(parent.clientWidth, parent.clientHeight);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Game Loop
    useEffect(() => {
        let animationFrameId;

        const loop = (time) => {
            const state = stateRef.current;
            if (!state.renderer) return;

            // Physics Step
            physicsStep(state.nodes, state.components);

            // Render Step
            state.renderer.render(state.components, state.nodes, {
                hoverNode: state.hoverNode,
                dragStart: state.dragStart,
                currentMouse: state.currentMouse,
                isDragging: state.isDragging,
                mode: toolMode
            });

            // FPS Calculation (optional)
            // const delta = time - state.lastTime;
            // state.lastTime = time;
            // setFps(Math.round(1000 / delta));

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [toolMode]); // Re-bind if necessary, though refs are stable

    // Input Handling Helpers
    const getGridPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE
        };
    };

    const getNodeAt = (x, y) => {
        const state = stateRef.current;
        return state.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 10);
    };

    const getOrCreateNode = (x, y) => {
        let node = getNodeAt(x, y);
        if (!node) {
            node = new CircuitNode(x, y);
            stateRef.current.nodes.push(node);
        }
        return node;
    };

    // Event Handlers
    const handleMouseDown = useCallback((e) => {
        const state = stateRef.current;
        const pos = getGridPos(e);

        if (toolMode === 'build') {
            state.dragStart = pos;
            state.isDragging = true;

            // Interaction Check (Click on component)
            const mx = e.clientX - canvasRef.current.getBoundingClientRect().left;
            const my = e.clientY - canvasRef.current.getBoundingClientRect().top;

            const clickedComp = state.components.find(c => {
                const midX = (c.n1.x + c.n2.x) / 2;
                const midY = (c.n1.y + c.n2.y) / 2;
                return Math.hypot(midX - mx, midY - my) < 20;
            });

            if (clickedComp) {
                if (clickedComp.type === TYPES.SWITCH) {
                    clickedComp.param = clickedComp.param ? 0 : 1;
                } else {
                    onComponentSelect(clickedComp);
                }
                state.isDragging = false; // Cancel drag if clicked component
                state.dragStart = null;
            }
        }
    }, [toolMode, onComponentSelect, selectedTool]); // dependencies

    const handleMouseMove = useCallback((e) => {
        const state = stateRef.current;
        const pos = getGridPos(e);
        state.currentMouse = pos;

        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        state.hoverNode = state.nodes.find(n => Math.hypot(n.x - mx, n.y - my) < 15);
    }, []);

    const handleMouseUp = useCallback((e) => {
        const state = stateRef.current;
        if (toolMode === 'build' && state.isDragging && state.dragStart) {
            const end = getGridPos(e);
            if (state.dragStart.x !== end.x || state.dragStart.y !== end.y) {
                // Add Component
                const n1 = getOrCreateNode(state.dragStart.x, state.dragStart.y);
                const n2 = getOrCreateNode(end.x, end.y);

                const newComp = new Component(selectedTool, n1, n2);

                // Handle 3-node components (Transistor) logic later if drag logic changes
                // For now, drag creates 2-node components. Transistor needs special handling or UI.
                // Assuming just 2 nodes for drag now.

                state.components.push(newComp);
                n1.connections.push(newComp);
                n2.connections.push(newComp);
            }
        }
        state.isDragging = false;
        state.dragStart = null;
    }, [toolMode, selectedTool]);

    // External Controls (Clear, Load Level)
    const clearCircuit = () => {
        stateRef.current.nodes = [];
        stateRef.current.components = [];
    };

    const getComponents = () => stateRef.current.components;

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        clearCircuit,
        getComponents
    };
}
