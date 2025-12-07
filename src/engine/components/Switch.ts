import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class Switch extends AbstractComponent {
    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.SWITCH, n1, n2);
    }

    getResistance(): number {
        return this.param === 1 ? 0 : Infinity;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;
        const open = this.param === 0;

        ctx.save();
        // Leads
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-15, 0);
        ctx.moveTo(15, 0);
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.fillRect(-15, -8, 30, 16);
        ctx.fillStyle = '#eee';
        if (!open) ctx.rotate(Math.PI / 8);
        else ctx.rotate(-Math.PI / 4);
        ctx.fillRect(-2, -20, 4, 20);
        ctx.fillStyle = '#d65d0e';
        ctx.beginPath();
        ctx.arc(0, -22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
