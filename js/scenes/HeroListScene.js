class HeroListScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HeroListScene' });
        this.currentFilter = 'all';
    }

    create() {
        this.createUI();
        this.createHeroList();
        this.createFilterButtons();
    }

    createUI() {
        const backBtn = this.add.text(50, 50, '< 返回', {
            fontSize: '28px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainCityScene'));

        this.add.text(640, 50, '武将列表', {
            fontSize: '36px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createHeroList() {
        const heroes = DataManager.getInstance().getPlayerData().heroes;
        
        this.heroCards = [];
        const startX = 140;
        const startY = 180;
        const cardWidth = 200;
        const cardHeight = 280;
        const gapX = 20;
        const gapY = 20;
        const cols = 5;

        heroes.forEach((heroData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cardWidth + gapX);
            const y = startY + row * (cardHeight + gapY);
            
            const hero = new Hero(heroData, true);
            const card = this.createHeroCard(hero, x, y);
            this.heroCards.push(card);
        });
    }

    createHeroCard(hero, x, y) {
        const bgColor = this.getQualityColor(hero.quality);
        const bg = this.add.rectangle(x, y, 190, 270, 0x333333);
        bg.setStrokeStyle(3, bgColor);

        this.add.text(x, y - 110, hero.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const avatar = this.add.rectangle(x, y - 40, 80, 80, bgColor);
        
        this.add.text(x, y + 20, `等级: ${hero.level}`, {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(x, y + 50, `星级: ${hero.star}`, {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(x, y + 90, `战力: ${hero.attack + hero.defense + Math.floor(hero.hp / 10)}`, {
            fontSize: '20px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const upgradeBtn = this.add.text(x, y + 125, '升级', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
        
        upgradeBtn.on('pointerdown', () => this.upgradeHero(hero));

        return { bg, hero };
    }

    createFilterButtons() {
        const filters = [
            { key: 'all', label: '全部' },
            { key: 'infantry', label: '步兵' },
            { key: 'cavalry', label: '骑兵' },
            { key: 'archer', label: '弓兵' }
        ];

        const startX = 400;
        const y = 700;

        filters.forEach((filter, index) => {
            const color = this.currentFilter === filter.key ? '#ffd700' : '#666666';
            const text = this.add.text(startX + index * 120, y, filter.label, {
                fontSize: '22px',
                color: color
            }).setInteractive({ useHandCursor: true });
            
            text.on('pointerdown', () => {
                this.currentFilter = filter.key;
                this.scene.restart();
            });
        });
    }

    upgradeHero(hero) {
        const cost = DataManager.getInstance().calculateUpgradeCost(hero.level);
        const playerData = DataManager.getInstance().getPlayerData();
        
        if (playerData.gold >= cost) {
            DataManager.getInstance().spendGold(cost);
            hero.levelUp();
            this.scene.restart();
            this.showMessage(`升级成功! 消耗${cost}金币`);
        } else {
            this.showMessage('金币不足!');
        }
    }

    getQualityColor(quality) {
        const colors = {
            green: 0x00ff00,
            blue: 0x00bfff,
            purple: 0x9400d3,
            orange: 0xff8c00,
            red: 0xff0000
        };
        return colors[quality] || 0x00ff00;
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '32px',
            color: '#00ff00'
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
