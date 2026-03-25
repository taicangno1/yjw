class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createShopItems();
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

        this.add.text(640, 50, '商店', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(200, 110, '金币', {
            fontSize: '20px',
            color: '#ffd700'
        }).setOrigin(0.5);
        this.goldText = this.add.text(280, 110, '0', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.add.text(500, 110, '元宝', {
            fontSize: '20px',
            color: '#ff69b4'
        }).setOrigin(0.5);
        this.yuanbaoText = this.add.text(580, 110, '0', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
    }

    createShopItems() {
        const items = [
            { id: 'energy', name: '体力礼包', desc: '恢复100体力', cost: 10, type: 'yuanbao', icon: 'energy' },
            { id: 'gold_1000', name: '金币 x1000', desc: '获得1000金币', cost: 5, type: 'yuanbao', icon: 'gold' },
            { id: 'gold_10000', name: '金币 x10000', desc: '获得10000金币', cost: 40, type: 'yuanbao', icon: 'gold' },
            { id: 'sweep_10', name: '扫荡券 x10', desc: '10张扫荡券', cost: 20, type: 'yuanbao', icon: 'sweep' },
            { id: 'fragment_pack', name: '武将碎片包', desc: '随机武将碎片x20', cost: 50, type: 'yuanbao', icon: 'fragment' },
            { id: 'speed_up', name: '战斗加速', desc: '下10场战斗加速', cost: 30, type: 'yuanbao', icon: 'speed' }
        ];

        items.forEach((item, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = 350 + col * 450;
            const y = 220 + row * 180;

            const card = this.add.rectangle(x, y, 400, 150, 0x2d2d44);
            card.setStrokeStyle(2, 0xffd700);

            this.add.text(x - 150, y - 50, item.name, {
                fontSize: '22px',
                color: '#ffd700',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(x - 150, y, item.desc, {
                fontSize: '16px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);

            const buyBtn = this.add.rectangle(x + 120, y + 40, 100, 45, 0xff69b4);
            buyBtn.setInteractive({ useHandCursor: true });
            
            this.add.text(x + 120, y + 40, `${item.cost}元宝`, {
                fontSize: '16px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            buyBtn.on('pointerdown', () => {
                this.buyItem(item);
            });
        });
    }

    buyItem(item) {
        const playerData = DataManager.getInstance().getPlayerData();
        
        if (playerData.yuanbao < item.cost) {
            this.showMessage('元宝不足!');
            return;
        }

        playerData.yuanbao -= item.cost;
        this.updateDisplay();

        switch (item.id) {
            case 'energy':
                DataManager.getInstance().addEnergy(100);
                this.showMessage('体力恢复100点!');
                break;
            case 'gold_1000':
                DataManager.getInstance().addGold(1000);
                this.showMessage('获得1000金币!');
                break;
            case 'gold_10000':
                DataManager.getInstance().addGold(10000);
                this.showMessage('获得10000金币!');
                break;
            case 'sweep_10':
                playerData.items.sweepTicket = (playerData.items.sweepTicket || 0) + 10;
                this.showMessage('获得10张扫荡券!');
                break;
            case 'fragment_pack':
                const heroes = ['hero_001', 'hero_002', 'hero_003', 'hero_004', 'hero_005'];
                const randomHero = heroes[Math.floor(Math.random() * heroes.length)];
                playerData.heroFragments[randomHero] = (playerData.heroFragments[randomHero] || 0) + 20;
                this.showMessage('获得随机武将碎片x20!');
                break;
            case 'speed_up':
                this.showMessage('战斗加速已激活!');
                break;
        }
        
        DataManager.getInstance().save();
    }

    updateDisplay() {
        const playerData = DataManager.getInstance().getPlayerData();
        this.goldText.setText(this.formatNumber(playerData.gold));
        this.yuanbaoText.setText(this.formatNumber(playerData.yuanbao));
    }

    formatNumber(num) {
        if (num >= 10000) return (num / 10000).toFixed(1) + '万';
        return num.toString();
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '28px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 300,
            duration: 2000,
            onComplete: () => msg.destroy()
        });
    }
}
