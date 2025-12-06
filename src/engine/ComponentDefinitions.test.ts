import { describe, it, expect, vi } from 'vitest';
import { COMPONENT_DEFS } from './ComponentDefinitions';
import { Component, CircuitNode } from './Physics';
import { TYPES } from '../config/gameConfig';

// Mock Canvas Context
const createMockContext = () => {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        arc: vi.fn(),
        arcTo: vi.fn(),
        ellipse: vi.fn(),
        closePath: vi.fn(),
        rotate: vi.fn(),
        // Properties need to be mutable for assignment
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        textAlign: '',
        shadowColor: '',
        shadowBlur: 0
    } as unknown as CanvasRenderingContext2D;
};

// Mock Theme
const mockTheme = {
    colors: {
        wire: '#mock-wire',
        danger: '#mock-danger',
        warning: '#mock-warning',
        accent: '#mock-accent'
    }
};

describe('ComponentDefinitions Rendering', () => {
    it('should have definitions for all major types', () => {
        expect(COMPONENT_DEFS[TYPES.BATTERY]).toBeDefined();
        expect(COMPONENT_DEFS[TYPES.RESISTOR]).toBeDefined();
        expect(COMPONENT_DEFS[TYPES.LED]).toBeDefined();
    });

    it('Battery should draw leads connecting to nodes', () => {
        const ctx = createMockContext();
        const def = COMPONENT_DEFS[TYPES.BATTERY];

        // Mock component with nodes 100px apart
        // Center (0,0) in local space implies leads go from -50 to +50
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(100, 0);
        const comp = new Component(TYPES.BATTERY, n1, n2);

        if (def.draw) {
            def.draw(ctx, 0, comp, mockTheme);

            // Verify leads are drawn
            // Expect moveTo to be called for left lead start
            expect(ctx.moveTo).toHaveBeenCalledWith(-50, 0);
            // Expect lineTo to be called for connecting to body
            expect(ctx.lineTo).toHaveBeenCalled();
            // Expect stroke to be called
            expect(ctx.stroke).toHaveBeenCalled();
        } else {
            throw new Error('Battery draw function missing');
        }
    });

    it('Resistor should draw leads', () => {
        const ctx = createMockContext();
        const def = COMPONENT_DEFS[TYPES.RESISTOR];
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(100, 0);
        const comp = new Component(TYPES.RESISTOR, n1, n2);

        if (def.draw) {
            def.draw(ctx, 0, comp, mockTheme);
            expect(ctx.moveTo).toHaveBeenCalledWith(-50, 0);
            expect(ctx.stroke).toHaveBeenCalled();
        }
    });

    it('LED should draw leads', () => {
        const ctx = createMockContext();
        const def = COMPONENT_DEFS[TYPES.LED];
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(60, 0);
        const comp = new Component(TYPES.LED, n1, n2);

        if (def.draw) {
            def.draw(ctx, 0, comp, mockTheme);
            expect(ctx.moveTo).toHaveBeenCalledWith(-30, 0);
            expect(ctx.stroke).toHaveBeenCalled();
        }
    });
});
