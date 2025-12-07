import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class Wire extends AbstractComponent {
    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.WIRE, n1, n2);
    }

    getResistance(): number {
        return 0;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        ctx.beginPath();
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.moveTo(this.n1.x, this.n1.y);
        ctx.lineTo(this.n2.x, this.n2.y);
        ctx.stroke();

        // Draw particles if current flows
        if (Math.abs(this.current) > 0.001) {
            // Logic for particles currently in Renderer, should be moved or called?
            // Renderer has `drawCurrent`. We can call it if we pass renderer?
            // Or we just rely on Renderer to draw current *on top*?
            // The old Renderer called `drawCurrent(c)` after drawing component.
            // Im implementing `draw` to just draw the component body/wire.
        }
    }
}

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
        ctx.lineTo(-20, 0); // Connect to body left
        ctx.moveTo(20, 0);  // Connect body right
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
        ctx.lineTo(-2, 0);
        ctx.moveTo(2, 0); // Capacitor gap
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
