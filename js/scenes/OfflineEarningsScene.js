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

        this.add.text(640, 150, '离线收益', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const duration = this.formatDuration(this.earnings.duration);
        this.add.text(640, 210, `离线时长: ${duration}`, {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(640, 260, `战斗次数: ${this.earnings.battlesCount}`, {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 300, `胜利场次: ${this.earnings.victoriesCount}`, {
            fontSize: '22px',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.add.text(640, 360, `金币: +${this.earnings.gold}`, {
            fontSize: '28px',
            color: '#ffd700'
        }).setOrigin(0.5);

        this.add.text(640, 400, `经验: +${this.earnings.exp}`, {
            fontSize: '28px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const adBtn = this.add.rectangle(540, 480, 180, 50, 0xff69b4);
        adBtn.setInteractive({ useHandCursor: true });
        this.add.text(540, 480, '看广告双倍', {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        adBtn.on('pointerdown', () => this.claimWithAd());

        const normalBtn = this.add.rectangle(740, 480, 180, 50, 0x666666);
        normalBtn.setInteractive({ useHandCursor: true });
        this.add.text(740, 480, '直接领取', {
            fontSize: '22px',
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
}
