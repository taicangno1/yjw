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
                    { id: 'level_01_01', name: '黄巾义军', enemies: ['张角'] },
                    { id: 'level_01_02', name: '黄巾将领', enemies: ['张角', '张宝'] },
                    { id: 'level_01_03', name: '黄巾首领', enemies: ['张角', '张宝', '张梁'] }
                ]
            },
            { 
                id: 2, 
                name: '第二章 董卓之乱', 
                color: 0xff6600,
                levels: [
                    { id: 'level_02_01', name: '董卓部下', enemies: ['李儒'] },
                    { id: 'level_02_02', name: '吕布', enemies: ['吕布'] }
                ]
            }
        ];

        const startY = 180;
        const chapterSpacing = 220;

        chapters.forEach((chapter, chapterIdx) => {
            const y = startY + chapterIdx * chapterSpacing;
            
            this.add.text(100, y, chapter.name, {
                fontSize: '28px',
                color: '#' + chapter.color.toString(16).padStart(6, '0'),
                fontStyle: 'bold'
            });

            this.add.rectangle(100, y + 30, 1080, 3, chapter.color, 0.5);

            chapter.levels.forEach((level, levelIdx) => {
                const x = 300 + levelIdx * 200;
                const isUnlocked = DataManager.getInstance().isLevelUnlocked(level.id);
                const isCompleted = DataManager.getInstance().isLevelCompleted(level.id);

                this.createLevelNode(x, y + 30, level, isUnlocked, isCompleted);
            });
        });
    }

    createLevelNode(x, y, level, isUnlocked, isCompleted) {
        const nodeKey = isCompleted ? 'level_node_completed' : 
                       isUnlocked ? 'level_node' : 'level_node_locked';
        
        const node = this.add.image(x, y, nodeKey).setInteractive({ useHandCursor: true });
        
        this.add.text(x, y - 10, level.name, {
            fontSize: '16px',
            color: isUnlocked ? '#ffffff' : '#666666'
        }).setOrigin(0.5);

        this.add.text(x, y + 15, level.enemies.join('、'), {
            fontSize: '12px',
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
