class Hero {
    constructor(data, isPlayer = true) {
        this.id = data.id;
        this.name = data.name;
        this.quality = data.quality;
        this.troop = data.troop;
        this.isPlayer = isPlayer;
        
        this.level = data.level;
        this.exp = data.exp;
        this.star = data.star;
        this.attack = data.attack;
        this.defense = data.defense;
        this.hp = data.hp;
        this.maxHp = data.maxHp || data.hp;
        this.speed = data.speed;
        this.critRate = data.critRate;
        this.dodgeRate = data.dodgeRate;
        this.comboRate = data.comboRate;
        
        this.equipment = data.equipment || [null, null, null, null];
        this.skills = data.skills || getHeroSkills(data.id);
        this.buffs = [];
        
        this._currentHp = this.hp;
        this._isDead = false;
        
        this.sprite = null;
        this.hpBar = null;
        this.nameText = null;
    }

    addBuff(buff) {
        this.buffs.push(buff);
    }

    tickBuffs() {
        this.buffs.forEach(buff => buff.tick());
        this.buffs = this.buffs.filter(buff => !buff.isExpired());
    }

    getAttackBonus() {
        let bonus = 0;
        this.buffs.forEach(buff => {
            if (buff.type === 'buff_attack' || buff.type === 'buff_all_attack') {
                bonus += buff.value;
            }
        });
        return bonus;
    }

    getDefenseBonus() {
        let bonus = 0;
        this.buffs.forEach(buff => {
            if (buff.type === 'buff_defense') {
                bonus += buff.value;
            }
        });
        return bonus;
    }

    getTotalAttack() {
        let baseAttack = this.attack;
        this.equipment.forEach(equip => {
            if (equip) {
                baseAttack += equip.getTotalAttackBonus();
            }
        });
        return Math.floor(baseAttack * (1 + this.getAttackBonus()));
    }

    getTotalDefense() {
        let baseDefense = this.defense;
        this.equipment.forEach(equip => {
            if (equip) {
                baseDefense += equip.getTotalDefenseBonus();
            }
        });
        return Math.floor(baseDefense * (1 + this.getDefenseBonus()));
    }

    getTotalDefense() {
        let baseDefense = this.defense;
        this.equipment.forEach(equip => {
            if (equip) {
                baseDefense += equip.getTotalDefenseBonus();
            }
        });
        return baseDefense;
    }

    getTotalMaxHp() {
        let baseMaxHp = this.maxHp;
        this.equipment.forEach(equip => {
            if (equip) {
                baseMaxHp += equip.getTotalHpBonus();
            }
        });
        return baseMaxHp;
    }

    equipItem(equipment, slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.equipment.length) {
            return null;
        }
        
        const oldEquipment = this.equipment[slotIndex];
        this.equipment[slotIndex] = equipment;
        
        if (equipment && equipment.ownerHeroId) {
            equipment.ownerHeroId = this.id;
        }
        
        return oldEquipment;
    }

    unequipItem(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.equipment.length) {
            return null;
        }
        
        const equipment = this.equipment[slotIndex];
        this.equipment[slotIndex] = null;
        
        if (equipment) {
            equipment.ownerHeroId = null;
        }
        
        return equipment;
    }

    getEquipmentByType(type) {
        const typeToSlot = {
            'weapon': 0,
            'armor': 1,
            'helmet': 2,
            'accessory': 3
        };
        
        const slotIndex = typeToSlot[type];
        if (slotIndex !== undefined) {
            return this.equipment[slotIndex];
        }
        return null;
    }

    hasEquipment() {
        return this.equipment.some(e => e !== null);
    }

    takeDamage(damage) {
        const actualDefense = this.getTotalDefense();
        const reducedDamage = Math.max(1, damage - actualDefense * 0.5);
        this._currentHp = Math.max(0, this._currentHp - reducedDamage);
        if (this._currentHp <= 0) {
            this._isDead = true;
        }
        return reducedDamage;
    }

    heal(amount) {
        this._currentHp = Math.min(this.getTotalMaxHp(), this._currentHp + amount);
    }

    attackTarget(target, damageResult) {
        const actualAttack = this.getTotalAttack();
        const damage = Math.floor(actualAttack * (damageResult.damage / this.attack));
        target.takeDamage(damage);
    }

    addExp(amount) {
        this.exp += amount;
        const expNeeded = this.calculateExpForNextLevel();
        while (this.exp >= expNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.calculateExpForNextLevel();
        
        const baseGrowth = 1 + (this.star - 1) * 0.2;
        this.attack += Math.floor(5 * baseGrowth);
        this.defense += Math.floor(4 * baseGrowth);
        this.maxHp += Math.floor(50 * baseGrowth);
        this.hp = this.maxHp;
        this._currentHp = this.getTotalMaxHp();
    }

    calculateExpForNextLevel() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    get currentHp() {
        return this._currentHp;
    }

    get isDead() {
        return this._isDead;
    }

    get isAlive() {
        return !this._isDead;
    }

    get hpPercent() {
        return this._currentHp / this.getTotalMaxHp();
    }

    get power() {
        return Math.floor(
            this.getTotalAttack() + 
            this.getTotalDefense() + 
            this.getTotalMaxHp() / 10
        );
    }
}
