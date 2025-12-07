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
    }
}
