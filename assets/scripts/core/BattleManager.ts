import { _decorator, Component } from 'cc';
import { HeroData, TroopType } from '../data/PlayerData';
import { Hero } from '../entity/Hero';
import { getTroopRestraintBonus } from '../utils/BattleUtils';

const { ccclass, property } = _decorator;

export enum BattleState {
    IDLE = 'idle',
    ROUND_START = 'round_start',
    ACTION_SELECT = 'action_select',
    ACTION_EXECUTE = 'action_execute',
    ROUND_END = 'round_end',
    VICTORY = 'victory',
    DEFEAT = 'defeat'
}

export interface DamageResult {
    damage: number;
    isCrit: boolean;
    isDodge: boolean;
    isCombo: boolean;
}

@ccclass('BattleManager')
export class BattleManager extends Component {
    
    private _battleState: BattleState = BattleState.IDLE;
    private _playerHeroes: Hero[] = [];
    private _enemyHeroes: Hero[] = [];
    private _currentTurnIndex: number = 0;
    private _currentRound: number = 1;
    
    startBattle(playerHeroData: HeroData[], enemyHeroData: HeroData[]): void {
        this._playerHeroes = playerHeroData.map(data => new Hero(data));
        this._enemyHeroes = enemyHeroData.map(data => new Hero(data));
        
        this.sortBySpeed();
        this._battleState = BattleState.ROUND_START;
        this._currentRound = 1;
        this._currentTurnIndex = 0;
        
        this.executeRound();
    }
    
    private sortBySpeed(): void {
        const allHeroes = [...this._playerHeroes, ...this._enemyHeroes];
        allHeroes.sort((a, b) => b.speed - a.speed);
        
        this._playerHeroes = allHeroes.filter(h => h.isPlayer);
        this._enemyHeroes = allHeroes.filter(h => !h.isPlayer);
    }
    
    private executeRound(): void {
        if (this.checkBattleEnd()) return;
        
        this._battleState = BattleState.ACTION_EXECUTE;
        
        const allHeroes = [...this._playerHeroes, ...this._enemyHeroes];
        
        for (let i = 0; i < allHeroes.length; i++) {
            const hero = allHeroes[i];
            if (hero.isDead) continue;
            
            this._currentTurnIndex = i;
            this.executeTurn(hero);
            
            if (this.checkBattleEnd()) return;
        }
        
        this._currentRound++;
        this.executeRound();
    }
    
    private executeTurn(hero: Hero): void {
        const target = this.selectTarget(hero);
        if (!target) return;
        
        const damageResult = this.calculateDamage(hero, target);
        target.takeDamage(damageResult.damage);
        
        if (damageResult.isCombo && !target.isDead) {
            const comboDamage = Math.floor(damageResult.damage * 0.5);
            target.takeDamage(comboDamage);
        }
        
        this.onDamageDealt(hero, target, damageResult);
    }
    
    private selectTarget(hero: Hero): Hero | null {
        const enemies = hero.isPlayer ? this._enemyHeroes : this._playerHeroes;
        const aliveEnemies = enemies.filter(e => !e.isDead);
        
        if (aliveEnemies.length === 0) return null;
        
        return aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    }
    
    public calculateDamage(attacker: Hero, defender: Hero, skillCoefficient: number = 1.0): DamageResult {
        let damage = attacker.attack * skillCoefficient - defender.defense;
        
        const restraintBonus = getTroopRestraintBonus(attacker.troop, defender.troop);
        damage *= restraintBonus;
        
        const isCrit = Math.random() < attacker.critRate;
        if (isCrit) {
            damage *= 2;
        }
        
        const isDodge = Math.random() < defender.dodgeRate;
        if (isDodge) {
            damage = 0;
        }
        
        const isCombo = Math.random() < attacker.comboRate;
        
        damage = Math.max(damage, 1);
        
        return { damage: Math.floor(damage), isCrit, isDodge, isCombo };
    }
    
    private onDamageDealt(attacker: Hero, defender: Hero, result: DamageResult): void {
        // 触发UI更新、动画播放等
    }
    
    private checkBattleEnd(): boolean {
        const playerAllDead = this._playerHeroes.every(h => h.isDead);
        const enemyAllDead = this._enemyHeroes.every(h => h.isDead);
        
        if (enemyAllDead) {
            this._battleState = BattleState.VICTORY;
            this.onBattleEnd(true);
            return true;
        }
        
        if (playerAllDead) {
            this._battleState = BattleState.DEFEAT;
            this.onBattleEnd(false);
            return true;
        }
        
        return false;
    }
    
    private onBattleEnd(isVictory: boolean): void {
        if (isVictory) {
            // 计算奖励并发放
        }
    }
    
    public getBattleState(): BattleState {
        return this._battleState;
    }
    
    public getPlayerHeroes(): Hero[] {
        return this._playerHeroes;
    }
    
    public getEnemyHeroes(): Hero[] {
        return this._enemyHeroes;
    }
}
