import { _decorator, Component, Label, Sprite } from 'cc';
import { GameManager } from '../core/GameManager';
import { DataManager } from '../core/DataManager';

const { ccclass, property } = _decorator;

@ccclass('ResourceBar')
export class ResourceBar extends Component {
    
    @property(Label)
    private goldLabel!: Label;
    
    @property(Label)
    private yuanbaoLabel!: Label;
    
    @property(Label)
    private energyLabel!: Label;
    
    @property(Label)
    private levelLabel!: Label;
    
    @property(Label)
    private powerLabel!: Label;
    
    private _updateInterval: number = 1;
    
    onLoad() {
        this.schedule(this.updateDisplay, this._updateInterval);
    }
    
    start() {
        this.updateDisplay();
    }
    
    public updateDisplay(): void {
        const playerData = GameManager.getInstance().getDataManager().getPlayerData();
        
        this.goldLabel.string = this.formatNumber(playerData.gold);
        this.yuanbaoLabel.string = this.formatNumber(playerData.yuanbao);
        this.energyLabel.string = `${playerData.energy}/${playerData.maxEnergy}`;
        this.levelLabel.string = `Lv.${playerData.level}`;
        
        const totalPower = this.calculateTotalPower(playerData);
        this.powerLabel.string = this.formatNumber(totalPower);
    }
    
    private formatNumber(num: number): string {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + '亿';
        }
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    }
    
    private calculateTotalPower(playerData: any): number {
        let totalPower = 0;
        
        playerData.heroes.forEach((hero: any) => {
            if (!hero.isLocked) {
                const heroPower = hero.attack + hero.defense + hero.hp / 10;
                totalPower += heroPower * hero.star;
            }
        });
        
        return Math.floor(totalPower);
    }
}
