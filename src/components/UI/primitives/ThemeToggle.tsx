import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { IconButton } from './IconButton';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <IconButton
            label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
        >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>
    );
}
