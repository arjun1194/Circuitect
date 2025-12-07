import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class Resistor extends AbstractComponent {
    resistance: number = 220;

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.RESISTOR, n1, n2);
        this.resistance = 220;
    }

    getResistance(): number {
        return this.resistance;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;

        ctx.save();

        // Draw Leads
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-20, 0);
        ctx.moveTo(20, 0);
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#f2e6ce';
        this.roundRect(ctx, -20, -6, 40, 12, 5);
        ctx.fill();

        // Bands
        const drawBand = (x: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, -6, 4, 12);
        };
        drawBand(-12, '#a52a2a');
        drawBand(-4, '#000000');
        drawBand(4, '#ff0000');
        drawBand(12, '#d4af37');

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText((this.resistance) + "Ω", 0, -10);
        ctx.restore();
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}
