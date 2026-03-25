const STORAGE_PREFIX = 'three_kingdoms_';

const Storage = {
    set(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(STORAGE_PREFIX + key, jsonValue);
        } catch (e) {
            console.error('Storage set error:', e);
        }
    },

    get(key, defaultValue = null) {
        try {
            const jsonValue = localStorage.getItem(STORAGE_PREFIX + key);
            if (jsonValue === null) {
                return defaultValue;
            }
            return JSON.parse(jsonValue);
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        localStorage.removeItem(STORAGE_PREFIX + key);
    },

    clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },

    has(key) {
        return localStorage.getItem(STORAGE_PREFIX + key) !== null;
    }
};
