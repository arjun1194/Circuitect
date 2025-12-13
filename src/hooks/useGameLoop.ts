import { useRef, useEffect, useCallback, useMemo } from 'react';
import { Renderer } from '../engine/Renderer';
import { physicsStep, CircuitNode, AbstractComponent } from '../engine/Physics';
import { GRID_SIZE, TYPES, ComponentType } from '../config/gameConfig';
import { ComponentFactory } from '../engine/ComponentFactory';
import { circuitToJson, circuitFromJson } from '../utils/CircuitSerializer';
import { useUndoRedo } from './useUndoRedo';


interface GameState {
    nodes: CircuitNode[];
    components: AbstractComponent[];
    renderer: Renderer | null;
    dragStart: { x: number; y: number } | null;
    currentMouse: { x: number; y: number } | null;
    isDragging: boolean;
    hoverNode: CircuitNode | undefined | null;
    hoverComponent: AbstractComponent | null;
    lastTime: number;
}

export interface GameLoopController {
    handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    clear: () => void;
    getComponents: () => AbstractComponent[];
    getNodes: () => CircuitNode[];
    exportCircuit: () => string;
    importCircuit: (json: string) => boolean;
    undo: () => boolean;
    redo: () => boolean;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

// TODO: this file is too big, separate into smaller hooks and compose
// TODO: extract functions into relevant files
export function useGameLoop(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    toolMode: string,
    selectedTool: ComponentType,
    onComponentSelect: (c: AbstractComponent) => void
): GameLoopController {
    // Game State (Refs for mutable game loop state to avoid re-renders)
    const stateRef = useRef<GameState>({
        nodes: [],
        components: [],
        renderer: null,
        dragStart: null,
        currentMouse: null,
        isDragging: false,
        hoverNode: null,
        hoverComponent: null,
        lastTime: 0
    });

    // Undo/Redo controller
    const undoRedo = useUndoRedo();



    // Initialize Renderer
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        stateRef.current.renderer = new Renderer(canvas.getContext('2d')!); // Non-null assertion for 2d context

        // Handle Resize
        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent && stateRef.current.renderer) {
                stateRef.current.renderer.setSize(parent.clientWidth, parent.clientHeight);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Game Loop
    useEffect(() => {
        let animationFrameId: number;

        const loop = (_time: number) => {
            const state = stateRef.current;
            if (!state.renderer) return;

            // Physics Step
            physicsStep(state.nodes, state.components);

            // Render Step
            state.renderer.render(state.components, state.nodes, {
                hoverNode: state.hoverNode,
                hoverComponent: state.hoverComponent,
                dragStart: state.dragStart,
                currentMouse: state.currentMouse,
                isDragging: state.isDragging,
                toolMode: toolMode
            });

            // FPS Calculation (optional)
            // const delta = time - state.lastTime;
            // state.lastTime = time;
            // setFps(Math.round(1000 / delta));

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [toolMode]); // Re-bind if necessary

    // Input Handling Helpers
    const getGridPos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE,
            y: Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE
        };
    };

    const getNodeAt = (x: number, y: number): CircuitNode | undefined => {
        const state = stateRef.current;
        return state.nodes.find(n => Math.hypot(n.x - x, n.y - y) < 10);
    };

    const getOrCreateNode = (x: number, y: number): CircuitNode => {
        let node = getNodeAt(x, y);
        if (!node) {
            node = new CircuitNode(x, y);
            stateRef.current.nodes.push(node);
        }
        return node;
    };

    // Event Handlers
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
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
        } else if (toolMode === 'remove') {
            const mx = e.clientX - canvasRef.current.getBoundingClientRect().left;
            const my = e.clientY - canvasRef.current.getBoundingClientRect().top;

            // Check for clicked component first
            const clickedComp = state.components.find(c => {
                const midX = (c.n1.x + c.n2.x) / 2;
                const midY = (c.n1.y + c.n2.y) / 2;
                return Math.hypot(midX - mx, midY - my) < 20;
            });

            if (clickedComp) {
                // Remove component from connections of its nodes
                clickedComp.n1.connections = clickedComp.n1.connections.filter(c => c !== clickedComp);
                clickedComp.n2.connections = clickedComp.n2.connections.filter(c => c !== clickedComp);
                if (clickedComp.n3) {
                    clickedComp.n3.connections = clickedComp.n3.connections.filter(c => c !== clickedComp);
                }
                // Remove component from state
                state.components = state.components.filter(c => c !== clickedComp);
                state.hoverComponent = null;
                // Save state for undo
                undoRedo.pushState(state.nodes, state.components);
            } else {
                // Check for clicked node
                const clickedNode = state.nodes.find(n => Math.hypot(n.x - mx, n.y - my) < 15);
                if (clickedNode) {
                    // Remove all components connected to this node
                    const connectedComps = [...clickedNode.connections];
                    connectedComps.forEach(comp => {
                        comp.n1.connections = comp.n1.connections.filter(c => c !== comp);
                        comp.n2.connections = comp.n2.connections.filter(c => c !== comp);
                        if (comp.n3) {
                            comp.n3.connections = comp.n3.connections.filter(c => c !== comp);
                        }
                        state.components = state.components.filter(c => c !== comp);
                    });
                    // Remove the node
                    state.nodes = state.nodes.filter(n => n !== clickedNode);
                    state.hoverNode = null;
                    // Save state for undo
                    undoRedo.pushState(state.nodes, state.components);
                }
            }
        }
    }, [toolMode, onComponentSelect, selectedTool, undoRedo]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const state = stateRef.current;
        const pos = getGridPos(e);
        state.currentMouse = pos;

        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        state.hoverNode = state.nodes.find(n => Math.hypot(n.x - mx, n.y - my) < 15);

        // Track hovered component for remove mode
        state.hoverComponent = state.components.find(c => {
            const midX = (c.n1.x + c.n2.x) / 2;
            const midY = (c.n1.y + c.n2.y) / 2;
            return Math.hypot(midX - mx, midY - my) < 20;
        }) || null;
    }, []);

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const state = stateRef.current;
        if (toolMode === 'build' && state.isDragging && state.dragStart) {
            const end = getGridPos(e);
            if (state.dragStart.x !== end.x || state.dragStart.y !== end.y) {
                // Add Component
                const n1 = getOrCreateNode(state.dragStart.x, state.dragStart.y);
                const n2 = getOrCreateNode(end.x, end.y);

                const newComp = ComponentFactory.create(selectedTool, n1, n2);

                // For transistors, create a third node for the base
                if (selectedTool === TYPES.TRANSISTOR) {
                    // Calculate base node position (perpendicular to the component, offset from center)
                    const midX = (n1.x + n2.x) / 2;
                    const midY = (n1.y + n2.y) / 2;
                    const angle = Math.atan2(n2.y - n1.y, n2.x - n1.x);
                    // Base is perpendicular, offset by ~20px (grid aligned)
                    const baseOffset = GRID_SIZE;
                    const baseX = Math.round((midX + Math.sin(angle) * baseOffset) / GRID_SIZE) * GRID_SIZE;
                    const baseY = Math.round((midY - Math.cos(angle) * baseOffset) / GRID_SIZE) * GRID_SIZE;

                    const n3 = getOrCreateNode(baseX, baseY);
                    newComp.n3 = n3;
                    n3.connections.push(newComp);
                }

                state.components.push(newComp);
                n1.connections.push(newComp);
                n2.connections.push(newComp);

                // Save state for undo
                undoRedo.pushState(state.nodes, state.components);
            }
        }
        state.isDragging = false;
        state.dragStart = null;
    }, [toolMode, selectedTool]);

    // External Controls (Clear, Load Level)
    const clear = useCallback(() => {
        stateRef.current.nodes = [];
        stateRef.current.components = [];
        undoRedo.clearHistory();
    }, [undoRedo]);

    // Undo/Redo handlers
    const undo = useCallback((): boolean => {
        const result = undoRedo.undo();
        if (result) {
            stateRef.current.nodes = result.nodes;
            stateRef.current.components = result.components;
            return true;
        }
        return false;
    }, [undoRedo]);

    const redo = useCallback((): boolean => {
        const result = undoRedo.redo();
        if (result) {
            stateRef.current.nodes = result.nodes;
            stateRef.current.components = result.components;
            return true;
        }
        return false;
    }, [undoRedo]);

    const getComponents = () => stateRef.current.components;
    const getNodes = () => stateRef.current.nodes;

    const exportCircuit = useCallback((): string => {
        const state = stateRef.current;
        return circuitToJson(state.nodes, state.components);
    }, []);

    const importCircuit = useCallback((json: string): boolean => {
        try {
            const { nodes, components } = circuitFromJson(json);
            stateRef.current.nodes = nodes;
            stateRef.current.components = components;
            return true;
        } catch (error) {
            console.error('Failed to import circuit:', error);
            return false;
        }
    }, []);

    return useMemo(() => ({
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        clear,
        getComponents,
        getNodes,
        exportCircuit,
        importCircuit,
        undo,
        redo,
        canUndo: undoRedo.canUndo,
        canRedo: undoRedo.canRedo
    }), [handleMouseDown, handleMouseMove, handleMouseUp, clear, exportCircuit, importCircuit, undo, redo, undoRedo]);
}
