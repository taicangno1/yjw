import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    
    private _bgmVolume: number = 0.8;
    private _sfxVolume: number = 0.8;
    private _currentBGM: string = '';
    
    onLoad() {
        this.loadSettings();
    }
    
    private loadSettings(): void {
        const settings = localStorage.getItem('audioSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this._bgmVolume = parsed.bgmVolume ?? 0.8;
            this._sfxVolume = parsed.sfxVolume ?? 0.8;
        }
    }
    
    private saveSettings(): void {
        const settings = {
            bgmVolume: this._bgmVolume,
            sfxVolume: this._sfxVolume
        };
        localStorage.setItem('audioSettings', JSON.stringify(settings));
    }
    
    public playBGM(bgmName: string): void {
        if (this._currentBGM === bgmName) return;
        this._currentBGM = bgmName;
        // TODO: 使用 Cocos AudioSource 播放BGM
        // const url = `audio/bgm/${bgmName}`;
        // resources.load(url, (err, clip) => {
        //     if (!err) {
        //         this.audioSource.clip = clip;
        //         this.audioSource.loop = true;
        //         this.audioSource.volume = this._bgmVolume;
        //         this.audioSource.play();
        //     }
        // });
    }
    
    public stopBGM(): void {
        this._currentBGM = '';
        // this.audioSource.stop();
    }
    
    public playSFX(sfxName: string): void {
        // TODO: 使用 Cocos AudioSource 播放音效
        // const url = `audio/sfx/${sfxName}`;
        // resources.load(url, (err, clip) => {
        //     if (!err) {
        //         this.audioSourceOneShotAudio(clip, this._sfxVolume);
        //     }
        // });
    }
    
    public setBGMVolume(volume: number): void {
        this._bgmVolume = Math.max(0, Math.min(1, volume));
        // this.audioSource.volume = this._bgmVolume;
        this.saveSettings();
    }
    
    public setSFXVolume(volume: number): void {
        this._sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    public getBGMVolume(): number {
        return this._bgmVolume;
    }
    
    public getSFXVolume(): number {
        return this._sfxVolume;
    }
}
