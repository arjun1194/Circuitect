import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class Capacitor extends AbstractComponent {
    capacitance: number = 10;

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.CAPACITOR, n1, n2);
    }

    getResistance(): number {
        return 1000000;
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
        ctx.lineTo(-10, 0);
        ctx.moveTo(10, 0);
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        ctx.fillStyle = '#3d59a1';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a9b1d6';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.fillRect(-2, -10, 4, 6);

        ctx.fillStyle = theme.colors.accent || '#7dcfff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText((this.capacitance) + "µF", 0, -12);
        ctx.restore();
    }
}
