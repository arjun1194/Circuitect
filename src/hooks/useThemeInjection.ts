import { useEffect } from 'react';
import { theme } from '../config/theme';

/**
 * Custom hook for injecting theme CSS variables into the document
 */
export function useThemeInjection() {
    useEffect(() => {
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}-color`, value);
        });
    }, []);
}
