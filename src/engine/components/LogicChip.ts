import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class LogicChip extends AbstractComponent {
    logic: string = 'AND';

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.CHIP, n1, n2);
    }

    getResistance(): number {
        return 10000;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;

        ctx.save();
        // Leads
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-14, 0);
        ctx.moveTo(14, 0);
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-14, -14, 28, 28);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, -14, 4, 0, Math.PI, false);
        ctx.fill();
        ctx.fillStyle = '#aaa';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-18, -10 + i * 10, 4, 6);
            ctx.fillRect(14, -10 + i * 10, 4, 6);
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.logic || 'AND', 0, 4);
        ctx.restore();
    }
}
