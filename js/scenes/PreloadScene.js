class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.createLoadingText();
        
        this.load.image('btn_battle', 'assets/images/ui/btn_battle.png');
        this.load.image('btn_hero', 'assets/images/ui/btn_hero.png');
        this.load.image('btn_friend', 'assets/images/ui/btn_friend.png');
        this.load.image('btn_league', 'assets/images/ui/btn_league.png');
        this.load.image('btn_shop', 'assets/images/ui/btn_shop.png');
        this.load.image('btn_setting', 'assets/images/ui/btn_setting.png');
        this.load.image('bg_main', 'assets/images/backgrounds/main_city.png');
        this.load.image('hero_slot', 'assets/images/ui/hero_slot.png');
        this.load.image('gold_icon', 'assets/images/ui/gold_icon.png');
        this.load.image('yuanbao_icon', 'assets/images/ui/yuanbao_icon.png');
        this.load.image('energy_icon', 'assets/images/ui/energy_icon.png');
        this.load.image('btn_start', 'assets/images/ui/btn_start.png');
        this.load.image('btn_ad', 'assets/images/ui/btn_ad.png');
        this.load.image('level_node', 'assets/images/ui/level_node.png');
        this.load.image('level_node_locked', 'assets/images/ui/level_node_locked.png');
        this.load.image('level_node_completed', 'assets/images/ui/level_node_completed.png');
        
        this.load.audio('bgm_main', 'assets/audio/bgm/main.mp3');
        this.load.audio('sfx_click', 'assets/audio/sfx/click.mp3');
        this.load.audio('sfx_attack', 'assets/audio/sfx/attack.mp3');
        this.load.audio('sfx_victory', 'assets/audio/sfx/victory.mp3');
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
        
        this.add.text(width / 2, height / 2 + 50, '加载中...', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}
