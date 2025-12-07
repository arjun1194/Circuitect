import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Renderer } from './Renderer';
import { AbstractComponent, CircuitNode } from './Physics';
import { TYPES } from '../config/gameConfig';

// Mock concrete implementation for testing
class MockComponent extends AbstractComponent {
    draw = vi.fn();
    getResistance = () => 100;
}

describe('Renderer', () => {
    let ctx: any;
    let renderer: Renderer;

    beforeEach(() => {
        // Mock CanvasRenderingContext2D
        ctx = {
            canvas: { width: 0, height: 0 },
            clearRect: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            setLineDash: vi.fn(),
        };
        renderer = new Renderer(ctx as unknown as CanvasRenderingContext2D);
    });

    it('should apply coordinate transformations for non-wire components', () => {
        const n1 = new CircuitNode(0, 100);
        const n2 = new CircuitNode(100, 100); // 100px to the right

        // Use a non-wire type (e.g., RESISTOR)
        const component = new MockComponent(TYPES.RESISTOR, n1, n2);

        renderer.render([component], [], {});

        expect(ctx.save).toHaveBeenCalled();
        // Should translate to center (50, 100)
        expect(ctx.translate).toHaveBeenCalledWith(50, 100);
        // Should rotate (angle 0 for horizontal line)
        expect(ctx.rotate).toHaveBeenCalledWith(0);
        expect(component.draw).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should NOT apply coordinate transformations for Wire components', () => {
        const n1 = new CircuitNode(0, 100);
        const n2 = new CircuitNode(100, 100);

        const component = new MockComponent(TYPES.WIRE, n1, n2);

        renderer.render([component], [], {});

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.translate).not.toHaveBeenCalled();
        expect(ctx.rotate).not.toHaveBeenCalled();
        expect(component.draw).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('should calculate correct rotation for diagonal components', () => {
        // Diagonal line from (0,0) to (100,100) -> 45 degrees (PI/4)
        const n1 = new CircuitNode(0, 0);
        const n2 = new CircuitNode(100, 100);

        const component = new MockComponent(TYPES.RESISTOR, n1, n2);

        renderer.render([component], [], {});

        // Center should be (50, 50)
        expect(ctx.translate).toHaveBeenCalledWith(50, 50);
        // Angle should be Math.PI / 4 given the coordinate system
        expect(ctx.rotate).toHaveBeenCalledWith(expect.closeTo(Math.PI / 4));
    });
});
