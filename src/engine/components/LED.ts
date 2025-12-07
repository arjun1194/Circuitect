import { AbstractComponent, CircuitNode } from '../Physics';
import { TYPES } from '../../config/gameConfig';

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
