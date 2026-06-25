import { useCallback, useEffect, useState } from 'react';

/**
 * Theme management for Circuitect.
 *
 * The active theme is stored as a `data-theme` attribute on <html>, which drives
 * the CSS design tokens in index.css. The canvas renderer reads the same tokens
 * at runtime, so a theme change re-colors both the DOM and the canvas.
 */
export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'circuitect-theme';
/** Fired on <window> whenever the theme changes, so non-React consumers (the
 *  canvas renderer) can re-resolve their colors. */
export const THEME_CHANGE_EVENT = 'circuitect:theme-change';

export function getStoredTheme(): ThemeMode | null {
    try {
        const v = localStorage.getItem(THEME_STORAGE_KEY);
        return v === 'dark' || v === 'light' ? v : null;
    } catch {
        return null;
    }
}

export function getSystemTheme(): ThemeMode {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
}

export function getInitialTheme(): ThemeMode {
    return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: mode }));
}

export function useTheme() {
    const [theme, setThemeState] = useState<ThemeMode>(
        () => (document.documentElement.getAttribute('data-theme') as ThemeMode | null) ?? getInitialTheme()
    );

    // Apply + persist on change.
    useEffect(() => {
        applyTheme(theme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            /* localStorage unavailable (private mode / quota) — ignore */
        }
    }, [theme]);

    // Follow the OS preference until the user makes an explicit choice.
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const handler = () => {
            if (!getStoredTheme()) setThemeState(getSystemTheme());
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    const setTheme = useCallback((mode: ThemeMode) => setThemeState(mode), []);

    return { theme, toggleTheme, setTheme };
}
