class LeagueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeagueScene' });
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createLeagueInfo();
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

        this.add.text(640, 50, '联盟', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    createLeagueInfo() {
        const playerData = DataManager.getInstance().getPlayerData();
        
        if (!playerData.leagueId) {
            this.showNoLeague();
        } else {
            this.showLeagueDetail(playerData.league);
        }
    }

    showNoLeague() {
        this.add.text(640, 280, '您还没有加入联盟', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const createBtn = this.add.rectangle(540, 380, 180, 50, 0xffd700);
        createBtn.setInteractive({ useHandCursor: true });
        this.add.text(540, 380, '创建联盟', {
            fontSize: '22px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        createBtn.on('pointerdown', () => this.showCreateLeague());

        const joinBtn = this.add.rectangle(740, 380, 180, 50, 0x00bfff);
        joinBtn.setInteractive({ useHandCursor: true });
        this.add.text(740, 380, '加入联盟', {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        joinBtn.on('pointerdown', () => this.showJoinLeague());
    }

    showLeagueDetail(league) {
        this.add.text(640, 140, league.name || '我的联盟', {
            fontSize: '32px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const infoText = `
联盟等级: ${league.level || 1}
成员数量: ${league.members?.length || 1}/50
联盟贡献: ${league.contribution || 0}
        `.trim();

        this.add.text(640, 220, infoText, {
            fontSize: '20px',
            color: '#aaaaaa',
            lineSpacing: 10
        }).setOrigin(0.5);

        this.add.text(200, 320, '联盟成员', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const members = league.members || [{name: '你', contribution: 0}];
        members.forEach((member, index) => {
            const y = 380 + index * 50;
            
            this.add.text(200, y, member.name || `成员${index + 1}`, {
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            this.add.text(500, y, `贡献: ${member.contribution || 0}`, {
                fontSize: '16px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);
        });

        this.add.text(1000, 320, '联盟BOSS', {
            fontSize: '24px',
            color: '#ff6666',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const bossPanel = this.add.rectangle(1000, 450, 250, 200, 0x2d2d44);
        bossPanel.setStrokeStyle(2, 0xff0000);

        this.add.text(1000, 400, '吕布', {
            fontSize: '24px',
            color: '#ff6666'
        }).setOrigin(0.5);

        this.add.text(1000, 440, '血量: 50万/50万', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        const challengeBtn = this.add.rectangle(1000, 500, 120, 40, 0xff0000);
        challengeBtn.setInteractive({ useHandCursor: true });
        this.add.text(1000, 500, '挑战', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        challengeBtn.on('pointerdown', () => this.showMessage('挑战功能开发中'));
    }

    showCreateLeague() {
        this.showMessage('创建联盟需要500元宝');
    }

    showJoinLeague() {
        this.showMessage('加入联盟功能开发中');
    }

    showMessage(text) {
        const msg = this.add.text(640, 360, text, {
            fontSize: '24px',
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
