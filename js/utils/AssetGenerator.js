const AssetGenerator = {
    generateAllAssets(game) {
        this.createHeroSlots(game);
        this.createUIButtons(game);
        this.createIcons(game);
        this.createLevelNodes(game);
        this.createBackgrounds(game);
    },

    createHeroSlots(game) {
        const colors = {
            green: 0x00ff00,
            blue: 0x00bfff,
            purple: 0x9400d3,
            orange: 0xff8c00,
            red: 0xff0000
        };

        Object.keys(colors).forEach(quality => {
            const graphics = game.make.graphics({ x: 0, y: 0, add: false });
            const color = colors[quality];
            
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(0, 0, 128, 128, 16);
            
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillCircle(64, 50, 35);
            
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(30, 90, 68, 4);
            graphics.fillRect(30, 100, 50, 4);
            graphics.fillRect(30, 110, 60, 4);
            
            graphics.generateTexture(`hero_slot_${quality}`, 128, 128);
            graphics.destroy();
        });

        const defaultSlot = game.make.graphics({ x: 0, y: 0, add: false });
        defaultSlot.fillStyle(0x666666, 1);
        defaultSlot.fillRoundedRect(0, 0, 128, 128, 16);
        defaultSlot.fillStyle(0x333333, 1);
        defaultSlot.fillCircle(64, 50, 35);
        defaultSlot.generateTexture('hero_slot', 128, 128);
        defaultSlot.destroy();
    },

    createUIButtons(game) {
        const buttonStyle = {
            width: 200,
            height: 80,
            colors: {
                battle: 0xcc3333,
                hero: 0x33cc33,
                friend: 0x3333cc,
                league: 0xcccc33,
                shop: 0xcc33cc,
                setting: 0x33cccc
            }
        };

        Object.keys(buttonStyle.colors).forEach(type => {
            const graphics = game.make.graphics({ x: 0, y: 0, add: false });
            const color = buttonStyle.colors[type];
            const { width, height } = buttonStyle;
            
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(0, 0, width, height, 12);
            
            graphics.fillStyle(0x000000, 0.2);
            graphics.fillRoundedRect(4, 4, width - 8, height - 8, 10);
            
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(8, 8, width - 16, height - 16, 8);
            
            graphics.generateTexture(`btn_${type}`, width, height);
            graphics.destroy();
        });

        const startBtn = game.make.graphics({ x: 0, y: 0, add: false });
        startBtn.fillStyle(0xffd700, 1);
        startBtn.fillRoundedRect(0, 0, 220, 60, 30);
        startBtn.fillStyle(0xffa500, 1);
        startBtn.fillRoundedRect(4, 4, 212, 52, 28);
        startBtn.generateTexture('btn_start', 220, 60);
        startBtn.destroy();

        const adBtn = game.make.graphics({ x: 0, y: 0, add: false });
        adBtn.fillStyle(0xff69b4, 1);
        adBtn.fillRoundedRect(0, 0, 180, 50, 25);
        adBtn.generateTexture('btn_ad', 180, 50);
        adBtn.destroy();
    },

    createIcons(game) {
        const goldIcon = game.make.graphics({ x: 0, y: 0, add: false });
        goldIcon.fillStyle(0xffd700, 1);
        goldIcon.fillCircle(24, 24, 20);
        goldIcon.fillStyle(0xffa500, 1);
        goldIcon.fillCircle(24, 24, 15);
        goldIcon.generateTexture('gold_icon', 48, 48);
        goldIcon.destroy();

        const yuanbaoIcon = game.make.graphics({ x: 0, y: 0, add: false });
        yuanbaoIcon.fillStyle(0xff69b4, 1);
        yuanbaoIcon.fillCircle(24, 24, 20);
        yuanbaoIcon.fillStyle(0xff1493, 1);
        yuanbaoIcon.fillCircle(24, 24, 14);
        yuanbaoIcon.generateTexture('yuanbao_icon', 48, 48);
        yuanbaoIcon.destroy();

        const energyIcon = game.make.graphics({ x: 0, y: 0, add: false });
        energyIcon.fillStyle(0x00ff00, 1);
        energyIcon.fillCircle(24, 24, 20);
        energyIcon.fillStyle(0x00cc00, 1);
        energyIcon.fillCircle(24, 24, 14);
        energyIcon.generateTexture('energy_icon', 48, 48);
        energyIcon.destroy();

        const heroIcon = game.make.graphics({ x: 0, y: 0, add: false });
        heroIcon.fillStyle(0x00bfff, 1);
        heroIcon.fillCircle(24, 24, 20);
        heroIcon.fillStyle(0x0088cc, 1);
        heroIcon.fillCircle(24, 24, 14);
        heroIcon.generateTexture('hero_icon', 48, 48);
        heroIcon.destroy();
    },

    createLevelNodes(game) {
        const normalNode = game.make.graphics({ x: 0, y: 0, add: false });
        normalNode.fillStyle(0x00ccff, 1);
        normalNode.fillCircle(40, 40, 35);
        normalNode.fillStyle(0x0099cc, 1);
        normalNode.fillCircle(40, 40, 28);
        normalNode.fillStyle(0xffffff, 1);
        normalNode.fillCircle(40, 40, 20);
        normalNode.generateTexture('level_node', 80, 80);
        normalNode.destroy();

        const lockedNode = game.make.graphics({ x: 0, y: 0, add: false });
        lockedNode.fillStyle(0x666666, 1);
        lockedNode.fillCircle(40, 40, 35);
        lockedNode.fillStyle(0x444444, 1);
        lockedNode.fillCircle(40, 40, 28);
        lockedNode.fillStyle(0x333333, 1);
        lockedNode.fillCircle(40, 40, 20);
        lockedNode.generateTexture('level_node_locked', 80, 80);
        lockedNode.destroy();

        const completedNode = game.make.graphics({ x: 0, y: 0, add: false });
        completedNode.fillStyle(0x00ff00, 1);
        completedNode.fillCircle(40, 40, 35);
        completedNode.fillStyle(0x00cc00, 1);
        completedNode.fillCircle(40, 40, 28);
        completedNode.fillStyle(0xffffff, 1);
        completedNode.fillCircle(40, 40, 18);
        completedNode.generateTexture('level_node_completed', 80, 80);
        completedNode.destroy();
    },

    createBackgrounds(game) {
        const mainBg = game.make.graphics({ x: 0, y: 0, add: false });
        
        mainBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        mainBg.fillRect(0, 0, 1280, 720);
        
        mainBg.fillStyle(0x2d2d44, 1);
        for (let i = 0; i < 5; i++) {
            mainBg.fillRect(100 + i * 250, 500, 150, 220);
            mainBg.fillTriangle(
                100 + i * 250, 500,
                175 + i * 250, 450,
                250 + i * 250, 500
            );
        }
        
        mainBg.fillStyle(0x3d3d5c, 1);
        mainBg.fillRect(0, 650, 1280, 70);
        
        mainBg.generateTexture('bg_main', 1280, 720);
        mainBg.destroy();

        const battleBg = game.make.graphics({ x: 0, y: 0, add: false });
        
        battleBg.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xf0e68c, 0xf0e68c, 1);
        battleBg.fillRect(0, 0, 1280, 720);
        
        battleBg.fillStyle(0x228b22, 1);
        battleBg.fillRect(0, 400, 1280, 320);
        
        battleBg.fillStyle(0x8b4513, 1);
        battleBg.fillRect(0, 380, 1280, 30);
        
        battleBg.generateTexture('bg_battle', 1280, 720);
        battleBg.destroy();
    },

    createHeroAvatars(game) {
        const heroConfigs = [
            { id: 'guanyu', name: '关羽', color: 0x00ff00 },
            { id: 'zhangfei', name: '张飞', color: 0x0000ff },
            { id: 'liubei', name: '刘备', color: 0xff0000 },
            { id: 'caocao', name: '曹操', color: 0x800080 },
            { id: 'zhaoyun', name: '赵云', color: 0x00bfff },
            { id: 'huangzhong', name: '黄忠', color: 0xffa500 },
            { id: 'machao', name: '马超', color: 0x800080 },
            { id: 'weiyan', name: '魏延', color: 0x008000 }
        ];

        heroConfigs.forEach(config => {
            const graphics = game.make.graphics({ x: 0, y: 0, add: false });
            
            graphics.fillStyle(config.color, 1);
            graphics.fillCircle(64, 64, 60);
            
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(64, 50, 30);
            
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(44, 95, 40, 20);
            
            graphics.generateTexture(`hero_${config.id}`, 128, 128);
            graphics.destroy();
        });

        const enemyConfigs = [
            { id: 'zhangjiao', name: '张角', color: 0xffff00 },
            { id: 'zhangbao', name: '张宝', color: 0xffff00 },
            { id: 'zhangliang', name: '张梁', color: 0xffff00 },
            { id: 'dongzhuo', name: '董卓', color: 0x800000 },
            { id: 'lvbu', name: '吕布', color: 0xff00ff }
        ];

        enemyConfigs.forEach(config => {
            const graphics = game.make.graphics({ x: 0, y: 0, add: false });
            
            graphics.fillStyle(config.color, 1);
            graphics.fillCircle(64, 64, 60);
            
            graphics.fillStyle(0x000000, 1);
            graphics.fillCircle(64, 50, 30);
            
            graphics.fillStyle(0xff0000, 1);
            graphics.fillRect(44, 95, 40, 20);
            
            graphics.generateTexture(`enemy_${config.id}`, 128, 128);
            graphics.destroy();
        });
    }
};
