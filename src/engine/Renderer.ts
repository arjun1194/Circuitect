/**
 * Circuit Architect - Renderer
 * Handles canvas drawing operations
 */

import { CircuitNode, Component } from './Physics';
import { COMPONENT_DEFS } from './ComponentDefinitions';
import { theme } from '../config/theme';

export class Renderer {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = 0;
        this.height = 0;
    }

    setSize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.ctx.canvas.width = w;
        this.ctx.canvas.height = h;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawCurrent(c: Component) {
        if (!c.particles) {
            c.particles = [];
            for (let i = 0; i < 3; i++) c.particles.push(Math.random());
        }

        const speed = c.current * 0.5; // Factor
        this.ctx.fillStyle = theme.colors.current; // '#e0af68';

        c.particles.forEach((p, i) => {
            c.particles![i] = (p + speed) % 1;
            if (c.particles![i] < 0) c.particles![i] += 1;

            const t = c.particles![i];
            const x = c.n1.x + (c.n2.x - c.n1.x) * t;
            const y = c.n1.y + (c.n2.y - c.n1.y) * t;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    render(components: Component[], nodes: CircuitNode[], interactionState: any) {
        this.clear();

        // 1. Components
        components.forEach(c => {
            const def = COMPONENT_DEFS[c.type];
            if (!def) return;

            // Special handling for WIRE (Draw line directly)
            if (c.type === 'WIRE') {
                this.ctx.beginPath();
                this.ctx.strokeStyle = def.color || theme.colors.wire;
                this.ctx.lineWidth = 3;
                this.ctx.moveTo(c.n1.x, c.n1.y);
                this.ctx.lineTo(c.n2.x, c.n2.y);
                this.ctx.stroke();

                // Draw particles for current
                if (Math.abs(c.current) > 0.001) {
                    this.drawCurrent(c);
                }
                return;
            }

            // Other Components: Transform Context
            const midX = (c.n1.x + c.n2.x) / 2;
            const midY = (c.n1.y + c.n2.y) / 2;
            const angle = Math.atan2(c.n2.y - c.n1.y, c.n2.x - c.n1.x);

            this.ctx.save();
            this.ctx.translate(midX, midY);
            this.ctx.rotate(angle);

            // Dynamic color handling (e.g. LED)
            // (Passed to draw or handled inside draw? ComponentDefinitions handles color logic partially but we can pass params)

            if (def.draw) {
                // def.draw signature: (ctx, param, c, theme)
                // Use type assertion if needed as signatures vary slightly or fix ComponentDefinitions types
                (def as any).draw(this.ctx, c.param, c, theme);
            }

            this.ctx.restore();

            // Draw particles for current (on top, untransformed? or transformed?)
            // drawCurrent uses n1/n2 which are absolute. So call it outside transform.
            if (Math.abs(c.current) > 0.001) {
                this.drawCurrent(c);
            }
        });

        // 2. Dragging Line
        if (interactionState.isDragging && interactionState.dragStart && interactionState.currentMouse) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = theme.colors.accent;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.moveTo(interactionState.dragStart.x, interactionState.dragStart.y);
            this.ctx.lineTo(interactionState.currentMouse.x, interactionState.currentMouse.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // 3. Nodes
        nodes.forEach(n => {
            this.ctx.fillStyle = theme.colors.node;
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Hover effects
            if (interactionState.hoverNode === n) {
                this.ctx.fillStyle = theme.colors.accent;
                this.ctx.beginPath();
                this.ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
                this.ctx.fill();

                // Voltage Readout
                if (interactionState.toolMode === 'measure') {
                    this.ctx.fillStyle = '#e0af68';
                    this.ctx.font = "bold 12px monospace";
                    this.ctx.fillText(`${n.voltage.toFixed(2)}V`, n.x + 10, n.y - 10);
                }
            }
        });
    }
}
