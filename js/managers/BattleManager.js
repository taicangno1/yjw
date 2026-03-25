class BattleManager {
    static _instance = null;
    
    constructor() {
        if (BattleManager._instance) {
            return BattleManager._instance;
        }
        BattleManager._instance = this;
    }

    static getInstance() {
        if (!BattleManager._instance) {
            BattleManager._instance = new BattleManager();
        }
        return BattleManager._instance;
    }

    startBattle(levelId, difficulty) {
        this.currentLevelId = levelId;
        this.currentDifficulty = difficulty;
        
        const playerHeroData = DataManager.getInstance().getFormationHeroes();
        const enemyHeroData = this.generateEnemyHeroes(levelId, difficulty);
        
        this.playerHeroes = playerHeroData.map(data => new Hero(data, true));
        this.enemyHeroes = enemyHeroData.map(data => new Hero(data, false));
        
        this.battleState = 'ongoing';
        this.battleRewards = this.calculateRewards(levelId, difficulty);
    }

    generateEnemyHeroes(levelId, difficulty) {
        const levelMultiplier = { easy: 1, normal: 1.2, hard: 1.5 };
        const mult = levelMultiplier[this.currentDifficulty] || 1;
        
        const enemyConfigs = {
            'level_01_01': [{ id: 'enemy_zhangjiao', name: '张角', level: 1 }],
            'level_01_02': [
                { id: 'enemy_zhangjiao', name: '张角', level: 2 },
                { id: 'enemy_zhangbao', name: '张宝', level: 1 }
            ],
            'level_01_03': [
                { id: 'enemy_zhangjiao', name: '张角', level: 3 },
                { id: 'enemy_zhangbao', name: '张宝', level: 2 },
                { id: 'enemy_zhangliang', name: '张梁', level: 2 }
            ],
            'level_02_01': [{ id: 'enemy_liru', name: '李儒', level: 5 }],
            'level_02_02': [{ id: 'enemy_lvbu', name: '吕布', level: 8 }]
        };

        const enemies = enemyConfigs[levelId] || enemyConfigs['level_01_01'];
        
        return enemies.map(config => ({
            id: config.id,
            name: config.name,
            quality: 'blue',
            troop: 'infantry',
            level: Math.floor(config.level * mult),
            exp: 0,
            star: 1,
            attack: Math.floor(80 * mult),
            defense: Math.floor(60 * mult),
            hp: Math.floor(800 * mult),
            maxHp: Math.floor(800 * mult),
            speed: 45,
            critRate: 0.08,
            dodgeRate: 0.03,
            comboRate: 0.1,
            equipment: ['', '', '', ''],
            isLocked: false
        }));
    }

    calculateRewards(levelId, difficulty) {
        const baseRewards = {
            gold: 100,
            exp: 50,
            equipmentChance: 0.2,
            fragmentChance: 0.3
        };
        
        const multiplier = { easy: 1, normal: 1.5, hard: 2 };
        const mult = multiplier[this.currentDifficulty] || 1;
        
        let equipment = null;
        if (Math.random() < baseRewards.equipmentChance * mult) {
            equipment = this.generateEquipmentDrop(difficulty);
        }
        
        let fragment = null;
        if (Math.random() < baseRewards.fragmentChance) {
            fragment = this.generateFragmentDrop(levelId);
        }
        
        return {
            gold: Math.floor(baseRewards.gold * mult),
            exp: Math.floor(baseRewards.exp * mult),
            equipment: equipment,
            fragment: fragment
        };
    }

    generateFragmentDrop(levelId) {
        const fragmentHeroes = ['hero_001', 'hero_002', 'hero_003', 'hero_004', 'hero_005'];
        const heroId = fragmentHeroes[Math.floor(Math.random() * fragmentHeroes.length)];
        return {
            heroId: heroId,
            count: Math.floor(Math.random() * 3) + 1
        };
    }

    generateEquipmentDrop(difficulty) {
        const qualityMap = {
            easy: 'green',
            normal: 'blue',
            hard: 'purple'
        };
        
        const quality = qualityMap[difficulty] || 'green';
        return generateRandomEquipment(quality);
    }

    calculateDamage(attacker, defender) {
        let damage = attacker.attack - defender.defense * 0.5;
        
        const restraintBonus = BattleUtils.getTroopRestraintBonus(attacker.troop, defender.troop);
        damage *= restraintBonus;
        
        const isCrit = Math.random() < attacker.critRate;
        if (isCrit) {
            damage *= 2;
        }
        
        const isDodge = Math.random() < defender.dodgeRate;
        if (isDodge) {
            damage = 0;
        }
        
        const isCombo = Math.random() < attacker.comboRate;
        
        damage = Math.max(damage, 1);
        
        return { 
            damage: Math.floor(damage), 
            isCrit, 
            isDodge, 
            isCombo 
        };
    }

    getBattleData() {
        return {
            playerHeroes: this.playerHeroes,
            enemyHeroes: this.enemyHeroes
        };
    }

    getBattleRewards() {
        return this.battleRewards;
    }

    claimRewards() {
        const playerData = DataManager.getInstance().getPlayerData();
        playerData.gold += this.battleRewards.gold;
        
        this.playerHeroes.forEach(hero => {
            hero.addExp(this.battleRewards.exp);
        });
        
        if (this.battleRewards.equipment) {
            DataManager.getInstance().addEquipment(this.battleRewards.equipment);
        }
        
        if (this.battleRewards.fragment) {
            const { heroId, count } = this.battleRewards.fragment;
            playerData.heroFragments[heroId] = (playerData.heroFragments[heroId] || 0) + count;
        }
        
        const nextLevel = this.getNextLevel(this.currentLevelId);
        if (nextLevel) {
            DataManager.getInstance().unlockLevel(nextLevel);
        }
        
        DataManager.getInstance().completeLevel(this.currentLevelId);
        DataManager.getInstance().save();
    }

    getNextLevel(levelId) {
        const levelOrder = [
            'level_01_01', 'level_01_02', 'level_01_03',
            'level_02_01', 'level_02_02'
        ];
        
        const currentIndex = levelOrder.indexOf(levelId);
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            return levelOrder[currentIndex + 1];
        }
        return null;
    }
}
