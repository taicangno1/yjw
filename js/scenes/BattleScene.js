class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    create() {
        this.createBattleUI();
        this.startBattle();
    }

    createBattleUI() {
        const topBar = this.add.rectangle(640, 30, 1260, 60, 0x000000, 0.5);
        topBar.setOrigin(0.5);

        this.add.text(50, 30, '< 撤退', {
            fontSize: '24px',
            color: '#ff6666'
        }).setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.scene.start('MainCityScene'));

        this.roundText = this.add.text(640, 30, '第1回合', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.battleSpeedBtn = this.add.text(1200, 30, '1x', {
            fontSize: '24px',
            color: '#00ff00'
        }).setInteractive({ useHandCursor: true });

        this.add.text(640, 680, 'vs', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    startBattle() {
        const battleData = BattleManager.getInstance().getBattleData();
        this.playerHeroes = battleData.playerHeroes;
        this.enemyHeroes = battleData.enemyHeroes;
        this.currentTurnIndex = 0;
        this.currentRound = 1;
        
        this.displayHeroes();
        this.startTurn();
    }

    displayHeroes() {
        const playerStartX = 900;
        const enemyStartX = 380;
        const y = 360;

        this.playerHeroes.forEach((hero, index) => {
            hero.sprite = this.add.rectangle(playerStartX + index * 80, y, 60, 100, 0x0066ff);
            hero.hpBar = this.add.rectangle(playerStartX + index * 80, y - 70, 50, 8, 0x00ff00);
            hero.nameText = this.add.text(playerStartX + index * 80, y + 70, hero.name, {
                fontSize: '16px',
                color: '#0066ff'
            }).setOrigin(0.5);
        });

        this.enemyHeroes.forEach((hero, index) => {
            hero.sprite = this.add.rectangle(enemyStartX + index * 80, y, 60, 100, 0xff0000);
            hero.hpBar = this.add.rectangle(enemyStartX + index * 80, y - 70, 50, 8, 0xff0000);
            hero.nameText = this.add.text(enemyStartX + index * 80, y + 70, hero.name, {
                fontSize: '16px',
                color: '#ff0000'
            }).setOrigin(0.5);
        });
    }

    startTurn() {
        this.roundText.setText(`第${this.currentRound}回合`);
        
        const allHeroes = [...this.playerHeroes, ...this.enemyHeroes];
        allHeroes.sort((a, b) => b.speed - a.speed);
        
        this.executeTurn(allHeroes, 0);
    }

    executeTurn(heroes, index) {
        if (index >= heroes.length) {
            this.currentRound++;
            this.startTurn();
            return;
        }

        const hero = heroes[index];
        if (hero.isDead) {
            this.executeTurn(heroes, index + 1);
            return;
        }

        const enemies = hero.isPlayer ? this.enemyHeroes : this.playerHeroes;
        const aliveEnemies = enemies.filter(e => !e.isDead);
        if (aliveEnemies.length === 0) {
            this.checkBattleEnd();
            return;
        }

        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        
        const damageResult = BattleManager.getInstance().calculateDamage(hero, target);
        hero.attackTarget(target, damageResult);
        
        this.showDamage(target, damageResult);
        this.updateHPBar(target);
        
        this.time.delayedCall(800, () => {
            if (damageResult.isCombo && !target.isDead) {
                const comboDamage = Math.floor(damageResult.damage * 0.5);
                target.takeDamage(comboDamage);
                this.showDamage(target, { damage: comboDamage, isCrit: false, isDodge: false, isCombo: false });
                this.updateHPBar(target);
            }
            
            if (target.isDead) {
                this.showDeathEffect(target);
            }
            
            this.time.delayedCall(300, () => {
                this.executeTurn(heroes, index + 1);
            });
        });
    }

    showDamage(hero, result) {
        const x = hero.sprite.x;
        const y = hero.sprite.y - 50;
        
        let color = '#ffffff';
        if (result.isDodge) color = '#ffff00';
        else if (result.isCrit) color = '#ff6600';
        
        const text = result.isDodge ? '闪避' : `-${result.damage}`;
        const dmgText = this.add.text(x, y, text, {
            fontSize: '32px',
            color: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => dmgText.destroy()
        });
    }

    updateHPBar(hero) {
        const percent = hero.currentHp / hero.maxHp;
        hero.hpBar.width = 50 * percent;
        
        if (percent < 0.3) {
            hero.hpBar.setFillStyle(0xff0000);
        } else if (percent < 0.6) {
            hero.hpBar.setFillStyle(0xffff00);
        }
    }

    showDeathEffect(hero) {
        this.tweens.add({
            targets: hero.sprite,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            onComplete: () => {
                hero.sprite.destroy();
                hero.hpBar.destroy();
                hero.nameText.destroy();
            }
        });
    }

    checkBattleEnd() {
        const playerAllDead = this.playerHeroes.every(h => h.isDead);
        const enemyAllDead = this.enemyHeroes.every(h => h.isDead);

        if (enemyAllDead) {
            this.showVictory();
        } else if (playerAllDead) {
            this.showDefeat();
        }
    }

    showVictory() {
        AudioManager.getInstance().playSFX('sfx_victory');
        
        const panel = this.add.rectangle(640, 360, 600, 400, 0x000000, 0.9);
        panel.setStrokeStyle(4, 0xffd700);
        
        this.add.text(640, 250, '胜利!', {
            fontSize: '64px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const rewards = BattleManager.getInstance().getBattleRewards();
        
        this.add.text(640, 350, `金币: +${rewards.gold}`, {
            fontSize: '28px',
            color: '#ffd700'
        }).setOrigin(0.5);

        this.add.text(640, 400, `经验: +${rewards.exp}`, {
            fontSize: '28px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const continueBtn = this.add.text(640, 500, '继续', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
        
        continueBtn.on('pointerdown', () => {
            BattleManager.getInstance().claimRewards();
            this.scene.start('LevelSelectScene');
        });
    }

    showDefeat() {
        const panel = this.add.rectangle(640, 360, 400, 300, 0x000000, 0.9);
        panel.setStrokeStyle(4, 0xff0000);
        
        this.add.text(640, 300, '失败', {
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);

        const retryBtn = this.add.text(640, 380, '重新挑战', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
        
        retryBtn.on('pointerdown', () => {
            this.scene.start('LevelSelectScene');
        });

        const backBtn = this.add.text(640, 430, '返回', {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerdown', () => {
            this.scene.start('MainCityScene');
        });
    }
}
