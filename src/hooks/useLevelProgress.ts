import { useEffect } from 'react';
import { STORAGE_KEY } from '../config/gameConfig';

/**
 * Custom hook for persisting and loading level progress
 */
export function useLevelProgress(levelIndex: number, maxUnlockedLevel: number) {
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const maxLevel = saved ? parseInt(saved) : 0;
        if (levelIndex > maxLevel) {
            localStorage.setItem(STORAGE_KEY, String(levelIndex));
        }
    }, [levelIndex, maxUnlockedLevel]);
}
