/**
 * Circuit Architect - Component Definitions
 * Component rendering and properties
 */

import { TYPES, DEFAULT_BATTERY_VOLTAGE } from './config.js';

// Component definitions with rendering functions
export const COMPONENTS = {
    [TYPES.WIRE]: {
        name: 'Wire',
        color: '#565f89',
        r: 0.1,
        category: 'Basic',
        draw: (ctx, c) => { /* Handled in main draw loop */ }
    },
    [TYPES.BATTERY]: {
        name: 'Battery',
        color: '#ff9e64',
        r: 0.1,
        category: 'Power',
        voltage: DEFAULT_BATTERY_VOLTAGE,
        draw: (ctx, param, c) => {
            const voltage = c.voltage || DEFAULT_BATTERY_VOLTAGE;
            ctx.save();
            const grad = ctx.createLinearGradient(-15, -10, 15, 10);
            grad.addColorStop(0, '#444');
            grad.addColorStop(1, '#000');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(-12, -18, 24, 36, 4);
            ctx.fill();
            ctx.fillStyle = '#f7768e';
            ctx.beginPath();
            ctx.roundRect(-12, -5, 24, 23, 2);
            ctx.fill();
            ctx.fillStyle = '#aaa';
            ctx.beginPath();
            ctx.arc(0, 18, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e0af68';
            ctx.beginPath();
            ctx.arc(0, -20, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = "bold 10px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(voltage + "V", 0, 10);
            ctx.fillStyle = "#e0af68";
            ctx.fillText("+", 0, -10);
            ctx.restore();
        }
    },
    [TYPES.RESISTOR]: {
        name: 'Resistor',
        color: '#e0af68',
        r: 220,
        category: 'Passive',
        draw: (ctx, param, c) => {
            ctx.save();
            ctx.fillStyle = '#f2e6ce';
            ctx.beginPath();
            ctx.roundRect(-20, -6, 40, 12, 5);
            ctx.fill();
            const drawBand = (x, color) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, -6, 4, 12);
            };
            drawBand(-12, '#a52a2a');
            drawBand(-4, '#000000');
            drawBand(4, '#ff0000');
            drawBand(12, '#d4af37');
            ctx.fillStyle = '#fff';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText((c.resistance || 220) + "Ω", 0, -10);
            ctx.restore();
        }
    },
    [TYPES.LED]: {
        name: 'LED',
        color: '#f7768e',
        r: 100,
        category: 'Output',
        drop: 2.0,
        // LED color presets with on/off colors and glow
        ledColors: {
            red: { on: 'rgba(255, 50, 50, 1)', off: 'rgba(100, 20, 20, 0.5)', glow: '#ff0000' },
            green: { on: 'rgba(50, 255, 50, 1)', off: 'rgba(20, 100, 20, 0.5)', glow: '#00ff00' },
            blue: { on: 'rgba(50, 100, 255, 1)', off: 'rgba(20, 40, 100, 0.5)', glow: '#0066ff' },
            yellow: { on: 'rgba(255, 220, 50, 1)', off: 'rgba(100, 85, 20, 0.5)', glow: '#ffcc00' },
            white: { on: 'rgba(255, 255, 255, 1)', off: 'rgba(100, 100, 100, 0.5)', glow: '#ffffff' }
        },
        draw: (ctx, param, c) => {
            const on = param > 0;
            const ledColor = c.ledColor || 'red';
            const colors = COMPONENTS[TYPES.LED].ledColors[ledColor] || COMPONENTS[TYPES.LED].ledColors.red;
            const color = on ? colors.on : colors.off;

            ctx.save();
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
    },
    [TYPES.SWITCH]: {
        name: 'Switch',
        color: '#bb9af7',
        r: 0.1,
        category: 'Control',
        draw: (ctx, param) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(-15, -8, 30, 16);
            ctx.save();
            ctx.fillStyle = '#eee';
            if (param) ctx.rotate(Math.PI / 8);
            else ctx.rotate(-Math.PI / 4);
            ctx.fillRect(-2, -20, 4, 20);
            ctx.fillStyle = '#d65d0e';
            ctx.beginPath();
            ctx.arc(0, -22, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },
    [TYPES.CAPACITOR]: {
        name: 'Capacitor',
        color: '#7dcfff',
        r: 1000000,
        category: 'Passive',
        draw: (ctx, param, c) => {
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
            ctx.fillStyle = '#7dcfff';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText((c.capacitance || 10) + "µF", 0, -12);
        }
    },
    [TYPES.TRANSISTOR]: {
        name: 'NPN Transistor',
        color: '#ff9e64',
        r: 1000,
        category: 'Active',
        draw: (ctx, param, c) => {
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(0, 5, 12, Math.PI, 0);
            ctx.lineTo(12, 5);
            ctx.lineTo(-12, 5);
            ctx.fill();
            ctx.fillStyle = '#silver';
            ctx.beginPath();
            ctx.arc(-6, 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(6, 8, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.font = '8px monospace';
            ctx.fillStyle = '#888';
            ctx.fillText('B', 5, -2);
        }
    },
    [TYPES.CHIP]: {
        name: 'Logic Chip',
        color: '#fff',
        r: 1000,
        category: 'Abstraction',
        draw: (ctx, param, c) => {
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
            ctx.fillText(c.logic || 'AND', 0, 4);
        }
    }
};
