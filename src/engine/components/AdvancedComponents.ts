import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES, DEFAULT_BATTERY_VOLTAGE } from '../../config/gameConfig';

// Helper for drawing
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

export class Battery extends AbstractComponent {
    voltage: number;

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.BATTERY, n1, n2);
        this.voltage = DEFAULT_BATTERY_VOLTAGE;
    }

    getResistance(): number {
        return 100; // Intrinsic resistance?
    }

    override getSourceVoltage(): number {
        return this.voltage;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const voltage = this.voltage;
        // Calculate distance for leads
        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;

        ctx.save();

        // Draw Leads
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-12, 0); // Connect to body left
        ctx.moveTo(12, 0);  // Connect body right
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        // Gradient body
        const grad = ctx.createLinearGradient(-15, -10, 15, 10);
        grad.addColorStop(0, '#444');
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        roundRect(ctx, -12, -18, 24, 36, 4);
        ctx.fill();

        // Positive terminal
        ctx.fillStyle = theme.colors.danger || '#f7768e';
        roundRect(ctx, -12, -5, 24, 23, 2);
        ctx.fill();

        // Negative terminal dot
        ctx.fillStyle = '#aaa';
        ctx.beginPath();
        ctx.arc(0, 18, 4, 0, Math.PI * 2);
        ctx.fill();

        // Positive terminal dot
        ctx.fillStyle = theme.colors.warning || '#e0af68';
        ctx.beginPath();
        ctx.arc(0, -20, 5, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.font = "bold 10px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(voltage + "V", 0, 10);
        ctx.fillStyle = theme.colors.warning || "#e0af68";
        ctx.fillText("+", 0, -10);
        ctx.restore();
    }
}

export class LED extends AbstractComponent {
    ledColor: string = 'red';

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.LED, n1, n2);
    }

    getResistance(): number {
        return 100;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const on = this.param > 0;
        const ledColor = this.ledColor || 'red';

        const colorsMap: any = {
            red: { on: 'rgba(255, 50, 50, 1)', off: 'rgba(100, 20, 20, 0.5)', glow: '#ff0000' },
            green: { on: 'rgba(50, 255, 50, 1)', off: 'rgba(20, 100, 20, 0.5)', glow: '#00ff00' },
            blue: { on: 'rgba(50, 100, 255, 1)', off: 'rgba(20, 40, 100, 0.5)', glow: '#0066ff' },
            yellow: { on: 'rgba(255, 220, 50, 1)', off: 'rgba(100, 85, 20, 0.5)', glow: '#ffcc00' },
            white: { on: 'rgba(255, 255, 255, 1)', off: 'rgba(100, 100, 100, 0.5)', glow: '#ffffff' }
        };

        const colors = colorsMap[ledColor] || colorsMap.red;
        const color = on ? colors.on : colors.off;

        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;

        ctx.save();

        // Draw Leads
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-10, 0);
        ctx.moveTo(10, 0);
        ctx.lineTo(halfDist, 0);
        ctx.stroke();

        if (on) {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 20;
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -5, 10, 0, Math.PI * 2);
        ctx.fillRect(-10, -5, 20, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-3, -8, 3, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, 10);
        ctx.lineTo(-3, 0);
        ctx.moveTo(3, 10);
        ctx.lineTo(3, -2);
        ctx.stroke();
        ctx.restore();
    }
}

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
        ctx.fillStyle = '#C0C0C0'; // silver
        ctx.beginPath(); ctx.arc(-6, 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.font = '8px monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('B', 5, -2);
        ctx.restore();
    }
}

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
        ctx.arc(0, -14, 4, 0, Math.PI, false); // Removed Boolean arg if strict
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
