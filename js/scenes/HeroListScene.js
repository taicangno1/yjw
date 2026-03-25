class HeroListScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HeroListScene' });
        this.currentFilter = 'all';
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createHeroList();
    }

    createBackground() {
        this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);
    }

    createUI() {
        const backBtn = this.add.rectangle(80, 50, 100, 50, 0x333333, 0);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainCityScene'));
        
        this.add.text(50, 50, '< 返回', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.add.text(640, 50, '武将列表', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const filterY = 650;
        const filters = [
            { key: 'all', label: '全部' },
            { key: 'infantry', label: '步兵' },
            { key: 'cavalry', label: '骑兵' },
            { key: 'archer', label: '弓兵' }
        ];

        this.add.text(100, filterY, '兵种:', {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        filters.forEach((filter, index) => {
            const x = 200 + index * 100;
            const isSelected = this.currentFilter === filter.key;
            
            const btn = this.add.rectangle(x, filterY, 80, 36, isSelected ? 0xffd700 : 0x333333);
            btn.setInteractive({ useHandCursor: true });
            
            this.add.text(x, filterY, filter.label, {
                fontSize: '18px',
                color: isSelected ? '#000000' : '#ffffff'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.currentFilter = filter.key;
                this.scene.restart();
            });
        });
    }

    createHeroList() {
        let heroes = DataManager.getInstance().getPlayerData().heroes;
        
        if (this.currentFilter !== 'all') {
            heroes = heroes.filter(h => h.troop === this.currentFilter);
        }
        
        const startX = 120;
        const startY = 160;
        const cardWidth = 180;
        const cardHeight = 260;
        const gapX = 30;
        const gapY = 30;
        const cols = 6;

        heroes.forEach((heroData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cardWidth + gapX);
            const y = startY + row * (cardHeight + gapY);
            
            const hero = new Hero(heroData, true);
            this.createHeroCard(hero, x, y);
        });
    }

    createHeroCard(hero, x, y) {
        const colors = {
            green: 0x00ff00,
            blue: 0x00bfff,
            purple: 0x9400d3,
            orange: 0xff8c00,
            red: 0xff0000
        };
        const color = colors[hero.quality] || 0x00ff00;
        
        const bg = this.add.rectangle(x, y, 170, 250, 0x2d2d44);
        bg.setStrokeStyle(3, color);

        const heroKey = `hero_${hero.id.replace('hero_', '')}`;
        const avatar = this.add.image(x, y - 50, heroKey).setScale(0.8);

        this.add.text(x, y + 30, hero.name, {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const troopColors = { infantry: '#008000', cavalry: '#800080', archer: '#ff8c00' };
        this.add.text(x, y + 55, this.getTroopName(hero.troop), {
            fontSize: '14px',
            color: troopColors[hero.troop] || '#ffffff'
        }).setOrigin(0.5);

        const statsText = [
            `等级: ${hero.level}`,
            `星级: ${hero.star}`,
            `战力: ${Math.floor(hero.attack + hero.defense + hero.hp / 10)}`
        ].join('\n');
        
        this.add.text(x, y + 90, statsText, {
            fontSize: '14px',
            color: '#aaaaaa',
            lineSpacing: 6
        }).setOrigin(0.5);

        const upgradeBtn = this.add.rectangle(x, y + 140, 100, 36, 0x00cc00);
        upgradeBtn.setInteractive({ useHandCursor: true });
        
        const cost = DataManager.getInstance().calculateUpgradeCost(hero.level);
        this.add.text(x, y + 140, `升级 ${cost}`, {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        upgradeBtn.on('pointerdown', () => this.upgradeHero(hero));
        upgradeBtn.on('pointerover', () => upgradeBtn.setFillStyle(0x00ff00));
        upgradeBtn.on('pointerout', () => upgradeBtn.setFillStyle(0x00cc00));
    }

    getTroopName(troop) {
        const names = { infantry: '步兵', cavalry: '骑兵', archer: '弓兵' };
        return names[troop] || troop;
    }

    upgradeHero(hero) {
        const cost = DataManager.getInstance().calculateUpgradeCost(hero.level);
        const playerData = DataManager.getInstance().getPlayerData();
        
        if (playerData.gold >= cost) {
            DataManager.getInstance().upgradeHero(hero.id);
            this.scene.restart();
            this.showMessage(`升级成功!`);
        } else {
            this.showMessage('金币不足!');
        }
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '36px',
            color: '#00ff00',
            fontStyle: 'bold'
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
