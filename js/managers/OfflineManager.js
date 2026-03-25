class OfflineManager {
    static _instance = null;
    
    constructor() {
        if (OfflineManager._instance) {
            return OfflineManager._instance;
        }
        OfflineManager._instance = this;
    }

    static getInstance() {
        return OfflineManager._instance;
    }

    recordOfflineTime() {
        const playerData = DataManager.getInstance().getPlayerData();
        playerData.lastOfflineTime = Date.now();
    }

    checkOfflineEarnings() {
        const playerData = DataManager.getInstance().getPlayerData();
        const now = Date.now();
        const offlineMs = now - playerData.lastOfflineTime;
        const offlineSeconds = Math.floor(offlineMs / 1000);
        
        if (offlineSeconds < 60) return;
        
        const earnings = this.calculateOfflineEarnings(offlineSeconds);
        
        GameManager.getInstance().loadScene('OfflineEarningsScene', { earnings: earnings });
    }

    getOfflineDuration() {
        const playerData = DataManager.getInstance().getPlayerData();
        const now = Date.now();
        const offlineMs = now - playerData.lastOfflineTime;
        const offlineSeconds = Math.floor(offlineMs / 1000);
        return Math.min(offlineSeconds, 24 * 60 * 60);
    }

    calculateOfflineEarnings(duration) {
        const battlesPerMinute = 2;
        const totalBattles = Math.floor(duration / 60 * battlesPerMinute);
        const victories = Math.floor(totalBattles * 0.7);
        
        const baseGoldPerBattle = 100;
        const baseExpPerBattle = 50;
        
        const gold = baseGoldPerBattle * totalBattles;
        const exp = baseExpPerBattle * totalBattles;
        
        const heroFragments = {};
        if (Math.random() < 0.3) {
            const heroes = DataManager.getInstance().getPlayerData().heroes;
            const randomHero = heroes[Math.floor(Math.random() * heroes.length)];
            heroFragments[randomHero.id] = Math.floor(Math.random() * 5) + 1;
        }
        
        return {
            gold,
            exp,
            heroFragments,
            equipmentFragments: Math.floor(Math.random() * 10),
            duration,
            battlesCount: totalBattles,
            victoriesCount: victories
        };
    }

    claimOfflineEarnings() {
        const duration = this.getOfflineDuration();
        const earnings = this.calculateOfflineEarnings(duration);
        
        const playerData = DataManager.getInstance().getPlayerData();
        playerData.gold += earnings.gold;
        
        const heroes = playerData.heroes;
        heroes.forEach(hero => {
            hero.exp += Math.floor(earnings.exp / heroes.length);
        });
        
        Object.entries(earnings.heroFragments).forEach(([heroId, fragments]) => {
            playerData.heroFragments[heroId] = (playerData.heroFragments[heroId] || 0) + fragments;
        });
        
        DataManager.getInstance().save();
    }

    claimWithAd() {
        this.claimOfflineEarnings();
        
        const playerData = DataManager.getInstance().getPlayerData();
        playerData.gold *= 2;
        
        Object.keys(playerData.heroFragments).forEach(heroId => {
            playerData.heroFragments[heroId] *= 2;
        });
        
        DataManager.getInstance().save();
    }
}
