import { _decorator, Component } from 'cc';
import { PlayerData, HeroData, EquipmentData } from '../data/PlayerData';

const { ccclass, property } = _decorator;

@ccclass('DataManager')
export class DataManager extends Component {
    
    private _playerData!: PlayerData;
    private _saveInterval: number = 30000; // 30秒自动保存
    
    onLoad() {
        this.initPlayerData();
    }
    
    start() {
        this.schedule(this.save, this._saveInterval);
    }
    
    private initPlayerData(): void {
        this._playerData = {
            uid: this.generateUID(),
            nickname: '玩家' + Math.floor(Math.random() * 10000),
            level: 1,
            gold: 1000,
            yuanbao: 0,
            energy: 100,
            maxEnergy: 100,
            lastEnergyTime: Date.now(),
            lastOfflineTime: Date.now(),
            heroes: [],
            formation: [],
            equipments: [],
            heroFragments: {},
            items: { sweepTicket: 5 },
            currentChapter: 1,
            currentLevel: 1,
            unlockedLevels: [],
            friends: [],
            friendRequests: [],
            leagueId: '',
            leagueContribution: 0
        };
        
        this.initStarterHeroes();
    }
    
    private initStarterHeroes(): void {
        const starterHeroes = ['hero_001', 'hero_002', 'hero_003', 'hero_004', 'hero_005'];
        starterHeroes.forEach((heroId, index) => {
            const hero: HeroData = {
                id: heroId,
                level: 1,
                exp: 0,
                star: 1,
                attack: 100,
                defense: 80,
                hp: 1000,
                speed: 50,
                critRate: 0.1,
                dodgeRate: 0.05,
                comboRate: 0.15,
                equipment: ['', '', '', ''],
                isLocked: false
            };
            this._playerData.heroes.push(hero);
            
            if (index < 3) {
                this._playerData.formation.push(heroId);
            }
        });
        
        this._playerData.unlockedLevels = ['level_01_01'];
    }
    
    private generateUID(): string {
        return 'player_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }
    
    public save(): void {
        this._playerData.lastOfflineTime = Date.now();
        const saveData = JSON.stringify(this._playerData);
        localStorage.setItem('playerData', saveData);
        localStorage.setItem('lastSaveTime', Date.now().toString());
    }
    
    public load(): boolean {
        const saveData = localStorage.getItem('playerData');
        if (saveData) {
            try {
                this._playerData = JSON.parse(saveData);
                this.updateEnergy();
                return true;
            } catch (e) {
                console.error('Failed to load player data:', e);
                return false;
            }
        }
        return false;
    }
    
    public reset(): void {
        localStorage.removeItem('playerData');
        localStorage.removeItem('lastSaveTime');
        this.initPlayerData();
    }
    
    public getPlayerData(): PlayerData {
        return this._playerData;
    }
    
    public addGold(amount: number): void {
        this._playerData.gold += amount;
    }
    
    public spendGold(amount: number): boolean {
        if (this._playerData.gold >= amount) {
            this._playerData.gold -= amount;
            return true;
        }
        return false;
    }
    
    public addYuanbao(amount: number): void {
        this._playerData.yuanbao += amount;
    }
    
    public addEnergy(amount: number): void {
        this._playerData.energy = Math.min(this._playerData.energy + amount, this._playerData.maxEnergy);
    }
    
    public consumeEnergy(amount: number): boolean {
        if (this._playerData.energy >= amount) {
            this._playerData.energy -= amount;
            this._playerData.lastEnergyTime = Date.now();
            return true;
        }
        return false;
    }
    
    public updateEnergy(): void {
        const now = Date.now();
        const elapsed = (now - this._playerData.lastEnergyTime) / 1000;
        const energy恢复 = Math.floor(elapsed / 300); // 5分钟恢复1点
        if (energy恢复 > 0) {
            this._playerData.energy = Math.min(this._playerData.energy + energy恢复, this._playerData.maxEnergy);
            this._playerData.lastEnergyTime = now;
        }
    }
    
    public upgradeHero(heroId: string): boolean {
        const hero = this._playerData.heroes.find(h => h.id === heroId);
        if (!hero) return false;
        
        const cost = this.calculateUpgradeCost(hero.level);
        if (this.spendGold(cost)) {
            hero.level += 1;
            hero.hp = this.calculateHP(hero);
            hero.attack = this.calculateAttack(hero);
            hero.defense = this.calculateDefense(hero);
            return true;
        }
        return false;
    }
    
    private calculateUpgradeCost(level: number): number {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    private calculateHP(hero: HeroData): number {
        const baseHP = 1000;
        const growth = this.getHPGrowth(hero.star);
        return baseHP + (hero.level - 1) * growth;
    }
    
    private calculateAttack(hero: HeroData): number {
        const baseAttack = 100;
        const growth = this.getAttackGrowth(hero.star);
        return baseAttack + (hero.level - 1) * growth;
    }
    
    private calculateDefense(hero: HeroData): number {
        const baseDefense = 80;
        const growth = this.getDefenseGrowth(hero.star);
        return baseDefense + (hero.level - 1) * growth;
    }
    
    private getHPGrowth(star: number): number {
        const growthTable = [0, 50, 70, 90, 120, 150];
        return growthTable[star] || 50;
    }
    
    private getAttackGrowth(star: number): number {
        const growthTable = [0, 5, 7, 9, 12, 15];
        return growthTable[star] || 5;
    }
    
    private getDefenseGrowth(star: number): number {
        const growthTable = [0, 4, 5, 7, 9, 12];
        return growthTable[star] || 4;
    }
    
    public isLevelUnlocked(levelId: string): boolean {
        return this._playerData.unlockedLevels.includes(levelId);
    }
    
    public unlockLevel(levelId: string): void {
        if (!this._playerData.unlockedLevels.includes(levelId)) {
            this._playerData.unlockedLevels.push(levelId);
        }
    }
}
