class FriendScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FriendScene' });
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createFriendList();
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

        this.add.text(640, 50, '好友', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(640, 100, '好友数量: 0/50', {
            fontSize: '20px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        const addBtn = this.add.rectangle(1100, 50, 40, 40, 0x00cc00);
        addBtn.setInteractive({ useHandCursor: true });
        this.add.text(1100, 50, '+', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        addBtn.on('pointerdown', () => this.showAddFriendDialog());
    }

    createFriendList() {
        const playerData = DataManager.getInstance().getPlayerData();
        const friends = playerData.friends || [];
        
        if (friends.length === 0) {
            this.add.text(640, 360, '暂无好友\n可通过好友码添加', {
                fontSize: '24px',
                color: '#666666',
                align: 'center'
            }).setOrigin(0.5);
            return;
        }

        friends.forEach((friend, index) => {
            const y = 160 + index * 80;
            
            const card = this.add.rectangle(640, y, 600, 60, 0x2d2d44);
            card.setStrokeStyle(2, 0x00bfff);

            this.add.text(250, y - 10, friend.name || `好友${index + 1}`, {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(250, y + 15, `战力: ${friend.power || 0}`, {
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);

            this.add.text(900, y, '助战', {
                fontSize: '18px',
                color: '#00ff00'
            }).setOrigin(0.5);

            this.add.text(1000, y, '删除', {
                fontSize: '18px',
                color: '#ff6666'
            }).setOrigin(0.5);
        });
    }

    showAddFriendDialog() {
        const panel = this.add.rectangle(640, 360, 400, 250, 0x000000, 0.95);
        panel.setStrokeStyle(3, 0xffd700);

        this.add.text(640, 280, '添加好友', {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(640, 340, '输入好友码:', {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        const inputBg = this.add.rectangle(640, 380, 300, 40, 0x333333);
        const inputText = this.add.text(640, 380, '请输入好友码', {
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(0.5);

        inputBg.setInteractive({ useHandCursor: true });
        inputBg.on('pointerdown', () => {
            this.showMessage('请在下方输入框输入好友码');
        });

        const closeBtn = this.add.text(900, 250, 'X', {
            fontSize: '32px',
            color: '#ff0000'
        }).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            panel.destroy();
            closeBtn.destroy();
        });

        const confirmBtn = this.add.rectangle(640, 480, 150, 45, 0x00cc00);
        confirmBtn.setInteractive({ useHandCursor: true });
        this.add.text(640, 480, '确认添加', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        confirmBtn.on('pointerdown', () => {
            this.showMessage('好友添加功能开发中');
            panel.destroy();
            closeBtn.destroy();
        });
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
