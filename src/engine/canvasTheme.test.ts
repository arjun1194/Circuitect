import { describe, it, expect } from 'vitest';
import { getCanvasTheme, refreshCanvasTheme } from './canvasTheme';

const REQUIRED_KEYS = ['bg', 'accent', 'text', 'success', 'danger', 'warning', 'grid', 'wire', 'node', 'current'];

describe('canvasTheme', () => {
    it('resolves to fallback colors when no DOM is available (node env)', () => {
        const theme = refreshCanvasTheme();
        // Every color the renderer reads must be defined (never undefined → "undefined" fillStyle).
        for (const key of REQUIRED_KEYS) {
            expect(theme.colors[key]).toBeTruthy();
        }
        // Fallback palette is concrete hex.
        expect(theme.colors.accent).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    });

    it('getCanvasTheme returns the cached resolution', () => {
        refreshCanvasTheme();
        const a = getCanvasTheme();
        const b = getCanvasTheme();
        expect(a).toBe(b);
    });
});
