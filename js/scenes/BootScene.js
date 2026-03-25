class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.createLoadingBar();
    }

    create() {
        this.scene.start('PreloadScene');
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const bgBar = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);
        const progressBar = this.add.rectangle(width / 2 - 195, height / 2 - 10, 0, 20, 0x00ff00);
        
        this.load.on('progress', (value) => {
            progressBar.width = 390 * value;
        });
        
        this.add.text(width / 2, height / 2 - 50, '放置三国', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
