class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.currentDifficulty = 'normal';
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createChapterMap();
        this.createDifficultySelector();
    }

    createBackground() {
        const bg = this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);
    }

    createUI() {
        const backBtn = this.add.text(50, 50, '< 返回', {
            fontSize: '28px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainCityScene'));

        this.add.text(640, 50, '战役', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createChapterMap() {
        const chapters = [
            { 
                id: 1, 
                name: '第一章 黄巾之乱', 
                color: 0xffff00,
                levels: [
                    { id: 'level_01_01', name: '黄巾义军', enemies: ['张角'], type: 'normal' },
                    { id: 'level_01_02', name: '黄巾将领', enemies: ['张角', '张宝'], type: 'normal' },
                    { id: 'level_01_03', name: '黄巾首领', enemies: ['张角', '张宝', '张梁'], type: 'boss' }
                ]
            },
            { 
                id: 2, 
                name: '第二章 董卓之乱', 
                color: 0xff6600,
                levels: [
                    { id: 'level_02_01', name: '董卓部下', enemies: ['李儒', '徐荣'], type: 'normal' },
                    { id: 'level_02_02', name: '汜水关', enemies: ['吕布'], type: 'elite' },
                    { id: 'level_02_03', name: '虎牢关', enemies: ['吕布', '华雄'], type: 'boss' }
                ]
            },
            { 
                id: 3, 
                name: '第三章 群雄逐鹿', 
                color: 0xff0066,
                levels: [
                    { id: 'level_03_01', name: '十八路诸侯', enemies: ['曹操', '袁绍'], type: 'elite' },
                    { id: 'level_03_02', name: '曹操崛起', enemies: ['曹操'], type: 'boss' },
                    { id: 'level_03_03', name: '刘备入主', enemies: ['刘备', '关羽', '张飞'], type: 'boss' },
                    { id: 'level_03_04', name: '孙坚立业', enemies: ['孙坚', '孙策'], type: 'boss' }
                ]
            },
            { 
                id: 4, 
                name: '第四章 三国鼎立', 
                color: 0x0066ff,
                levels: [
                    { id: 'level_04_01', name: '赤壁之战', enemies: ['周瑜', '黄盖'], type: 'elite' },
                    { id: 'level_04_02', name: '曹操败退', enemies: ['曹操', '曹仁'], type: 'boss' },
                    { id: 'level_04_03', name: '三顾茅庐', enemies: ['关羽', '张飞'], type: 'boss' },
                    { id: 'level_04_04', name: '汉中之战', enemies: ['刘备', '黄忠'], type: 'boss' }
                ]
            },
            { 
                id: 5, 
                name: '第五章 南征北战', 
                color: 0x00ff66,
                levels: [
                    { id: 'level_05_01', name: '七擒孟获', enemies: ['孟获', '祝融夫人'], type: 'elite' },
                    { id: 'level_05_02', name: '北伐中原', enemies: ['诸葛亮', '姜维'], type: 'boss' },
                    { id: 'level_05_03', name: '街亭之战', enemies: ['张郃', '马谡'], type: 'boss' }
                ]
            },
            { 
                id: 6, 
                name: '第六章 一统天下', 
                color: 0xffd700,
                levels: [
                    { id: 'level_06_01', name: '三分归晋', enemies: ['司马昭'], type: 'elite' },
                    { id: 'level_06_02', name: '魏灭蜀汉', enemies: ['邓艾', '钟会'], type: 'boss' },
                    { id: 'level_06_03', name: '晋灭东吴', enemies: ['王濬', '孙皓'], type: 'boss' },
                    { id: 'level_06_04', name: '天下归一', enemies: ['晋武帝'], type: 'boss' }
                ]
            }
        ];

        const startY = 150;
        const chapterSpacing = 100;

        chapters.forEach((chapter, chapterIdx) => {
            const y = startY + chapterIdx * chapterSpacing;
            
            this.add.text(100, y, chapter.name, {
                fontSize: '24px',
                color: '#' + chapter.color.toString(16).padStart(6, '0'),
                fontStyle: 'bold'
            });

            this.add.rectangle(100, y + 20, 1100, 2, chapter.color, 0.5);

            chapter.levels.forEach((level, levelIdx) => {
                const x = 250 + levelIdx * 180;
                const isUnlocked = DataManager.getInstance().isLevelUnlocked(level.id);
                const isCompleted = DataManager.getInstance().isLevelCompleted(level.id);

                this.createLevelNode(x, y + 20, level, isUnlocked, isCompleted);
            });
        });
    }

    createLevelNode(x, y, level, isUnlocked, isCompleted) {
        const nodeKey = isCompleted ? 'level_node_completed' : 
                       isUnlocked ? 'level_node' : 'level_node_locked';
        
        const node = this.add.image(x, y, nodeKey).setInteractive({ useHandCursor: true });
        
        let typeLabel = '';
        let typeColor = '#ffffff';
        if (level.type === 'elite') {
            typeLabel = '[精英]';
            typeColor = '#9400d3';
        } else if (level.type === 'boss') {
            typeLabel = '[BOSS]';
            typeColor = '#ff0000';
        }
        
        const nameColor = isUnlocked ? (level.type === 'boss' ? '#ff6666' : level.type === 'elite' ? '#c866ff' : '#ffffff') : '#666666';
        
        this.add.text(x, y - 10, typeLabel, {
            fontSize: '10px',
            color: typeColor
        }).setOrigin(0.5);
        
        this.add.text(x, y + 5, level.name, {
            fontSize: '14px',
            color: nameColor
        }).setOrigin(0.5);

        this.add.text(x, y + 25, level.enemies.join('、'), {
            fontSize: '10px',
            color: isUnlocked ? '#aaaaaa' : '#444444'
        }).setOrigin(0.5);

        if (isUnlocked) {
            node.on('pointerover', () => node.setScale(1.1));
            node.on('pointerout', () => node.setScale(1));
            node.on('pointerdown', () => this.startBattle(level.id));
        }
    }

    createDifficultySelector() {
        const difficulties = [
            { key: 'easy', label: '简单', cost: 10, color: 0x00ff00 },
            { key: 'normal', label: '普通', cost: 20, color: 0xffff00 },
            { key: 'hard', label: '困难', cost: 30, color: 0xff0000 }
        ];
        
        const startX = 800;
        const y = 680;

        this.add.text(startX - 100, y, '难度:', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        difficulties.forEach((diff, index) => {
            const x = startX + index * 120;
            const isSelected = this.currentDifficulty === diff.key;
            
            const btn = this.add.rectangle(x, y, 100, 40, isSelected ? diff.color : 0x333333);
            btn.setStrokeStyle(2, diff.color);
            btn.setInteractive({ useHandCursor: true });
            
            this.add.text(x, y, `${diff.label} ${diff.cost}体力`, {
                fontSize: '16px',
                color: isSelected ? '#000000' : '#ffffff'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.currentDifficulty = diff.key;
                this.scene.restart();
            });
        });
    }

    startBattle(levelId) {
        const playerData = DataManager.getInstance().getPlayerData();
        const energyCosts = { easy: 10, normal: 20, hard: 30 };
        const energyCost = energyCosts[this.currentDifficulty];
        
        if (playerData.energy < energyCost) {
            this.showMessage('体力不足!');
            return;
        }

        DataManager.getInstance().consumeEnergy(energyCost);
        BattleManager.getInstance().startBattle(levelId, this.currentDifficulty);
        this.scene.start('BattleScene');
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '48px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 280,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }
}
