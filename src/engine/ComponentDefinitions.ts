/**
 * Circuit Architect - Component Definitions
 * Component rendering logic and metadata.
 * 
 * Note: Draw functions receive the canvas context and the component instance.
 */

import { Component } from './Physics';
import { TYPES, DEFAULT_BATTERY_VOLTAGE } from '../config/gameConfig';

export interface ComponentDef {
    name: string;
    color: string;
    r: number;
    category: string;
    voltage?: number; // For Battery
    drop?: number;    // For LED
    capacitance?: number; // For Capacitor
    ledColors?: Record<string, { on: string; off: string; glow: string }>;
    draw?: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => void;
    logic?: string; // For Chip
}

// Helper to draw rounded rect
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

export const COMPONENT_DEFS: Record<string, ComponentDef> = {
    [TYPES.WIRE]: {
        name: 'Wire',
        color: '#565f89', // Will be overridden by theme in Renderer if dynamic
        r: 0.1,
        category: 'Basic',
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => { /* Handled in main draw loop */ }
    },
    [TYPES.BATTERY]: {
        name: 'Battery',
        color: '#ff9e64',
        r: 0.1,
        category: 'Power',
        voltage: DEFAULT_BATTERY_VOLTAGE,
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const voltage = c.voltage || DEFAULT_BATTERY_VOLTAGE;
            // Calculate distance for leads
            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
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
    },
    [TYPES.RESISTOR]: {
        name: 'Resistor',
        color: '#e0af68',
        r: 220,
        category: 'Passive',
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
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

            ctx.fillStyle = '#f2e6ce';
            roundRect(ctx, -20, -6, 40, 12, 5);
            ctx.fill();
            const drawBand = (x: number, color: string) => {
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
        ledColors: {
            red: { on: 'rgba(255, 50, 50, 1)', off: 'rgba(100, 20, 20, 0.5)', glow: '#ff0000' },
            green: { on: 'rgba(50, 255, 50, 1)', off: 'rgba(20, 100, 20, 0.5)', glow: '#00ff00' },
            blue: { on: 'rgba(50, 100, 255, 1)', off: 'rgba(20, 40, 100, 0.5)', glow: '#0066ff' },
            yellow: { on: 'rgba(255, 220, 50, 1)', off: 'rgba(100, 85, 20, 0.5)', glow: '#ffcc00' },
            white: { on: 'rgba(255, 255, 255, 1)', off: 'rgba(100, 100, 100, 0.5)', glow: '#ffffff' }
        },
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const on = param > 0;
            const ledColor = c.ledColor || 'red';
            // Access definition from this object instance or hardcoded backup
            const def = COMPONENT_DEFS[TYPES.LED];
            const colors = (def.ledColors && def.ledColors[ledColor]) ? def.ledColors[ledColor] : (def.ledColors ? def.ledColors.red : { on: 'red', off: 'darkred', glow: 'red' });
            const color = on ? colors.on : colors.off;

            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
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
    },
    [TYPES.SWITCH]: {
        name: 'Switch',
        color: '#bb9af7',
        r: 0.1,
        category: 'Control',
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
            const halfDist = dist / 2;

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
        capacitance: 10,
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
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
            ctx.fillText((c.capacitance || 10) + "µF", 0, -12);
            ctx.restore();
        }
    },
    [TYPES.TRANSISTOR]: {
        name: 'NPN Transistor',
        color: '#ff9e64',
        r: 1000,
        category: 'Active',
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
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
    },
    [TYPES.CHIP]: {
        name: 'Logic Chip',
        color: '#fff',
        r: 1000,
        category: 'Abstraction',
        logic: 'AND',
        draw: (ctx: CanvasRenderingContext2D, param: any, c: Component, theme: any) => {
            const dist = Math.hypot(c.n2.x - c.n1.x, c.n2.y - c.n1.y);
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
            ctx.fillText(c.logic || 'AND', 0, 4);
            ctx.restore();
        }
    }
};
