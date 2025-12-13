import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

export class LED extends AbstractComponent {
    ledColor: string = 'red';
    maxVoltage: number = 10; // Default max voltage rating (educational default)
    burnt: boolean = false;

    constructor(n1: CircuitNode, n2: CircuitNode) {
        super(TYPES.LED, n1, n2);
    }

    getResistance(): number {
        // Burnt LED has very high resistance (open circuit)
        return this.burnt ? 10000000 : 100;
    }

    draw(ctx: CanvasRenderingContext2D, theme: any): void {
        const on = this.param > 0 && !this.burnt;
        const ledColor = this.ledColor || 'red';

        const colorsMap: any = {
            red: { on: 'rgba(255, 50, 50, 1)', off: 'rgba(100, 20, 20, 0.5)', glow: '#ff0000' },
            green: { on: 'rgba(50, 255, 50, 1)', off: 'rgba(20, 100, 20, 0.5)', glow: '#00ff00' },
            blue: { on: 'rgba(50, 100, 255, 1)', off: 'rgba(20, 40, 100, 0.5)', glow: '#0066ff' },
            yellow: { on: 'rgba(255, 220, 50, 1)', off: 'rgba(100, 85, 20, 0.5)', glow: '#ffcc00' },
            white: { on: 'rgba(255, 255, 255, 1)', off: 'rgba(100, 100, 100, 0.5)', glow: '#ffffff' }
        };

        // Burnt LED colors
        const burntColors = {
            body: 'rgba(30, 25, 20, 0.9)',
            crack: '#1a1510',
            smoke: 'rgba(60, 50, 40, 0.3)'
        };

        const colors = colorsMap[ledColor] || colorsMap.red;
        const color = this.burnt ? burntColors.body : (on ? colors.on : colors.off);

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

        // Glow effect for working LED
        if (on && !this.burnt) {
            ctx.shadowColor = colors.glow;
            ctx.shadowBlur = 20;
        }

        // LED body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -5, 10, 0, Math.PI * 2);
        ctx.fillRect(-10, -5, 20, 10);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Burnt effect - cracks and charring
        if (this.burnt) {
            // Dark cracks
            ctx.strokeStyle = burntColors.crack;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-5, -8);
            ctx.lineTo(2, -2);
            ctx.lineTo(-3, 3);
            ctx.moveTo(4, -6);
            ctx.lineTo(0, 0);
            ctx.lineTo(5, 4);
            ctx.stroke();

            // Smoke particles effect
            ctx.fillStyle = burntColors.smoke;
            ctx.beginPath();
            ctx.arc(-2, -12, 3, 0, Math.PI * 2);
            ctx.arc(3, -14, 2, 0, Math.PI * 2);
            ctx.fill();

            // Burnt text indicator
            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = '#ff4444';
            ctx.textAlign = 'center';
            ctx.fillText('BURNT', 0, 18);
        } else {
            // Normal highlight reflection
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-3, -8, 3, 2, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // LED pins
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
