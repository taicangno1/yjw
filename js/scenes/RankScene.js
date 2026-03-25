class RankScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RankScene' });
        this.currentTab = 'power';
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createRankList();
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

        this.add.text(640, 50, '排行榜', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createTabBar();
    }

    createTabBar() {
        const tabs = [
            { key: 'power', label: '战力榜' },
            { key: 'level', label: '等级榜' },
            { key: 'chapter', label: '关卡榜' }
        ];

        tabs.forEach((tab, index) => {
            const x = 350 + index * 180;
            const isSelected = this.currentTab === tab.key;
            
            const btn = this.add.rectangle(x, 120, 150, 45, isSelected ? 0xffd700 : 0x333333);
            btn.setInteractive({ useHandCursor: true });
            
            this.add.text(x, 120, tab.label, {
                fontSize: '20px',
                color: isSelected ? '#000000' : '#ffffff'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.currentTab = tab.key;
                this.scene.restart();
            });
        });
    }

    createRankList() {
        const playerData = DataManager.getInstance().getPlayerData();
        const myRank = this.calculateMyRank();
        
        const mockRanks = this.generateMockRanks();

        mockRanks.forEach((rank, index) => {
            const y = 180 + index * 60;
            
            let rankColor = '#aaaaaa';
            if (index === 0) rankColor = '#ffd700';
            else if (index === 1) rankColor = '#c0c0c0';
            else if (index === 2) rankColor = '#cd7f32';

            this.add.text(100, y, `#${index + 1}`, {
                fontSize: '24px',
                color: rankColor,
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            const card = this.add.rectangle(500, y, 800, 50, 0x2d2d44);
            if (rank.isMe) {
                card.setStrokeStyle(2, 0x00ff00);
            }

            this.add.text(200, y, rank.name, {
                fontSize: '20px',
                color: rank.isMe ? '#00ff00' : '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            let valueText = '';
            if (this.currentTab === 'power') {
                valueText = `战力: ${rank.power}`;
            } else if (this.currentTab === 'level') {
                valueText = `等级: ${rank.level}`;
            } else {
                valueText = `关卡: ${rank.chapter}`;
            }

            this.add.text(700, y, valueText, {
                fontSize: '18px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);
        });

        this.add.text(640, 680, `我的排名: #${myRank}`, {
            fontSize: '24px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    generateMockRanks() {
        const playerData = DataManager.getInstance().getPlayerData();
        const playerName = playerData.nickname;
        
        const names = ['曹操', '刘备', '孙权', '关羽', '张飞', '赵云', '诸葛亮', '周瑜', '司马懿', '吕布'];
        const ranks = [];

        for (let i = 0; i < 10; i++) {
            const isMe = i === 4;
            ranks.push({
                name: isMe ? playerName : names[i],
                power: 50000 - i * 3000 + (isMe ? playerData.gold : 0),
                level: 50 - i * 3 + (isMe ? playerData.level : 0),
                chapter: 12 - i + (isMe ? 2 : 0),
                isMe: isMe
            });
        }

        ranks.sort((a, b) => {
            if (this.currentTab === 'power') return b.power - a.power;
            if (this.currentTab === 'level') return b.level - a.level;
            return b.chapter - a.chapter;
        });

        return ranks;
    }

    calculateMyRank() {
        return Math.floor(Math.random() * 50) + 1;
    }
}
