/**
 * Circuitect - Renderer
 * Handles canvas drawing operations.
 *
 * Colors come from the live design tokens via getCanvasTheme(), so the canvas
 * recolors when the user toggles the theme. The backing store is scaled by
 * devicePixelRatio for crisp rendering on HiDPI/Retina displays; all draw code
 * works in CSS pixels.
 */

import { CircuitNode, AbstractComponent } from './Physics';
import { CanvasTheme, getCanvasTheme } from './canvasTheme';
import { TYPES } from '../config/gameConfig';

export class Renderer {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    dpr: number;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.width = 0;
        this.height = 0;
        this.dpr = 1;
    }

    /**
     * Size the canvas. `w`/`h` are CSS pixels; the backing store is scaled by
     * `dpr` and the context is transformed so all draw code stays in CSS px.
     */
    setSize(w: number, h: number, dpr: number = 1) {
        this.width = w;
        this.height = h;
        this.dpr = dpr;
        const canvas = this.ctx.canvas;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        if (canvas.style) {
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
        }
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    clear() {
        // In logical (CSS-pixel) space thanks to the setTransform in setSize.
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawCurrent(c: AbstractComponent, theme: CanvasTheme) {
        const speed = c.current * 0.5; // Factor
        this.ctx.fillStyle = theme.colors.current;

        c.particles.forEach((p, i) => {
            c.particles[i] = (p + speed) % 1;
            if (c.particles[i] < 0) c.particles[i] += 1;

            const t = c.particles[i];
            const x = c.n1.x + (c.n2.x - c.n1.x) * t;
            const y = c.n1.y + (c.n2.y - c.n1.y) * t;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    render(components: AbstractComponent[], nodes: CircuitNode[], interactionState: any) {
        const theme = getCanvasTheme();
        this.clear();

        // 1. Components
        components.forEach(c => {
            this.ctx.save();

            // Apply coordinate transformation for non-wire components
            // They expect (0,0) to be their center and aligned horizontally
            if (c.type !== TYPES.WIRE) {
                const cx = (c.n1.x + c.n2.x) / 2;
                const cy = (c.n1.y + c.n2.y) / 2;
                const angle = Math.atan2(c.n2.y - c.n1.y, c.n2.x - c.n1.x);
                this.ctx.translate(cx, cy);
                this.ctx.rotate(angle);
            }

            // Draw Component (Delegated to subclass)
            c.draw(this.ctx, theme);
            this.ctx.restore();

            // Draw highlight for hovered component in remove mode
            if (interactionState.toolMode === 'remove' && interactionState.hoverComponent === c) {
                const cx = (c.n1.x + c.n2.x) / 2;
                const cy = (c.n1.y + c.n2.y) / 2;
                this.ctx.save();
                this.ctx.strokeStyle = theme.colors.danger;
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([4, 4]);
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 25, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                this.ctx.restore();
            }

            // Draw particles for current (Global visualization overlay)
            if (Math.abs(c.current) > 0.001) {
                this.drawCurrent(c, theme);
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
                // Danger highlight in remove mode, accent color otherwise
                if (interactionState.toolMode === 'remove') {
                    this.ctx.fillStyle = theme.colors.danger;
                    this.ctx.beginPath();
                    this.ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillStyle = theme.colors.accent;
                    this.ctx.beginPath();
                    this.ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                // Voltage Readout
                if (interactionState.toolMode === 'measure') {
                    this.ctx.fillStyle = theme.colors.warning;
                    this.ctx.font = "bold 12px monospace";
                    this.ctx.fillText(`${n.voltage.toFixed(2)}V`, n.x + 10, n.y - 10);
                }
            }
        });
    }
}
