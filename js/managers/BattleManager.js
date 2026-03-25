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
            'level_01_01': [{ id: 'enemy_zhangjiao', name: '张角', level: 1, troop: 'caster' }],
            'level_01_02': [
                { id: 'enemy_zhangjiao', name: '张角', level: 2, troop: 'caster' },
                { id: 'enemy_zhangbao', name: '张宝', level: 1, troop: 'caster' }
            ],
            'level_01_03': [
                { id: 'enemy_zhangjiao', name: '张角', level: 3, troop: 'caster' },
                { id: 'enemy_zhangbao', name: '张宝', level: 2, troop: 'caster' },
                { id: 'enemy_zhangliang', name: '张梁', level: 2, troop: 'infantry' }
            ],
            'level_02_01': [
                { id: 'enemy_liru', name: '李儒', level: 5, troop: 'caster' },
                { id: 'enemy_xurong', name: '徐荣', level: 4, troop: 'infantry' }
            ],
            'level_02_02': [{ id: 'enemy_lvbu', name: '吕布', level: 8, troop: 'cavalry' }],
            'level_02_03': [
                { id: 'enemy_lvbu', name: '吕布', level: 10, troop: 'cavalry' },
                { id: 'enemy_huaxiong', name: '华雄', level: 8, troop: 'infantry' }
            ],
            'level_03_01': [
                { id: 'enemy_caocao', name: '曹操', level: 12, troop: 'cavalry' },
                { id: 'enemy_yuanshao', name: '袁绍', level: 11, troop: 'infantry' }
            ],
            'level_03_02': [{ id: 'enemy_caocao', name: '曹操', level: 15, troop: 'cavalry' }],
            'level_03_03': [
                { id: 'enemy_liubei', name: '刘备', level: 12, troop: 'infantry' },
                { id: 'enemy_guanyu', name: '关羽', level: 13, troop: 'cavalry' },
                { id: 'enemy_zhangfei', name: '张飞', level: 12, troop: 'infantry' }
            ],
            'level_03_04': [
                { id: 'enemy_sunjian', name: '孙坚', level: 14, troop: 'cavalry' },
                { id: 'enemy_sunce', name: '孙策', level: 13, troop: 'cavalry' }
            ],
            'level_04_01': [
                { id: 'enemy_zhouyu', name: '周瑜', level: 18, troop: 'caster' },
                { id: 'enemy_huanggai', name: '黄盖', level: 16, troop: 'infantry' }
            ],
            'level_04_02': [
                { id: 'enemy_caocao', name: '曹操', level: 20, troop: 'cavalry' },
                { id: 'enemy_caoren', name: '曹仁', level: 18, troop: 'infantry' }
            ],
            'level_04_03': [
                { id: 'enemy_guanyu', name: '关羽', level: 18, troop: 'cavalry' },
                { id: 'enemy_zhangfei', name: '张飞', level: 17, troop: 'infantry' }
            ],
            'level_04_04': [
                { id: 'enemy_liubei', name: '刘备', level: 20, troop: 'infantry' },
                { id: 'enemy_huangzhong', name: '黄忠', level: 18, troop: 'archer' }
            ],
            'level_05_01': [
                { id: 'enemy_menghuo', name: '孟获', level: 22, troop: 'infantry' },
                { id: 'enemy_zhurong', name: '祝融夫人', level: 20, troop: 'archer' }
            ],
            'level_05_02': [
                { id: 'enemy_zhugeliang', name: '诸葛亮', level: 25, troop: 'caster' },
                { id: 'enemy_jiangwei', name: '姜维', level: 22, troop: 'cavalry' }
            ],
            'level_05_03': [
                { id: 'enemy_zhanghe', name: '张郃', level: 24, troop: 'cavalry' },
                { id: 'enemy_mashu', name: '马谡', level: 20, troop: 'caster' }
            ],
            'level_06_01': [{ id: 'enemy_simazhao', name: '司马昭', level: 28, troop: 'caster' }],
            'level_06_02': [
                { id: 'enemy_dengai', name: '邓艾', level: 28, troop: 'cavalry' },
                { id: 'enemy_zhonghui', name: '钟会', level: 26, troop: 'caster' }
            ],
            'level_06_03': [
                { id: 'enemy_wangjun', name: '王濬', level: 30, troop: 'cavalry' },
                { id: 'enemy_sunhao', name: '孙皓', level: 25, troop: 'infantry' }
            ],
            'level_06_04': [{ id: 'enemy_jinwudi', name: '晋武帝', level: 35, troop: 'cavalry' }]
        };

        const enemies = enemyConfigs[levelId] || enemyConfigs['level_01_01'];
        
        return enemies.map(config => ({
            id: config.id,
            name: config.name,
            quality: 'purple',
            troop: config.troop || 'infantry',
            level: Math.floor(config.level * mult),
            exp: 0,
            star: 2,
            attack: Math.floor(80 * mult),
            defense: Math.floor(60 * mult),
            hp: Math.floor(800 * mult),
            maxHp: Math.floor(800 * mult),
            speed: 45 + config.level,
            critRate: 0.1,
            dodgeRate: 0.05,
            comboRate: 0.12,
            equipment: [null, null, null, null],
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
        return this.calculateDamageWithSkill(attacker, defender, null);
    }

    calculateDamageWithSkill(attacker, defender, skill) {
        let damage;
        
        if (skill && skill.coefficient > 0) {
            damage = attacker.getTotalAttack() * skill.coefficient - defender.getTotalDefense() * 0.5;
        } else {
            damage = attacker.getTotalAttack() - defender.getTotalDefense() * 0.5;
        }
        
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
            isCombo,
            skillUsed: skill ? skill.name : null
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
            'level_02_01', 'level_02_02', 'level_02_03',
            'level_03_01', 'level_03_02', 'level_03_03', 'level_03_04',
            'level_04_01', 'level_04_02', 'level_04_03', 'level_04_04',
            'level_05_01', 'level_05_02', 'level_05_03',
            'level_06_01', 'level_06_02', 'level_06_03', 'level_06_04'
        ];
        
        const currentIndex = levelOrder.indexOf(levelId);
        if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
            return levelOrder[currentIndex + 1];
        }
        return null;
    }
}
