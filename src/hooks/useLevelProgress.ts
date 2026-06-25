import { useEffect } from 'react';
import { STORAGE_KEY } from '../config/gameConfig';

/**
 * Persist the highest level the player has reached. Storage access is guarded so
 * disabled/quota-limited storage can't crash the app.
 */
export function useLevelProgress(levelIndex: number) {
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const maxLevel = saved ? parseInt(saved, 10) : 0;
            if (!Number.isInteger(maxLevel) || levelIndex > maxLevel) {
                localStorage.setItem(STORAGE_KEY, String(levelIndex));
            }
        } catch {
            /* storage unavailable — progress just won't persist */
        }
    }, [levelIndex]);
}
