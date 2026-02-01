
const STORAGE_KEY = 'nova_archives_read_registry';

/**
 * Mark a chapter as read in the local storage registry.
 * @param chapterId The unique ID of the chapter.
 */
export const markAsRead = (chapterId: string) => {
    if (!chapterId) return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        // Use Set to ensure uniqueness
        const set = new Set(raw ? JSON.parse(raw) : []);
        if (!set.has(chapterId)) {
            set.add(chapterId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
            // Dispatch event for UI updates if needed
            window.dispatchEvent(new Event('nova-read-status-updated'));
        }
    } catch (e) {
        console.warn('Failed to update read status', e);
    }
};

/**
 * Check if a chapter has been read.
 * @param chapterId The unique ID of the chapter.
 * @returns boolean
 */
export const hasRead = (chapterId: string): boolean => {
    if (!chapterId) return false;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return list.includes(chapterId);
    } catch (e) {
        return false;
    }
};

/**
 * Get all read chapter IDs.
 */
export const getAllReadStatus = (): string[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
};
