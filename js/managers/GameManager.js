class GameManager {
    static _instance = null;
    
    constructor() {
        if (GameManager._instance) {
            return GameManager._instance;
        }
        GameManager._instance = this;
    }

    static getInstance() {
        return GameManager._instance;
    }

    init(game) {
        this.game = game;
        this.initManagers();
    }

    initManagers() {
        DataManager.getInstance();
        BattleManager.getInstance();
        OfflineManager.getInstance();
        AudioManager.getInstance();
        AdManager.getInstance();
    }

    loadScene(sceneKey) {
        this.game.scene.start(sceneKey);
    }

    getCurrentScene() {
        return this.game.scene.getActive()[0];
    }
}
