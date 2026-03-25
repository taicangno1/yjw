import { _decorator, Component } from 'cc';
import { DataManager } from './DataManager';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

export interface OfflineEarnings {
    gold: number;
    exp: number;
    heroFragments: { [heroId: string]: number };
    equipmentFragments: number;
    duration: number;
    battlesCount: number;
    victoriesCount: number;
}

@ccclass('OfflineManager')
export class OfflineManager extends Component {
    
    private _maxOfflineSeconds: number = 24 * 60 * 60; // 24小时
    
    onLoad() {
        this.recordOfflineTime();
    }
    
    public recordOfflineTime(): void {
        const playerData = GameManager.getInstance().getPlayerData();
        playerData.lastOfflineTime = Date.now();
    }
    
    public checkOfflineEarnings(): void {
        const playerData = GameManager.getInstance().getPlayerData();
        const offlineDuration = this.getOfflineDuration();
        
        if (offlineDuration < 60) return; // 离线小于1分钟不弹窗
        
        const earnings = this.calculateOfflineEarnings(offlineDuration);
        
        // 弹出离线收益界面
        this.showOfflineEarningsUI(earnings);
    }
    
    public getOfflineDuration(): number {
        const playerData = GameManager.getInstance().getPlayerData();
        const now = Date.now();
        const offlineMs = now - playerData.lastOfflineTime;
        const offlineSeconds = Math.floor(offlineMs / 1000);
        return Math.min(offlineSeconds, this._maxOfflineSeconds);
    }
    
    public calculateOfflineEarnings(duration: number): OfflineEarnings {
        const playerData = GameManager.getInstance().getPlayerData();
        const battlesPerMinute = 2; // 约2分钟一场战斗
        const totalBattles = Math.floor(duration / 60 * battlesPerMinute);
        const victories = Math.floor(totalBattles * 0.7); // 70%胜率
        
        const baseGoldPerBattle = 100;
        const baseExpPerBattle = 50;
        
        const gold = baseGoldPerBattle * totalBattles;
        const exp = baseExpPerBattle * totalBattles;
        
        const heroFragments: { [heroId: string]: number } = {};
        if (Math.random() < 0.3) {
            const randomHero = playerData.heroes[Math.floor(Math.random() * playerData.heroes.length)];
            heroFragments[randomHero.id] = Math.floor(Math.random() * 5) + 1;
        }
        
        return {
            gold,
            exp,
            heroFragments,
            equipmentFragments: Math.floor(Math.random() * 10),
            duration,
            battlesCount: totalBattles,
            victoriesCount: victories
        };
    }
    
    private showOfflineEarningsUI(earnings: OfflineEarnings): void {
        // TODO: 显示离线收益UI界面
        console.log('Offline Earnings:', earnings);
    }
    
    public async claimOfflineEarnings(): Promise<OfflineEarnings> {
        const duration = this.getOfflineDuration();
        const earnings = this.calculateOfflineEarnings(duration);
        
        const playerData = GameManager.getInstance().getPlayerData();
        playerData.gold += earnings.gold;
        
        Object.entries(earnings.heroFragments).forEach(([heroId, fragments]) => {
            playerData.heroFragments[heroId] = (playerData.heroFragments[heroId] || 0) + fragments;
        });
        
        return earnings;
    }
    
    public async claimWithAd(): Promise<OfflineEarnings> {
        const earnings = await this.claimOfflineEarnings();
        
        // 双倍奖励
        earnings.gold *= 2;
        
        Object.keys(earnings.heroFragments).forEach(heroId => {
            earnings.heroFragments[heroId] *= 2;
        });
        
        return earnings;
    }
}
