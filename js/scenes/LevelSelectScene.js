class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
        this.currentChapter = 1;
        this.currentDifficulty = 'normal';
    }

    create() {
        this.createUI();
        this.createChapterMap();
        this.createDifficultySelector();
    }

    createUI() {
        const backBtn = this.add.text(50, 50, '< 返回', {
            fontSize: '28px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainCityScene'));

        this.add.text(640, 50, '战役', {
            fontSize: '36px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createChapterMap() {
        const chapterData = [
            { id: 1, name: '黄巾之乱', levels: ['level_01_01', 'level_01_02', 'level_01_03'] },
            { id: 2, name: '董卓之乱', levels: ['level_02_01', 'level_02_02'] }
        ];

        let levelIndex = 0;
        const startY = 200;
        const spacingY = 150;

        chapterData.forEach((chapter, chapterIdx) => {
            this.add.text(200, startY + chapterIdx * spacingY, chapter.name, {
                fontSize: '32px',
                color: '#ffd700',
                fontStyle: 'bold'
            });

            chapter.levels.forEach((levelId, levelIdx) => {
                const x = 400 + levelIdx * 150;
                const y = startY + chapterIdx * spacingY;
                const isUnlocked = DataManager.getInstance().isLevelUnlocked(levelId);
                const isCompleted = DataManager.getInstance().isLevelCompleted(levelId);

                const nodeKey = isCompleted ? 'level_node_completed' : 
                               isUnlocked ? 'level_node' : 'level_node_locked';
                
                const node = this.add.image(x, y, nodeKey).setInteractive({ useHandCursor: true });
                
                const levelNum = levelIdx + 1;
                this.add.text(x, y, `第${levelNum}关`, {
                    fontSize: '20px',
                    color: isUnlocked ? '#ffffff' : '#666666'
                }).setOrigin(0.5);

                if (isUnlocked) {
                    node.on('pointerdown', () => this.startBattle(levelId));
                }

                levelIndex++;
            });
        });
    }

    createDifficultySelector() {
        const difficulties = ['simple', 'normal', 'hard'];
        const labels = { simple: '简单', normal: '普通', hard: '困难' };
        
        const startX = 800;
        const y = 100;

        difficulties.forEach((diff, index) => {
            const color = this.currentDifficulty === diff ? '#ffd700' : '#888888';
            const text = this.add.text(startX + index * 100, y, labels[diff], {
                fontSize: '24px',
                color: color
            }).setInteractive({ useHandCursor: true });
            
            text.on('pointerdown', () => {
                this.currentDifficulty = diff;
                this.scene.restart();
            });
        });
    }

    startBattle(levelId) {
        const playerData = DataManager.getInstance().getPlayerData();
        const energyCost = this.getEnergyCost(levelId);
        
        if (playerData.energy < energyCost) {
            this.showMessage('体力不足!');
            return;
        }

        DataManager.getInstance().consumeEnergy(energyCost);
        BattleManager.getInstance().startBattle(levelId, this.currentDifficulty);
        this.scene.start('BattleScene');
    }

    getEnergyCost(levelId) {
        const costs = { simple: 10, normal: 20, hard: 30 };
        return costs[this.currentDifficulty];
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '36px',
            color: '#ff0000'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 300,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }
}
