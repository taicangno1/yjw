class OfflineEarningsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfflineEarningsScene' });
    }

    create(data) {
        this.earnings = data.earnings;
        this.createUI();
    }

    createUI() {
        const panel = this.add.rectangle(640, 360, 500, 450, 0x000000, 0.95);
        panel.setStrokeStyle(4, 0xffd700);

        this.add.text(640, 130, '离线收益', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const duration = this.formatDuration(this.earnings.duration);
        this.add.text(640, 200, `离线时长: ${duration}`, {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(640, 250, `战斗次数: ${this.earnings.battlesCount}场`, {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 285, `胜利场次: ${this.earnings.victoriesCount}场`, {
            fontSize: '22px',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.add.rectangle(640, 330, 400, 2, 0xffd700, 0.5);

        this.add.text(640, 370, `金币: +${this.formatNumber(this.earnings.gold)}`, {
            fontSize: '36px',
            color: '#ffd700'
        }).setOrigin(0.5);

        this.add.text(640, 420, `经验: +${this.earnings.exp}`, {
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(0.5);

        if (Object.keys(this.earnings.heroFragments).length > 0) {
            this.add.text(640, 460, `武将碎片: +${Object.values(this.earnings.heroFragments)[0]}`, {
                fontSize: '24px',
                color: '#00bfff'
            }).setOrigin(0.5);
        }

        const adBtn = this.add.rectangle(500, 530, 200, 55, 0xff69b4);
        adBtn.setInteractive({ useHandCursor: true });
        adBtn.on('pointerover', () => adBtn.setScale(1.05));
        adBtn.on('pointerout', () => adBtn.setScale(1));
        this.add.text(500, 530, '看广告 x2', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        adBtn.on('pointerdown', () => this.claimWithAd());

        const normalBtn = this.add.rectangle(780, 530, 180, 55, 0x666666);
        normalBtn.setInteractive({ useHandCursor: true });
        normalBtn.on('pointerover', () => normalBtn.setScale(1.05));
        normalBtn.on('pointerout', () => normalBtn.setScale(1));
        this.add.text(780, 530, '直接领取', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        normalBtn.on('pointerdown', () => this.claimNormal());
    }

    claimNormal() {
        OfflineManager.getInstance().claimOfflineEarnings();
        this.scene.start('MainCityScene');
    }

    claimWithAd() {
        AdManager.getInstance().showRewardedVideo('offline_double').then(result => {
            if (result.success) {
                OfflineManager.getInstance().claimWithAd();
            }
            this.scene.start('MainCityScene');
        });
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}小时${minutes}分钟`;
        if (minutes > 0) return `${minutes}分钟`;
        return `${seconds}秒`;
    }

    formatNumber(num) {
        if (num >= 10000) return (num / 10000).toFixed(1) + '万';
        return num.toString();
    }
}
