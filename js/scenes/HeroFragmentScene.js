class HeroFragmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HeroFragmentScene' });
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createFragmentList();
    }

    createBackground() {
        this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);
    }

    createUI() {
        const backBtn = this.add.text(50, 50, '< 返回', {
            fontSize: '28px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('MainCityScene'));

        this.add.text(640, 50, '武将碎片', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(640, 100, '收集碎片召唤武将 / 升星', {
            fontSize: '20px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
    }

    createFragmentList() {
        const heroFragments = DataManager.getInstance().getPlayerData().heroFragments;
        const heroes = DataManager.getInstance().getPlayerData().heroes;
        
        let y = 160;
        let index = 0;

        heroes.forEach(hero => {
            const fragments = heroFragments[hero.id] || 0;
            const fragmentsNeeded = this.getFragmentsNeeded(hero.star);
            const canSummon = fragments >= fragmentsNeeded && !this.hasHero(hero.id);

            const card = this.add.rectangle(640, y, 500, 80, 0x2d2d44)
                .setInteractive({ useHandCursor: true });
            card.setStrokeStyle(2, this.getQualityColor(hero.quality));

            this.add.text(250, y - 15, hero.name, {
                fontSize: '22px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(250, y + 15, `星级: ${hero.star}`, {
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);

            this.add.text(700, y, `碎片: ${fragments}/${fragmentsNeeded}`, {
                fontSize: '18px',
                color: fragments >= fragmentsNeeded ? '#00ff00' : '#ff6600'
            }).setOrigin(0.5);

            if (canSummon) {
                const summonBtn = this.add.rectangle(950, y, 100, 40, 0x00ff00);
                summonBtn.setInteractive({ useHandCursor: true });
                this.add.text(950, y, '召唤', {
                    fontSize: '18px',
                    color: '#000000',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                summonBtn.on('pointerdown', () => {
                    this.summonHero(hero);
                    this.scene.restart();
                });
            } else if (this.hasHero(hero.id)) {
                const starUpBtn = this.add.rectangle(950, y, 100, 40, 0xffd700);
                starUpBtn.setInteractive({ useHandCursor: true });
                this.add.text(950, y, '升星', {
                    fontSize: '18px',
                    color: '#000000',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                if (fragments >= fragmentsNeeded && hero.star < 5) {
                    starUpBtn.on('pointerdown', () => {
                        this.starUpHero(hero);
                        this.scene.restart();
                    });
                } else {
                    starUpBtn.setAlpha(0.5);
                }
            }

            index++;
            y += 90;
        });
    }

    getFragmentsNeeded(currentStar) {
        const costs = {
            1: 10,
            2: 30,
            3: 60,
            4: 100,
            5: 150
        };
        return costs[currentStar] || costs[1];
    }

    hasHero(heroId) {
        const heroes = DataManager.getInstance().getPlayerData().heroes;
        return heroes.some(h => h.id === heroId);
    }

    summonHero(hero) {
        const fragments = DataManager.getInstance().getPlayerData().heroFragments[hero.id] || 0;
        const fragmentsNeeded = this.getFragmentsNeeded(hero.star);

        if (fragments < fragmentsNeeded) {
            this.showMessage('碎片不足!');
            return;
        }

        DataManager.getInstance().getPlayerData().heroFragments[hero.id] -= fragmentsNeeded;
        this.showMessage(`恭喜获得 ${hero.name}!`);
    }

    starUpHero(hero) {
        const fragments = DataManager.getInstance().getPlayerData().heroFragments[hero.id] || 0;
        const fragmentsNeeded = this.getFragmentsNeeded(hero.star);

        if (fragments < fragmentsNeeded) {
            this.showMessage('碎片不足!');
            return;
        }

        if (hero.star >= 5) {
            this.showMessage('已达最高星级!');
            return;
        }

        const playerData = DataManager.getInstance().getPlayerData();
        const heroInData = playerData.heroes.find(h => h.id === hero.id);
        
        if (!heroInData) {
            this.showMessage('武将数据异常!');
            return;
        }

        playerData.heroFragments[hero.id] -= fragmentsNeeded;
        heroInData.star++;
        
        DataManager.getInstance().save();
        this.showMessage(`${hero.name} 升星成功! 当前星级: ${heroInData.star}`);
    }

        if (hero.star >= 5) {
            this.showMessage('已达最高星级!');
            return;
        }

        DataManager.getInstance().getPlayerData().heroFragments[hero.id] -= fragmentsNeeded;
        hero.star++;

        this.showMessage(`${hero.name} 升星成功! 当前星级: ${hero.star}`);
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 280,
            duration: 2000,
            onComplete: () => msg.destroy()
        });
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
}
