import { _decorator, Component, Button, Label } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('MainCityUI')
export class MainCityUI extends Component {
    
    @property(Button)
    private battleButton!: Button;
    
    @property(Button)
    private heroButton!: Button;
    
    @property(Button)
    private friendButton!: Button;
    
    @property(Button)
    private leagueButton!: Button;
    
    @property(Button)
    private shopButton!: Button;
    
    @property(Button)
    private settingsButton!: Button;
    
    onLoad() {
        this.initButtons();
    }
    
    start() {
        this.updateDisplay();
    }
    
    private initButtons(): void {
        this.battleButton.node.on('click', this.onBattleClick, this);
        this.heroButton.node.on('click', this.onHeroClick, this);
        this.friendButton.node.on('click', this.onFriendClick, this);
        this.leagueButton.node.on('click', this.onLeagueClick, this);
        this.shopButton.node.on('click', this.onShopClick, this);
        this.settingsButton.node.on('click', this.onSettingsClick, this);
    }
    
    private updateDisplay(): void {
        // 更新UI显示
    }
    
    private onBattleClick(): void {
        GameManager.getInstance().loadScene('LevelSelect');
    }
    
    private onHeroClick(): void {
        GameManager.getInstance().loadScene('HeroList');
    }
    
    private onFriendClick(): void {
        GameManager.getInstance().loadScene('FriendList');
    }
    
    private onLeagueClick(): void {
        GameManager.getInstance().loadScene('League');
    }
    
    private onShopClick(): void {
        // 显示商店界面
    }
    
    private onSettingsClick(): void {
        // 显示设置界面
    }
}
