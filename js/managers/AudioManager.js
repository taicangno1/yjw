class AudioManager {
    static _instance = null;
    
    constructor() {
        if (AudioManager._instance) {
            return AudioManager._instance;
        }
        AudioManager._instance = this;
        
        this._bgmVolume = 0.8;
        this._sfxVolume = 0.8;
        this._currentBGM = null;
        this._bgmAudio = null;
    }

    static getInstance() {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }

    playBGM(bgmKey) {
        if (this._currentBGM === bgmKey) return;
        
        if (this._bgmAudio) {
            this._bgmAudio.stop();
        }
        
        if (this._bgmVolume > 0) {
            this._bgmAudio = game.sound.add(bgmKey);
            if (this._bgmAudio) {
                this._bgmAudio.setLoop(true);
                this._bgmAudio.setVolume(this._bgmVolume);
                this._bgmAudio.play();
                this._currentBGM = bgmKey;
            }
        }
    }

    stopBGM() {
        if (this._bgmAudio) {
            this._bgmAudio.stop();
            this._currentBGM = null;
        }
    }

    playSFX(sfxKey) {
        if (this._sfxVolume > 0 && game.sound.get(sfxKey)) {
            const sfx = game.sound.add(sfxKey);
            if (sfx) {
                sfx.setVolume(this._sfxVolume);
                sfx.play();
            }
        }
    }

    setBGMVolume(volume) {
        this._bgmVolume = Math.max(0, Math.min(1, volume));
        if (this._bgmAudio) {
            this._bgmAudio.setVolume(this._bgmVolume);
        }
        this.saveSettings();
    }

    setSFXVolume(volume) {
        this._sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    getBGMVolume() {
        return this._bgmVolume;
    }

    getSFXVolume() {
        return this._sfxVolume;
    }

    saveSettings() {
        const settings = {
            bgmVolume: this._bgmVolume,
            sfxVolume: this._sfxVolume
        };
        localStorage.setItem('audioSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const settings = localStorage.getItem('audioSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this._bgmVolume = parsed.bgmVolume ?? 0.8;
            this._sfxVolume = parsed.sfxVolume ?? 0.8;
        }
    }
}
