class MainCityScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainCityScene' });
    }

    create() {
        this.createBackground();
        this.createResourceBar();
        this.createMenuButtons();
        this.createCharacterDisplay();
    }

    createBackground() {
        const bg = this.add.image(640, 360, 'bg_main');
        bg.setDisplaySize(1280, 720);
    }

    createResourceBar() {
        const playerData = DataManager.getInstance().getPlayerData();
        
        const barBg = this.add.rectangle(640, 30, 1260, 60, 0x000000, 0.5);
        barBg.setOrigin(0.5);
        
        this.add.image(100, 30, 'gold_icon').setScale(0.5);
        this.goldText = this.add.text(140, 30, this.formatNumber(playerData.gold), {
            fontSize: '24px',
            color: '#ffd700'
        }).setOrigin(0, 0.5);
        
        this.add.image(260, 30, 'yuanbao_icon').setScale(0.5);
        this.yuanbaoText = this.add.text(300, 30, this.formatNumber(playerData.yuanbao), {
            fontSize: '24px',
            color: '#ff69b4'
        }).setOrigin(0, 0.5);
        
        this.add.image(420, 30, 'energy_icon').setScale(0.5);
        this.energyText = this.add.text(460, 30, `${playerData.energy}/${playerData.maxEnergy}`, {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0, 0.5);
        
        this.powerText = this.add.text(1100, 30, `战力: ${this.calculatePower()}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
    }

    createMenuButtons() {
        const buttons = [
            { key: 'btn_battle', text: '战役', x: 640, y: 250, scene: 'LevelSelectScene' },
            { key: 'btn_hero', text: '武将', x: 400, y: 400, scene: 'HeroListScene' },
            { key: 'btn_friend', text: '好友', x: 640, y: 400, scene: null },
            { key: 'btn_league', text: '联盟', x: 880, y: 400, scene: null },
            { key: 'btn_shop', text: '商店', x: 400, y: 550, scene: null },
            { key: 'btn_setting', text: '设置', x: 880, y: 550, scene: null }
        ];

        buttons.forEach(btn => {
            const button = this.add.image(btn.x, btn.y, btn.key).setInteractive({ useHandCursor: true });
            button.on('pointerover', () => button.setAlpha(0.8));
            button.on('pointerout', () => button.setAlpha(1));
            button.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('sfx_click');
                if (btn.scene) {
                    this.scene.start(btn.scene);
                }
            });

            this.add.text(btn.x, btn.y + 5, btn.text, {
                fontSize: '28px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        });
    }

    createCharacterDisplay() {
        const heroes = DataManager.getInstance().getPlayerData().heroes.slice(0, 5);
        const startX = 540;
        const y = 650;

        heroes.forEach((heroData, index) => {
            const hero = new Hero(heroData, true);
            const x = startX + index * 80;
            
            const slot = this.add.image(x, y, 'hero_slot').setScale(0.8);
            slot.setTint(0x00ff00);
            
            this.add.text(x, y + 50, hero.name, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });
    }

    formatNumber(num) {
        if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
        if (num >= 10000) return (num / 10000).toFixed(1) + '万';
        return num.toString();
    }

    calculatePower() {
        const heroes = DataManager.getInstance().getPlayerData().heroes;
        let totalPower = 0;
        heroes.forEach(hero => {
            if (!hero.isLocked) {
                totalPower += hero.attack + hero.defense + hero.hp / 10;
            }
        });
        return Math.floor(totalPower);
    }

    update() {
        DataManager.getInstance().updateEnergy();
        const playerData = DataManager.getInstance().getPlayerData();
        this.energyText.setText(`${playerData.energy}/${playerData.maxEnergy}`);
    }
}
