import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES, DEFAULT_BATTERY_VOLTAGE } from '../../config/gameConfig';
import { roundRect } from './utils';

export class Battery extends AbstractComponent {
    voltage: number;

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.BATTERY, n1, n2);
        this.voltage = DEFAULT_BATTERY_VOLTAGE;
    }

    getResistance(): number {
        return 0;
    }

    override getSourceVoltage(): number {
        return this.voltage;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const voltage = this.voltage;
        const dist = Math.hypot(this.n2.x - this.n1.x, this.n2.y - this.n1.y);
        const halfDist = dist / 2;

        // Calculate angle for counter-rotation of labels
        const angle = Math.atan2(this.n2.y - this.n1.y, this.n2.x - this.n1.x);

        ctx.save();

        // Draw Leads
        ctx.strokeStyle = theme.colors.wire || '#565f89';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfDist, 0);
        ctx.lineTo(-12, 0);
        ctx.moveTo(12, 0);
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

        // Voltage text (stays with component rotation)
        ctx.font = "bold 10px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(voltage + "V", 0, 10);

        // Terminal labels - counter-rotate to keep text horizontal
        ctx.font = 'bold 12px monospace';
        ctx.textBaseline = 'middle';

        // Helper function to draw counter-rotated text
        const drawLabel = (text: string, x: number, y: number, color: string) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-angle); // Counter-rotate to keep text horizontal
            ctx.fillStyle = color;
            ctx.fillText(text, 0, 0);
            ctx.restore();
        };

        // Positive terminal label (n1 side - left)
        drawLabel('+', -halfDist + 12, -10, theme.colors.warning || '#e0af68');

        // Negative terminal label (n2 side - right)
        drawLabel('−', halfDist - 12, -10, '#aaa');

        ctx.restore();
    }
}
