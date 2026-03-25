class EquipmentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EquipmentScene' });
        this.selectedHero = null;
        this.currentTab = 'hero';
    }

    create() {
        this.createBackground();
        this.createUI();
        this.createHeroList();
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

        this.add.text(640, 50, '装备管理', {
            fontSize: '40px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(200, 110, '武将', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(700, 110, '背包', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.heroPanel = this.add.rectangle(250, 400, 350, 550, 0x2d2d44);
        this.backpackPanel = this.add.rectangle(750, 400, 350, 550, 0x2d2d44);

        this.heroDetailPanel = this.add.rectangle(1130, 400, 250, 550, 0x2d2d44);
        this.heroDetailPanel.setVisible(false);
    }

    createHeroList() {
        const heroes = DataManager.getInstance().getPlayerData().heroes;
        
        heroes.forEach((heroData, index) => {
            const y = 150 + index * 90;
            const hero = new Hero(heroData, true);
            
            const card = this.add.rectangle(250, y, 300, 70, 0x3d3d5c)
                .setInteractive({ useHandCursor: true });
            
            const qualityColor = this.getQualityColor(heroData.quality);
            card.setStrokeStyle(2, qualityColor);

            const heroIcon = this.add.circle(200, y, 25, qualityColor);
            
            this.add.text(230, y - 10, hero.name, {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(230, y + 15, `战力: ${hero.power}`, {
                fontSize: '14px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);

            const hasEquip = hero.hasEquipment();
            this.add.text(380, y, hasEquip ? '已装备' : '未装备', {
                fontSize: '14px',
                color: hasEquip ? '#00ff00' : '#666666'
            }).setOrigin(0.5);

            card.on('pointerdown', () => {
                this.selectHero(hero);
            });
        });
    }

    selectHero(hero) {
        this.selectedHero = hero;
        
        this.heroDetailPanel.setVisible(true);
        
        if (this.heroDetailPanelText) {
            this.heroDetailPanelText.destroy();
        }
        
        let equipmentList = '';
        const slotNames = ['武器', '防具', '头盔', '饰品'];
        
        hero.equipment.forEach((equip, index) => {
            if (equip) {
                equipmentList += `${slotNames[index]}: ${equip.name} (Lv.${equip.level})\n`;
            } else {
                equipmentList += `${slotNames[index]}: 空\n`;
            }
        });

        const detailText = `
武将: ${hero.name}
等级: ${hero.level}
星级: ${hero.star}

攻击: ${hero.getTotalAttack()}
防御: ${hero.getTotalDefense()}
生命: ${Math.floor(hero.getTotalMaxHp())}

${equipmentList}
        `.trim();

        this.heroDetailPanelText = this.add.text(1130, 400, detailText, {
            fontSize: '18px',
            color: '#ffffff',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.createEquipmentSlots(hero);
    }

    createEquipmentSlots(hero) {
        if (this.equipmentSlots) {
            this.equipmentSlots.forEach(slot => slot.destroy());
        }
        this.equipmentSlots = [];

        const slotNames = ['武器', '防具', '头盔', '饰品'];
        const colors = [0xff0000, 0x0066ff, 0xffff00, 0x00ff00];

        slotNames.forEach((name, index) => {
            const x = 1030 + (index % 2) * 100;
            const y = 650 + Math.floor(index / 2) * 60;

            const slot = this.add.rectangle(x, y, 80, 40, 0x333333)
                .setInteractive({ useHandCursor: true });
            slot.setStrokeStyle(2, colors[index]);

            this.add.text(x, y, name, {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);

            const equip = hero.equipment[index];
            if (equip) {
                this.add.text(x, y + 25, equip.name.substring(0, 3), {
                    fontSize: '10px',
                    color: '#ffd700'
                }).setOrigin(0.5);
            }

            slot.on('pointerdown', () => {
                this.showEquipmentSelector(hero, index);
            });

            this.equipmentSlots.push(slot);
        });
    }

    showEquipmentSelector(hero, slotIndex) {
        const typeMap = {
            0: 'weapon',
            1: 'armor', 
            2: 'helmet',
            3: 'accessory'
        };

        const equipType = typeMap[slotIndex];
        const backpackEquipments = DataManager.getInstance().getBackpackEquipments();
        const typeEquipments = backpackEquipments.filter(e => e.type === equipType);

        const panel = this.add.rectangle(750, 400, 300, 400, 0x000000, 0.9);
        panel.setStrokeStyle(2, 0xffd700);

        this.add.text(750, 150, '选择装备', {
            fontSize: '24px',
            color: '#ffd700'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(920, 120, 'X', {
            fontSize: '32px',
            color: '#ff0000'
        }).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            panel.destroy();
            closeBtn.destroy();
        });

        typeEquipments.forEach((equip, index) => {
            const y = 220 + index * 50;
            const btn = this.add.rectangle(750, y, 250, 40, 0x3d3d5c)
                .setInteractive({ useHandCursor: true });
            
            btn.setStrokeStyle(2, this.getQualityColor(equip.quality));

            this.add.text(750, y, `${equip.name} Lv.${equip.level}`, {
                fontSize: '16px',
                color: '#ffffff'
            }).setOrigin(0.5);

            const statsText = `+${equip.attackBonus}攻 +${equip.defenseBonus}防 +${equip.hpBonus}血`;
            this.add.text(750, y + 20, statsText, {
                fontSize: '12px',
                color: '#aaaaaa'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                DataManager.getInstance().equipItemToHero(hero.id, equip.id, slotIndex);
                hero.equipment[slotIndex] = equip;
                this.selectHero(hero);
                panel.destroy();
                closeBtn.destroy();
            });
        });

        if (typeEquipments.length === 0) {
            this.add.text(750, 300, '背包中没有该类型装备', {
                fontSize: '18px',
                color: '#666666'
            }).setOrigin(0.5);
        }
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
