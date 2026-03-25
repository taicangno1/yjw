const STORAGE_PREFIX = 'three_kingdoms_';

export class Storage {
    
    public static set(key: string, value: any): void {
        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(STORAGE_PREFIX + key, jsonValue);
        } catch (e) {
            console.error('Storage set error:', e);
        }
    }
    
    public static get<T>(key: string, defaultValue?: T): T | null {
        try {
            const jsonValue = localStorage.getItem(STORAGE_PREFIX + key);
            if (jsonValue === null) {
                return defaultValue ?? null;
            }
            return JSON.parse(jsonValue) as T;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue ?? null;
        }
    }
    
    public static remove(key: string): void {
        localStorage.removeItem(STORAGE_PREFIX + key);
    }
    
    public static clear(): void {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    public static has(key: string): boolean {
        return localStorage.getItem(STORAGE_PREFIX + key) !== null;
    }
}
