import { TroopType } from '../data/PlayerData';

const RESTRAINT_TABLE: { [key: string]: { [key: string]: number } } = {
    [TroopType.INFANTRY]: {
        [TroopType.INFANTRY]: 1.0,
        [TroopType.CAVALRY]: 1.1,
        [TroopType.ARCHER]: 0.9
    },
    [TroopType.CAVALRY]: {
        [TroopType.INFANTRY]: 0.9,
        [TroopType.CAVALRY]: 1.0,
        [TroopType.ARCHER]: 1.1
    },
    [TroopType.ARCHER]: {
        [TroopType.INFANTRY]: 1.1,
        [TroopType.CAVALRY]: 0.9,
        [TroopType.ARCHER]: 1.0
    }
};

export function getTroopRestraintBonus(attackerTroop: TroopType, defenderTroop: TroopType): number {
    return RESTRAINT_TABLE[attackerTroop]?.[defenderTroop] ?? 1.0;
}

export function formatNumber(num: number): string {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    }
    if (minutes > 0) {
        return `${minutes}分钟`;
    }
    return `${seconds}秒`;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
