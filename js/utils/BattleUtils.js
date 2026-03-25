const TROOP_RESTRAINT = {
    infantry: {
        infantry: 1.0,
        cavalry: 1.1,
        archer: 0.9
    },
    cavalry: {
        infantry: 0.9,
        cavalry: 1.0,
        archer: 1.1
    },
    archer: {
        infantry: 1.1,
        cavalry: 0.9,
        archer: 1.0
    }
};

const BattleUtils = {
    getTroopRestraintBonus(attackerTroop, defenderTroop) {
        return TROOP_RESTRAINT[attackerTroop]?.[defenderTroop] ?? 1.0;
    },

    formatNumber(num) {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + '亿';
        }
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    },

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        }
        if (minutes > 0) {
            return `${minutes}分钟`;
        }
        return `${seconds}秒`;
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
};
