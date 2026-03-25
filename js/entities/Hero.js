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
        this.equipment = [...data.equipment];
        
        this._currentHp = this.hp;
        this._isDead = false;
        
        this.sprite = null;
        this.hpBar = null;
        this.nameText = null;
    }

    takeDamage(damage) {
        this._currentHp = Math.max(0, this._currentHp - damage);
        if (this._currentHp <= 0) {
            this._isDead = true;
        }
    }

    heal(amount) {
        this._currentHp = Math.min(this.maxHp, this._currentHp + amount);
    }

    attackTarget(target, damageResult) {
        target.takeDamage(damageResult.damage);
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
        
        this.attack += 5;
        this.defense += 4;
        this.maxHp += 50;
        this.hp = this.maxHp;
        this._currentHp = this.maxHp;
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
        return this._currentHp / this.maxHp;
    }
}
