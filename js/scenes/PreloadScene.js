class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.createLoadingText();
        AssetGenerator.generateAllAssets(this);
        AssetGenerator.createHeroAvatars(this);
    }

    create() {
        GameManager.getInstance().init(this);
        DataManager.getInstance().load();
        OfflineManager.getInstance().checkOfflineEarnings();
        
        this.scene.start('MainCityScene');
    }

    createLoadingText() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const bg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);
        bg.setOrigin(0.5);
        
        const progressBar = this.add.rectangle(width / 2 - 195, height / 2 - 10, 0, 20, 0x00ff00);
        
        this.load.on('progress', (value) => {
            progressBar.width = 390 * value;
        });
        
        this.add.text(width / 2, height / 2 - 50, '放置三国', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 50, '加载中...', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}
