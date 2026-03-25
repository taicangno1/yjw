class AdManager {
    static _instance = null;
    
    constructor() {
        if (AdManager._instance) {
            return AdManager._instance;
        }
        AdManager._instance = this;
        
        this._platform = 'unknown';
        this._rewardedVideoAd = null;
        this._interstitialAd = null;
        this._pendingReward = null;
        
        this.detectPlatform();
        this.initAds();
    }

    static getInstance() {
        return AdManager._instance;
    }

    detectPlatform() {
        if (typeof wx !== 'undefined') {
            this._platform = 'wechat';
        } else if (typeof tt !== 'undefined') {
            this._platform = 'douyin';
        } else {
            this._platform = 'browser';
        }
    }

    initAds() {
        if (this._platform === 'wechat') {
            this.initWechatAds();
        } else if (this._platform === 'douyin') {
            this.initDouyinAds();
        }
    }

    initWechatAds() {
        // 微信小程序广告初始化
        // this._rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'xxx' });
        // this._interstitialAd = wx.createInterstitialAd({ adUnitId: 'xxx' });
    }

    initDouyinAds() {
        // 抖音小程序广告初始化
        // this._rewardedVideoAd = tt.createRewardedVideoAd({ adUnitId: 'xxx' });
        // this._interstitialAd = tt.createInterstitialAd({ adUnitId: 'xxx' });
    }

    showRewardedVideo(scene) {
        return new Promise((resolve) => {
            if (this._platform === 'browser') {
                const result = this.getRewardForScene(scene);
                resolve(result);
                return;
            }

            if (this._rewardedVideoAd) {
                this._rewardedVideoAd.show().then(() => {
                    this._rewardedVideoAd.onClose((res) => {
                        if (res.isEnded) {
                            resolve(this.getRewardForScene(scene));
                        } else {
                            resolve({ success: false, rewardType: scene, rewardAmount: 0 });
                        }
                    });
                }).catch(() => {
                    resolve({ success: false, rewardType: scene, rewardAmount: 0 });
                });
            } else {
                setTimeout(() => {
                    resolve(this.getRewardForScene(scene));
                }, 1000);
            }
        });
    }

    getRewardForScene(scene) {
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

    showInterstitial() {
        return new Promise((resolve) => {
            if (this._platform === 'browser') {
                setTimeout(resolve, 3000);
                return;
            }

            if (this._interstitialAd) {
                this._interstitialAd.show().then(resolve).catch(resolve);
            } else {
                setTimeout(resolve, 3000);
            }
        });
    }

    isRewardedVideoReady() {
        return this._rewardedVideoAd !== null;
    }

    isInterstitialReady() {
        return this._interstitialAd !== null;
    }
}
