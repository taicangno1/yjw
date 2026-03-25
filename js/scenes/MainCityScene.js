class MainCityScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainCityScene' });
    }

    create() {
        this.createBackground();
        this.createResourceBar();
        this.createMenuButtons();
        this.createCharacterDisplay();
        this.createTitle();
    }

    createTitle() {
        const title = this.add.text(640, 120, '放置三国', {
            fontSize: '56px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createBackground() {
        const bg = this.add.image(640, 360, 'bg_main');
        bg.setDisplaySize(1280, 720);
        
        this.add.rectangle(640, 680, 1280, 80, 0x000000, 0.3);
    }

    createResourceBar() {
        const playerData = DataManager.getInstance().getPlayerData();
        
        const barBg = this.add.rectangle(640, 30, 1260, 60, 0x000000, 0.5);
        barBg.setOrigin(0.5);
        
        this.add.image(80, 30, 'gold_icon').setScale(0.6);
        this.goldText = this.add.text(110, 30, this.formatNumber(playerData.gold), {
            fontSize: '22px',
            color: '#ffd700'
        }).setOrigin(0, 0.5);
        
        this.add.image(250, 30, 'yuanbao_icon').setScale(0.6);
        this.yuanbaoText = this.add.text(280, 30, this.formatNumber(playerData.yuanbao), {
            fontSize: '22px',
            color: '#ff69b4'
        }).setOrigin(0, 0.5);
        
        this.add.image(420, 30, 'energy_icon').setScale(0.6);
        this.energyText = this.add.text(450, 30, `${playerData.energy}/${playerData.maxEnergy}`, {
            fontSize: '22px',
            color: '#00ff00'
        }).setOrigin(0, 0.5);
        
        this.powerText = this.add.text(1100, 30, `战力: ${this.formatNumber(this.calculatePower())}`, {
            fontSize: '22px',
            color: '#ff6600'
        }).setOrigin(0, 0.5);
    }

    createMenuButtons() {
        const buttons = [
            { key: 'battle', text: '战役', x: 640, y: 280, target: 'LevelSelectScene' },
            { key: 'hero', text: '武将', x: 200, y: 420, target: 'HeroListScene' },
            { key: 'equipment', text: '装备', x: 400, y: 420, target: 'EquipmentScene' },
            { key: 'fragment', text: '碎片', x: 600, y: 420, target: 'HeroFragmentScene' },
            { key: 'friend', text: '好友', x: 800, y: 420, target: 'FriendScene' },
            { key: 'league', text: '联盟', x: 200, y: 560, target: 'LeagueScene' },
            { key: 'rank', text: '排行', x: 400, y: 560, target: 'RankScene' },
            { key: 'shop', text: '商店', x: 800, y: 560, target: null, disabled: true }
        ];

        buttons.forEach(btn => {
            const button = this.add.image(btn.x, btn.y, `btn_${btn.key}`).setInteractive({ useHandCursor: true });
            
            if (btn.disabled) {
                button.setAlpha(0.5);
            }
            
            button.on('pointerover', () => {
                if (!btn.disabled) {
                    button.setScale(1.05);
                }
            });
            
            button.on('pointerout', () => {
                button.setScale(1);
            });
            
            button.on('pointerdown', () => {
                if (!btn.disabled) {
                    AudioManager.getInstance().playSFX('click');
                    if (btn.target) {
                        this.scene.start(btn.target);
                    } else {
                        this.showComingSoon();
                    }
                }
            });

            const textColor = btn.disabled ? '#888888' : '#ffffff';
            this.add.text(btn.x, btn.y + 5, btn.text, {
                fontSize: '28px',
                color: textColor,
                fontStyle: 'bold'
            }).setOrigin(0.5);
        });
    }

    createCharacterDisplay() {
        const heroes = DataManager.getInstance().getPlayerData().heroes.slice(0, 5);
        const startX = 540;
        const y = 650;

        this.add.text(640, 590, '上阵武将', {
            fontSize: '20px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        heroes.forEach((heroData, index) => {
            const hero = new Hero(heroData, true);
            const x = startX + index * 80;
            
            const quality = hero.quality || 'orange';
            const slot = this.add.image(x, y, `hero_slot_${quality}`).setScale(0.8);
            
            this.add.text(x, y + 70, hero.name, {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });
    }

    showComingSoon() {
        const msg = this.add.text(640, 360, '功能即将开放', {
            fontSize: '36px',
            color: '#ffd700',
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
