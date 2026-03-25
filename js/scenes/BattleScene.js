class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    create() {
        this.createBackground();
        this.createBattleUI();
        this.startBattle();
    }

    createBackground() {
        const bg = this.add.image(640, 360, 'bg_battle');
        bg.setDisplaySize(1280, 720);
    }

    createBattleUI() {
        const topBar = this.add.rectangle(640, 30, 1260, 60, 0x000000, 0.5);
        topBar.setOrigin(0.5);

        const backBtn = this.add.rectangle(80, 30, 100, 50, 0x333333, 0);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => {
            this.scene.start('MainCityScene');
        });
        
        this.add.text(50, 30, '< 撤退', {
            fontSize: '24px',
            color: '#ff6666'
        }).setOrigin(0, 0.5);

        this.roundText = this.add.text(640, 30, '第1回合', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(640, 680, 'VS', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(300, 100, '我方', {
            fontSize: '24px',
            color: '#0066ff'
        }).setOrigin(0.5);

        this.add.text(980, 100, '敌方', {
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5);
    }

    startBattle() {
        const battleData = BattleManager.getInstance().getBattleData();
        this.playerHeroes = battleData.playerHeroes;
        this.enemyHeroes = battleData.enemyHeroes;
        this.currentTurnIndex = 0;
        this.currentRound = 1;
        
        this.displayHeroes();
        
        this.time.delayedCall(1000, () => {
            this.startTurn();
        });
    }

    displayHeroes() {
        const playerStartX = 850;
        const enemyStartX = 350;
        const y = 350;

        this.playerHeroes.forEach((hero, index) => {
            const heroKey = `hero_${hero.id.replace('hero_', '')}`;
            hero.sprite = this.add.image(playerStartX + index * 90, y, heroKey).setScale(0.9);
            hero.hpBarBg = this.add.rectangle(playerStartX + index * 90, y - 70, 70, 10, 0x333333);
            hero.hpBar = this.add.rectangle(playerStartX + index * 90 - 35, y - 70, 70, 10, 0x00ff00);
            hero.nameText = this.add.text(playerStartX + index * 90, y + 60, hero.name, {
                fontSize: '18px',
                color: '#0066ff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            hero.levelText = this.add.text(playerStartX + index * 90, y + 85, `Lv.${hero.level}`, {
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(0.5);
        });

        this.enemyHeroes.forEach((hero, index) => {
            const heroKey = `enemy_${hero.id.replace('enemy_', '')}`;
            hero.sprite = this.add.image(enemyStartX + index * 90, y, heroKey).setScale(0.9);
            hero.hpBarBg = this.add.rectangle(enemyStartX + index * 90, y - 70, 70, 10, 0x333333);
            hero.hpBar = this.add.rectangle(enemyStartX + index * 90 - 35, y - 70, 70, 10, 0xff0000);
            hero.nameText = this.add.text(enemyStartX + index * 90, y + 60, hero.name, {
                fontSize: '18px',
                color: '#ff0000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            hero.levelText = this.add.text(enemyStartX + index * 90, y + 85, `Lv.${hero.level}`, {
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(0.5);
        });
    }

    startTurn() {
        this.roundText.setText(`第${this.currentRound}回合`);
        
        const allHeroes = [...this.playerHeroes, ...this.enemyHeroes].filter(h => !h.isDead);
        allHeroes.sort((a, b) => b.speed - a.speed);
        
        if (allHeroes.length === 0) {
            this.checkBattleEnd();
            return;
        }
        
        this.executeTurnSequence(allHeroes, 0);
    }

    executeTurnSequence(heroes, index) {
        if (index >= heroes.length) {
            this.currentRound++;
            this.time.delayedCall(500, () => {
                this.startTurn();
            });
            return;
        }

        const hero = heroes[index];
        if (hero.isDead) {
            this.executeTurnSequence(heroes, index + 1);
            return;
        }

        const enemies = hero.isPlayer ? this.enemyHeroes : this.playerHeroes;
        const aliveEnemies = enemies.filter(e => !e.isDead);
        
        if (aliveEnemies.length === 0) {
            this.checkBattleEnd();
            return;
        }

        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        
        const skill = this.selectSkill(hero);
        
        this.showAttackAnimation(hero, target, () => {
            let damageResult;
            let skillName = null;
            
            if (skill && skill.canUse()) {
                skill.use();
                skillName = skill.name;
                damageResult = BattleManager.getInstance().calculateDamageWithSkill(hero, target, skill);
            } else {
                damageResult = BattleManager.getInstance().calculateDamage(hero, target);
            }
            
            hero.attackTarget(target, damageResult);
            
            this.showDamage(target, damageResult, skillName);
            this.updateHPBar(target);
            
            this.handleLifesteal(hero, damageResult);
            
            this.time.delayedCall(300, () => {
                if (damageResult.isCombo && !target.isDead) {
                    const comboDamage = Math.floor(damageResult.damage * 0.5);
                    target.takeDamage(comboDamage);
                    this.showDamage(target, { damage: comboDamage, isCrit: false, isDodge: false, isCombo: true });
                    this.updateHPBar(target);
                }
                
                if (target.isDead) {
                    this.showDeathEffect(target);
                }
                
                this.handleCounterAttack(target, hero);
                
                this.time.delayedCall(300, () => {
                    this.executeTurnSequence(heroes, index + 1);
                });
            });
        });
    }

    handleLifesteal(hero, damageResult) {
        if (damageResult.damage <= 0 || hero.isDead) return;
        
        hero.skills.forEach(skill => {
            if (skill.type === 'passive' && skill.effect === 'lifesteal') {
                const healAmount = Math.floor(damageResult.damage * skill.buffValue);
                hero.heal(healAmount);
                this.showHeal(hero, healAmount);
            }
        });
    }

    handleCounterAttack(defender, attacker) {
        if (defender.isDead || attacker.isDead) return;
        
        defender.skills.forEach(skill => {
            if (skill.type === 'passive' && skill.effect === 'counter') {
                if (Math.random() < skill.buffValue) {
                    const counterDamage = Math.floor(attacker.getTotalAttack() * 0.5);
                    attacker.takeDamage(counterDamage);
                    this.showDamage(attacker, { damage: counterDamage, isCrit: false, isDodge: false, isCombo: false }, '反击');
                    this.updateHPBar(attacker);
                    
                    if (attacker.isDead) {
                        this.showDeathEffect(attacker);
                    }
                }
            }
        });
    }

    showHeal(hero, amount) {
        if (!hero.sprite) return;
        
        const text = this.add.text(hero.sprite.x, hero.sprite.y - 100, `+${amount}`, {
            fontSize: '28px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: hero.sprite.y - 150,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    showAttackAnimation(attacker, target, callback) {
        const originalX = attacker.sprite.x;
        const direction = attacker.isPlayer ? -1 : 1;
        
        this.tweens.add({
            targets: attacker.sprite,
            x: originalX + direction * 50,
            duration: 200,
            yoyo: true,
            onComplete: callback
        });
    }

    selectSkill(hero) {
        if (!hero.skills || hero.skills.length === 0) return null;
        
        const activeSkills = hero.skills.filter(s => s.type === 'active' && s.canUse());
        if (activeSkills.length === 0) return null;
        
        if (Math.random() < 0.3) {
            return activeSkills[Math.floor(Math.random() * activeSkills.length)];
        }
        return null;
    }

    showDamage(hero, result, skillName = null) {
        const x = hero.sprite.x;
        const y = hero.sprite.y - 80;
        
        let color = '#ffffff';
        let text = `-${result.damage}`;
        
        if (result.isDodge) {
            color = '#ffff00';
            text = '闪避';
        } else if (result.isCrit) {
            color = '#ff6600';
            text = `-${result.damage}`;
        }
        
        if (result.isCombo) {
            text += '!';
        }
        
        const dmgText = this.add.text(x, y, text, {
            fontSize: '36px',
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dmgText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            onComplete: () => dmgText.destroy()
        });
    }

    updateHPBar(hero) {
        const percent = Math.max(0, hero.currentHp / hero.maxHp);
        hero.hpBar.width = 70 * percent;
        
        if (percent < 0.3) {
            hero.hpBar.setFillStyle(0xff0000);
        } else if (percent < 0.6) {
            hero.hpBar.setFillStyle(0xffff00);
        } else {
            hero.hpBar.setFillStyle(0x00ff00);
        }
    }

    showDeathEffect(hero) {
        this.tweens.add({
            targets: [hero.sprite, hero.hpBar, hero.hpBarBg, hero.nameText, hero.levelText],
            alpha: 0,
            scale: 0.3,
            duration: 500,
            onComplete: () => {
                [hero.sprite, hero.hpBar, hero.hpBarBg, hero.nameText, hero.levelText].forEach(obj => {
                    if (obj) obj.destroy();
                });
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
        AudioManager.getInstance().playSFX('victory');
        
        const panel = this.add.rectangle(640, 360, 500, 400, 0x000000, 0.9);
        panel.setStrokeStyle(4, 0xffd700);
        
        const title = this.add.text(640, 200, '胜利!', {
            fontSize: '72px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const rewards = BattleManager.getInstance().getBattleRewards();
        let yPos = 300;
        
        this.add.text(640, yPos, `金币: +${rewards.gold}`, {
            fontSize: '32px',
            color: '#ffd700'
        }).setOrigin(0.5);
        yPos += 50;

        this.add.text(640, yPos, `经验: +${rewards.exp}`, {
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(0.5);
        yPos += 50;

        if (rewards.equipment) {
            const equipName = rewards.equipment.name;
            const equipColor = this.getQualityColor(rewards.equipment.quality);
            this.add.text(640, yPos, `装备: ${equipName}`, {
                fontSize: '28px',
                color: '#' + equipColor.toString(16).padStart(6, '0')
            }).setOrigin(0.5);
            yPos += 50;
        }

        if (rewards.fragment) {
            const heroNames = {
                'hero_001': '关羽', 'hero_002': '张飞', 'hero_003': '刘备',
                'hero_004': '曹操', 'hero_005': '赵云'
            };
            const heroName = heroNames[rewards.fragment.heroId] || '武将';
            this.add.text(640, yPos, `碎片: ${heroName}x${rewards.fragment.count}`, {
                fontSize: '28px',
                color: '#00bfff'
            }).setOrigin(0.5);
            yPos += 50;
        }

        const continueBtn = this.add.rectangle(640, yPos + 30, 200, 50, 0x00cc00);
        continueBtn.setInteractive({ useHandCursor: true });
        continueBtn.on('pointerdown', () => {
            BattleManager.getInstance().claimRewards();
            this.scene.start('LevelSelectScene');
        });
        
        this.add.text(640, yPos + 30, '继续', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    showDefeat() {
        const panel = this.add.rectangle(640, 360, 400, 300, 0x000000, 0.9);
        panel.setStrokeStyle(4, 0xff0000);
        
        this.add.text(640, 280, '失败', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const retryBtn = this.add.rectangle(540, 380, 150, 50, 0xcc6600);
        retryBtn.setInteractive({ useHandCursor: true });
        retryBtn.on('pointerdown', () => {
            this.scene.start('LevelSelectScene');
        });
        this.add.text(540, 380, '重新挑战', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const backBtn = this.add.rectangle(740, 380, 150, 50, 0x666666);
        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => {
            this.scene.start('MainCityScene');
        });
        this.add.text(740, 380, '返回', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    getQualityColor(quality) {
        const colors = {
            green: 0x00ff00,
            blue: 0x00bfff,
            purple: 0x9400d3,
            orange: 0xff8c00,
            red: 0xff0000
        };
        return colors[quality] || 0x00ff00;
    }
}
