class DataManager {
    static _instance = null;
    
    constructor() {
        if (DataManager._instance) {
            return DataManager._instance;
        }
        DataManager._instance = this;
        
        this._playerData = null;
        this._saveInterval = 30000;
        this.initPlayerData();
    }

    static getInstance() {
        if (!DataManager._instance) {
            DataManager._instance = new DataManager();
        }
        return DataManager._instance;
    }

    initPlayerData() {
        this._playerData = {
            uid: this.generateUID(),
            nickname: '玩家' + Math.floor(Math.random() * 10000),
            level: 1,
            gold: 1000,
            yuanbao: 0,
            energy: 100,
            maxEnergy: 100,
            lastEnergyTime: Date.now(),
            lastOfflineTime: Date.now(),
            heroes: [],
            formation: [],
            equipments: [],
            heroFragments: {},
            items: { sweepTicket: 5 },
            currentChapter: 1,
            currentLevel: 1,
            unlockedLevels: ['level_01_01'],
            completedLevels: [],
            friends: [],
            friendRequests: [],
            leagueId: '',
            leagueContribution: 0
        };

        this.initStarterHeroes();
        this.initStarterEquipments();
    }

    initStarterHeroes() {
        const heroConfigs = [
            { id: 'hero_001', name: '关羽', quality: 'orange', troop: 'cavalry' },
            { id: 'hero_002', name: '张飞', quality: 'orange', troop: 'infantry' },
            { id: 'hero_003', name: '刘备', quality: 'orange', troop: 'infantry' },
            { id: 'hero_004', name: '曹操', quality: 'orange', troop: 'cavalry' },
            { id: 'hero_005', name: '赵云', quality: 'orange', troop: 'cavalry' }
        ];

        heroConfigs.forEach((config, index) => {
            const hero = {
                id: config.id,
                name: config.name,
                quality: config.quality,
                troop: config.troop,
                level: 1,
                exp: 0,
                star: 1,
                attack: 100 + index * 5,
                defense: 80 + index * 3,
                hp: 1000 + index * 50,
                maxHp: 1050 + index * 50,
                speed: 50 + index * 2,
                critRate: 0.1,
                dodgeRate: 0.05,
                comboRate: 0.15,
                equipment: [null, null, null, null],
                isLocked: false
            };
            this._playerData.heroes.push(hero);
            
            if (index < 3) {
                this._playerData.formation.push(config.id);
            }
        });
    }

    initStarterEquipments() {
        const starterEquipments = [
            { id: 'equip_001', name: '新手长剑', type: 'weapon', quality: 'green', attackBonus: 10, hpBonus: 0, defenseBonus: 0 },
            { id: 'equip_002', name: '布衣', type: 'armor', quality: 'green', attackBonus: 0, hpBonus: 50, defenseBonus: 5 },
            { id: 'equip_003', name: '皮帽', type: 'helmet', quality: 'green', attackBonus: 0, hpBonus: 30, defenseBonus: 3 },
            { id: 'equip_004', name: '护腕', type: 'accessory', quality: 'green', attackBonus: 5, hpBonus: 20, defenseBonus: 2 }
        ];
        
        starterEquipments.forEach(config => {
            this._playerData.equipments.push(config);
        });
    }

    generateUID() {
        return 'player_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    save() {
        this._playerData.lastOfflineTime = Date.now();
        const saveData = JSON.stringify(this._playerData);
        localStorage.setItem('playerData', saveData);
        localStorage.setItem('lastSaveTime', Date.now().toString());
    }

    load() {
        const saveData = localStorage.getItem('playerData');
        if (saveData) {
            try {
                this._playerData = JSON.parse(saveData);
                this.updateEnergy();
                return true;
            } catch (e) {
                console.error('Failed to load player data:', e);
                return false;
            }
        }
        return false;
    }

    reset() {
        localStorage.removeItem('playerData');
        localStorage.removeItem('lastSaveTime');
        this.initPlayerData();
    }

    getPlayerData() {
        return this._playerData;
    }

    addGold(amount) {
        this._playerData.gold += amount;
        this.save();
    }

    spendGold(amount) {
        if (this._playerData.gold >= amount) {
            this._playerData.gold -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addYuanbao(amount) {
        this._playerData.yuanbao += amount;
        this.save();
    }

    addEnergy(amount) {
        this._playerData.energy = Math.min(this._playerData.energy + amount, this._playerData.maxEnergy);
        this.save();
    }

    consumeEnergy(amount) {
        if (this._playerData.energy >= amount) {
            this._playerData.energy -= amount;
            this._playerData.lastEnergyTime = Date.now();
            this.save();
            return true;
        }
        return false;
    }

    updateEnergy() {
        const now = Date.now();
        const elapsed = (now - this._playerData.lastEnergyTime) / 1000;
        const energyRecovered = Math.floor(elapsed / 300);
        if (energyRecovered > 0) {
            this._playerData.energy = Math.min(this._playerData.energy + energyRecovered, this._playerData.maxEnergy);
            this._playerData.lastEnergyTime = now;
        }
    }

    calculateUpgradeCost(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    upgradeHero(heroId) {
        const hero = this._playerData.heroes.find(h => h.id === heroId);
        if (!hero) return false;

        const cost = this.calculateUpgradeCost(hero.level);
        if (this.spendGold(cost)) {
            hero.level += 1;
            hero.attack += 5;
            hero.defense += 4;
            hero.maxHp += 50;
            hero.hp = hero.maxHp;
            this.save();
            return true;
        }
        return false;
    }

    isLevelUnlocked(levelId) {
        return this._playerData.unlockedLevels.includes(levelId);
    }

    unlockLevel(levelId) {
        if (!this._playerData.unlockedLevels.includes(levelId)) {
            this._playerData.unlockedLevels.push(levelId);
            this.save();
        }
    }

    completeLevel(levelId) {
        if (!this._playerData.completedLevels.includes(levelId)) {
            this._playerData.completedLevels.push(levelId);
            this.save();
        }
    }

    isLevelCompleted(levelId) {
        return this._playerData.completedLevels.includes(levelId);
    }

    getFormationHeroes() {
        return this._playerData.heroes.filter(h => this._playerData.formation.includes(h.id));
    }

    addEquipment(equipment) {
        this._playerData.equipments.push(equipment);
        this.save();
    }

    removeEquipment(equipmentId) {
        const index = this._playerData.equipments.findIndex(e => e.id === equipmentId);
        if (index !== -1) {
            this._playerData.equipments.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    getBackpackEquipments() {
        return this._playerData.equipments.filter(e => {
            const hero = this._playerData.heroes.find(h => h.equipment.includes(e.id));
            return !hero;
        });
    }

    equipItemToHero(heroId, equipmentId, slotIndex) {
        const hero = this._playerData.heroes.find(h => h.id === heroId);
        if (!hero) return null;

        const equipment = this._playerData.equipments.find(e => e.id === equipmentId);
        if (!equipment) return null;

        const oldEquipmentId = hero.equipment[slotIndex];
        hero.equipment[slotIndex] = equipmentId;
        this.save();

        return oldEquipmentId;
    }

    unequipItemFromHero(heroId, slotIndex) {
        const hero = this._playerData.heroes.find(h => h.id === heroId);
        if (!hero) return null;

        const equipmentId = hero.equipment[slotIndex];
        if (equipmentId) {
            hero.equipment[slotIndex] = null;
            this.save();
            return equipmentId;
        }
        return null;
    }

    getHeroEquipment(heroId) {
        const hero = this._playerData.heroes.find(h => h.id === heroId);
        if (!hero) return [];

        return hero.equipment.map(eId => {
            if (eId) {
                return this._playerData.equipments.find(e => e.id === eId);
            }
            return null;
        }).filter(e => e !== undefined);
    }
}
