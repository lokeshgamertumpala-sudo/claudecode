/**
 * Progression System - Handles player progression, XP, coins, etc.
 */
export class ProgressionSystem {
    constructor(config, saveManager) {
        this.config = config;
        this.saveManager = saveManager;
        this.xp = 0;
        this.coins = 0;
    }
    update(deltaTime) {}
    addRewards(rewards) {
        if (rewards.coins) this.coins += rewards.coins;
    }
    getScore() {
        return this.xp;
    }
    getCoins() {
        return this.coins;
    }
    dispose() {}
}