class GameManager {
    static _instance = null;
    
    constructor() {
        if (GameManager._instance) {
            return GameManager._instance;
        }
        GameManager._instance = this;
    }

    static getInstance() {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    init(game) {
        this.game = game;
        this.initManagers();
    }

    initManagers() {
        if (!this.dataManager) {
            this.dataManager = new DataManager();
        }
        if (!this.battleManager) {
            this.battleManager = new BattleManager();
        }
        if (!this.offlineManager) {
            this.offlineManager = new OfflineManager();
        }
        if (!this.audioManager) {
            this.audioManager = new AudioManager();
        }
        if (!this.adManager) {
            this.adManager = new AdManager();
        }
    }

    loadScene(sceneKey) {
        this.game.scene.start(sceneKey);
    }

    getCurrentScene() {
        return this.game.scene.getActive()[0];
    }
}
