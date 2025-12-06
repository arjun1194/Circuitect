/**
 * Circuit Architect - Renderer
 * Handles canvas drawing operations
 */

import { GRID_SIZE } from '../config/gameConfig';
import { COMPONENT_DEFS } from './ComponentDefinitions';

export class Renderer {
    constructor(canvas, theme) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.theme = theme;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    setSize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    clear() {
        // We use CSS background for grid, so just clear rect
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawGrid() {
        // Grid is drawn via CSS background (radial-gradient) as per legacy/React plan
        // But if we wanted dynamic grid color from config, we might need to draw it here
        // OR inject CSS variables. The plan says "CSS background". 
        // We will stick to CSS background for performance, but we rely on CSS vars.
    }

    /**
     * Main draw loop
     * @param {Array} components 
     * @param {Array} nodes 
     * @param {Object} interactionState { hoverNode, dragStart, currentMouse, mode }
     */
    render(components, nodes, interactionState) {
        this.clear();
        const ctx = this.ctx;

        // Draw Wires & Connections (Lines)
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        components.forEach(c => {
            const def = COMPONENT_DEFS[c.type];
            if (!def) return;

            ctx.save();
            ctx.translate((c.n1.x + c.n2.x) / 2, (c.n1.y + c.n2.y) / 2);
            const dx = c.n2.x - c.n1.x;
            const dy = c.n2.y - c.n1.y;
            const angle = Math.atan2(dy, dx);
            const len = Math.hypot(dx, dy);
            ctx.rotate(angle);

            // Draw Wire Line
            ctx.strokeStyle = def.color || this.theme.colors.wire;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-len / 2, 0);
            ctx.lineTo(len / 2, 0);
            ctx.stroke();

            // Draw Component Specifics
            if (def.draw) {
                def.draw(ctx, c.param, c, this.theme); // Pass theme for dynamic colors
            }

            ctx.restore();

            // Draw Current Flow Particles
            if (Math.abs(c.current) > 0.01) {
                const speed = c.current * 0.5; // Particle speed factor
                c.particles.forEach((p, i) => {
                    c.particles[i] = (p + speed) % 1;
                    if (c.particles[i] < 0) c.particles[i] += 1;

                    const t = c.particles[i];
                    const px = c.n1.x + (c.n2.x - c.n1.x) * t;
                    const py = c.n1.y + (c.n2.y - c.n1.y) * t;

                    ctx.fillStyle = '#ff0';
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        });

        // Draw Nodes
        nodes.forEach(n => {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Hover effect
            if (n === interactionState.hoverNode) {
                ctx.strokeStyle = this.theme.colors.accent;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Show Voltage Label if Measure Mode
                if (interactionState.mode === 'measure') {
                    ctx.fillStyle = this.theme.colors.warning;
                    ctx.font = "bold 12px monospace";
                    ctx.fillText(`${n.voltage.toFixed(2)}V`, n.x + 10, n.y - 10);
                }
            }
        });

        // Draw Drag Line
        if (interactionState.isDragging && interactionState.dragStart && interactionState.currentMouse) {
            ctx.strokeStyle = this.theme.colors.accent;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(interactionState.dragStart.x, interactionState.dragStart.y);
            ctx.lineTo(interactionState.currentMouse.x, interactionState.currentMouse.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}
