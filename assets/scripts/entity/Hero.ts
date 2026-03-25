import { HeroData, TroopType } from '../data/PlayerData';

export class Hero {
    public readonly id: string;
    public readonly name: string;
    public readonly isPlayer: boolean;
    public readonly troop: TroopType;
    
    public level: number;
    public exp: number;
    public star: number;
    public attack: number;
    public defense: number;
    public hp: number;
    public maxHp: number;
    public speed: number;
    public critRate: number;
    public dodgeRate: number;
    public comboRate: number;
    public equipment: string[];
    
    private _currentHp: number;
    private _isDead: boolean = false;
    
    constructor(data: HeroData, isPlayer: boolean = true) {
        this.id = data.id;
        this.name = data.id;
        this.isPlayer = isPlayer;
        this.troop = this.inferTroop(data.id);
        
        this.level = data.level;
        this.exp = data.exp;
        this.star = data.star;
        this.attack = data.attack;
        this.defense = data.defense;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.speed = data.speed;
        this.critRate = data.critRate;
        this.dodgeRate = data.dodgeRate;
        this.comboRate = data.comboRate;
        this.equipment = [...data.equipment];
        
        this._currentHp = this.maxHp;
    }
    
    private inferTroop(id: string): TroopType {
        // 根据武将ID推断兵种
        // 实际应该从配置表读取
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const troops = [TroopType.INFANTRY, TroopType.CAVALRY, TroopType.ARCHER];
        return troops[hash % 3];
    }
    
    public takeDamage(damage: number): void {
        this._currentHp = Math.max(0, this._currentHp - damage);
        if (this._currentHp <= 0) {
            this._isDead = true;
        }
    }
    
    public heal(amount: number): void {
        this._currentHp = Math.min(this.maxHp, this._currentHp + amount);
    }
    
    public isAlive(): boolean {
        return !this._isDead;
    }
    
    public get isDead(): boolean {
        return this._isDead;
    }
    
    public get currentHp(): number {
        return this._currentHp;
    }
    
    public get hpPercent(): number {
        return this._currentHp / this.maxHp;
    }
    
    public addExp(amount: number): void {
        this.exp += amount;
        // 检查升级
        const expNeeded = this.calculateExpForNextLevel();
        while (this.exp >= expNeeded) {
            this.levelUp();
        }
    }
    
    private levelUp(): void {
        this.level++;
        this.exp -= this.calculateExpForNextLevel();
        
        // 属性成长
        this.attack += 5;
        this.defense += 4;
        this.maxHp += 50;
        this._currentHp = this.maxHp;
    }
    
    private calculateExpForNextLevel(): number {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }
}
