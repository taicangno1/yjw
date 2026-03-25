import { _decorator, Component, game } from 'cc';
import { DataManager } from './DataManager';
import { BattleManager } from './BattleManager';
import { OfflineManager } from './OfflineManager';
import { AudioManager } from './AudioManager';
import { AdManager } from './AdManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;
    
    public dataManager!: DataManager;
    public battleManager!: BattleManager;
    public offlineManager!: OfflineManager;
    public audioManager!: AudioManager;
    public adManager!: AdManager;
    
    private _currentScene: string = '';
    
    public static getInstance(): GameManager {
        return this._instance!;
    }
    
    onLoad() {
        if (GameManager._instance !== null) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        game.addPersistRootNode(this.node);
        
        this.initManagers();
    }
    
    onDestroy() {
        GameManager._instance = null;
    }
    
    private initManagers(): void {
        this.dataManager = this.node.addComponent(DataManager);
        this.battleManager = this.node.addComponent(BattleManager);
        this.offlineManager = this.node.addComponent(OfflineManager);
        this.audioManager = this.node.addComponent(AudioManager);
        this.adManager = this.node.addComponent(AdManager);
    }
    
    public onGameStart(): void {
        this.dataManager.load();
        this.offlineManager.checkOfflineEarnings();
        this.audioManager.playBGM('main');
    }
    
    public onGamePause(): void {
        this.dataManager.save();
    }
    
    public onGameResume(): void {
        this.offlineManager.checkOfflineEarnings();
    }
    
    public onGameExit(): void {
        this.dataManager.save();
        this.offlineManager.recordOfflineTime();
    }
    
    public async loadScene(sceneName: string): Promise<void> {
        await new Promise<void>((resolve) => {
            // @ts-ignore
            cc.director.loadScene(sceneName, () => {
                this._currentScene = sceneName;
                resolve();
            });
        });
    }
    
    public getCurrentScene(): string {
        return this._currentScene;
    }
}
