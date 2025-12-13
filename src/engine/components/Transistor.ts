import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class Transistor extends AbstractComponent {
    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.TRANSISTOR, n1, n2);
    }

    getResistance(): number {
        return 1000000;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;

        // Calculate angle for counter-rotation of labels
        const angle = Math.atan2(this.n2.y - this.n1.y, this.n2.x - this.n1.x);

        ctx.save();
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-12, 0);
        ctx.moveTo(12, 0);
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, 5, 12, Math.PI, 0);
        ctx.lineTo(12, 5);
        ctx.lineTo(-12, 5);
        ctx.fill();
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath(); ctx.arc(-6, 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, 8, 2, 0, Math.PI * 2); ctx.fill();

        // Draw base lead (extends perpendicular from center)
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -25); // Extend to where n3 node will be (GRID_SIZE = 25)
        ctx.stroke();

        // Base connection point
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Terminal labels - counter-rotate to keep text horizontal
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#9ece6a'; // Green for visibility
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Helper function to draw counter-rotated text
        const drawLabel = (text: string, x: number, y: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-angle); // Counter-rotate to keep text horizontal
            ctx.fillText(text, 0, 0);
            ctx.restore();
        };

        // Emitter label (left terminal - n1)
        drawLabel('E', -halfDist + 12, -10);

        // Collector label (right terminal - n2)
        drawLabel('C', halfDist - 12, -10);

        // Base label (top terminal - n3)
        drawLabel('B', 10, -15);

        ctx.restore();
    }
}
