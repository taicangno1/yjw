import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

export type AdScene = 'offline_double' | 'fragment_extra' | 'energy_full' | 'battle_speedup';

export interface AdResult {
    success: boolean;
    rewardType: string;
    rewardAmount: number;
}

@ccclass('AdManager')
export class AdManager extends Component {
    
    private _platform: 'wechat' | 'douyin' | 'unknown' = 'unknown';
    private _rewardedVideoAd: any = null;
    private _interstitialAd: any = null;
    private _pendingReward: ((result: AdResult) => void) | null = null;
    
    onLoad() {
        this.detectPlatform();
        this.initAds();
    }
    
    private detectPlatform(): void {
        // @ts-ignore
        if (typeof wx !== 'undefined') {
            this._platform = 'wechat';
        // @ts-ignore
        } else if (typeof tt !== 'undefined') {
            this._platform = 'douyin';
        } else {
            this._platform = 'unknown';
        }
    }
    
    private initAds(): void {
        if (this._platform === 'unknown') return;
        
        // 初始化激励视频广告
        // this.initRewardedVideoAd();
        
        // 初始化插屏广告
        // this.initInterstitialAd();
    }
    
    public async showRewardedVideo(scene: AdScene): Promise<AdResult> {
        return new Promise((resolve) => {
            if (this._platform === 'unknown') {
                resolve({ success: false, rewardType: scene, rewardAmount: 0 });
                return;
            }
            
            this._pendingReward = resolve;
            
            // 模拟广告播放（实际需要接入各平台SDK）
            setTimeout(() => {
                if (this._pendingReward) {
                    const result = this.getRewardForScene(scene);
                    this._pendingReward(result);
                    this._pendingReward = null;
                }
            }, 1000);
        });
    }
    
    private getRewardForScene(scene: AdScene): AdResult {
        switch (scene) {
            case 'offline_double':
                return { success: true, rewardType: 'gold', rewardAmount: 2 };
            case 'fragment_extra':
                return { success: true, rewardType: 'heroFragment', rewardAmount: 1 };
            case 'energy_full':
                return { success: true, rewardType: 'energy', rewardAmount: 100 };
            case 'battle_speedup':
                return { success: true, rewardType: 'speed', rewardAmount: 2 };
            default:
                return { success: true, rewardType: 'unknown', rewardAmount: 0 };
        }
    }
    
    public async showInterstitial(): Promise<void> {
        return new Promise((resolve) => {
            if (this._platform === 'unknown') {
                resolve();
                return;
            }
            
            // 模拟插屏广告
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }
    
    public isRewardedVideoReady(): boolean {
        return this._rewardedVideoAd !== null;
    }
    
    public isInterstitialReady(): boolean {
        return this._interstitialAd !== null;
    }
}
