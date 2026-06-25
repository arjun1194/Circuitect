/**
 * Canvas theme resolver.
 *
 * The canvas can't use Tailwind utility classes, so it reads the same design
 * tokens (CSS custom properties on <html>) that drive the DOM. Colors are
 * resolved once and cached; call `refreshCanvasTheme()` when the theme changes
 * (the app fires THEME_CHANGE_EVENT — see useTheme.ts).
 *
 * Falls back to the dark palette when no DOM is available (e.g. unit tests),
 * so the renderer never throws outside the browser.
 */
export interface CanvasTheme {
    colors: Record<string, string>;
}

const TOKENS: Record<string, string> = {
    bg: '--c-canvas',
    panel: '--c-surface',
    accent: '--c-accent',
    text: '--c-text',
    success: '--c-success',
    danger: '--c-danger',
    warning: '--c-warning',
    grid: '--c-grid',
    wire: '--c-wire',
    node: '--c-node',
    current: '--c-current',
    cyan: '--c-cyan',
};

const FALLBACK: Record<string, string> = {
    bg: '#13131a',
    panel: '#1b1e29',
    accent: '#7aa2f7',
    text: '#c8d0f0',
    success: '#9ece6a',
    danger: '#f7768e',
    warning: '#e0af68',
    grid: '#2c3257',
    wire: '#7f8bb0',
    node: '#5a6488',
    current: '#e0af68',
    cyan: '#7dcfff',
};

let cache: CanvasTheme | null = null;

export function refreshCanvasTheme(): CanvasTheme {
    if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
        cache = { colors: { ...FALLBACK } };
        return cache;
    }
    const cs = getComputedStyle(document.documentElement);
    const colors: Record<string, string> = {};
    for (const key in TOKENS) {
        const value = cs.getPropertyValue(TOKENS[key]).trim();
        colors[key] = value || FALLBACK[key];
    }
    cache = { colors };
    return cache;
}

export function getCanvasTheme(): CanvasTheme {
    return cache ?? refreshCanvasTheme();
}
