/**
 * Level Manager - Handles level loading, progression, and wave management
 * Configuration-driven level system that supports hundreds of levels
 */
export class LevelManager {
    constructor(config) {
        this.config = config;

        // Level data
        this.currentLevel = 1;
        this.currentWave = 0;
        this.totalWavesPerLevel = this.config.getConfig('levels', 'wavesPerLevel') || 3;
        this.wavesCompleted = 0;

        // Level-specific data
        this.levelData = {};
        this.waveData = {};

        // Progression within level
        this.levelStartTime = 0;
        this.levelElapsedTime = 0;

        // Unlocked levels
        this.unlockedLevels = new Set([1]); // Start with level 1 unlocked

        // Load level configurations
        this.loadLevelConfigurations();
    }

    /**
     * Load level configurations (could be from external files)
     */
    loadLevelConfigurations() {
        // For now, we'll generate levels procedurally
        // In a full implementation, this would load from JSON files or database
        this.levelTemplates = this.generateLevelTemplates();
    }

    /**
     * Generate level templates for procedural generation
     */
    generateLevelTemplates() {
        const templates = {};

        // Generate templates for first 50 levels (can be expanded)
        for (let level = 1; level <= 50; level++) {
            templates[level] = this.generateLevelTemplate(level);
        }

        return templates;
    }

    /**
     * Generate a level template based on level number
     */
    generateLevelTemplate(levelNumber) {
        const difficultyMultiplier = 1 + (levelNumber - 1) * 0.15; // 15% increase per level
        const world = Math.floor((levelNumber - 1) / 10); // World 0-4 for levels 1-50
        const worldDifficulty = 1 + world * 0.5; // Each world is 50% harder than previous

        return {
            level: levelNumber,
            world: world + 1,
            difficulty: difficultyMultiplier * worldDifficulty,
            goalMultiplier: this.config.getConfig('game', 'levelGoalMultiplier') || 10,
            gatesPerLevel: {
                min: Math.floor(this.config.getConfig('levels', 'gatesPerLevel', 'min') || 4),
                max: Math.floor(this.config.getConfig('levels', 'gatesPerLevel', 'max') || 8)
            },
            enemySpawnRate: this.config.getConfig('levels', 'enemySpawnRateBase') || 0.02,
            enemyTypes: this.getEnemyTypesForLevel(levelNumber),
            specialRules: this.getSpecialRulesForLevel(levelNumber),
            backgroundTheme: this.getBackgroundThemeForLevel(levelNumber),
            musicTrack: this.getMusicTrackForLevel(levelNumber)
        };
    }

    /**
     * Get enemy types available for a specific level
     */
    getEnemyTypesForLevel(levelNumber) {
        const baseTypes = ['basic'];
        if (levelNumber >= 3) baseTypes.push('fast');
        if (levelNumber >= 5) baseTypes.push('shield');
        if (levelNumber >= 8) baseTypes.push('heavy');
        if (levelNumber >= 12) baseTypes.push('fastEnemy');
        if (levelNumber >= 15) baseTypes.push('ranged');

        return baseTypes;
    }

    /**
     * Get special rules for a specific level
     */
    getSpecialRulesForLevel(levelNumber) {
        const rules = [];

        if (levelNumber % 5 === 0) {
            rules.push('double_gates'); // Every 5th level has more gates
        }
        if (levelNumber % 7 === 0) {
            rules.push('fast_enemies'); // Every 7th level has faster enemies
        }
        if (levelNumber >= 20 && levelNumber % 10 === 0) {
            rules.push('boss_level'); // Every 10th level after 20 is a boss level
        }
        if (levelNumber >= 30) {
            rules.push('mixed_paths'); // Later levels have more complex paths
        }

        return rules;
    }

    /**
     * Get background theme for a specific level
     */
    getBackgroundThemeForLevel(levelNumber) {
        const themes = ['space', 'forest', 'desert', 'ice', 'cyber', 'magic', 'ruins', 'ocean'];
        const themeIndex = Math.floor((levelNumber - 1) / 5) % themes.length;
        return themes[themeIndex];
    }

    /**
     * Get music track for a specific level
     */
    getMusicTrackForLevel(levelNumber) {
        const tracks = ['track1', 'track2', 'track3', 'track4', 'track5'];
        const trackIndex = (levelNumber - 1) % tracks.length;
        return tracks[trackIndex];
    }

    /**
     * Start a new level
     */
    startLevel(levelNumber) {
        // Check if level is unlocked
        if (!this.isLevelUnlocked(levelNumber)) {
            console.warn(`Level ${levelNumber} is not unlocked`);
            return false;
        }

        this.currentLevel = levelNumber;
        this.currentWave = 0;
        this.wavesCompleted = 0;
        this.levelStartTime = Date.now();
        this.levelElapsedTime = 0;

        // Load level data
        this.levelData = this.getLevelData(levelNumber);
        this.waveData = {};

        // Notify spawning system to start first wave
        // This would be done through events or direct call to game systems

        return true;
    }

    /**
     * Get data for the current level
     */
    getLevelData(levelNumber = null) {
        const level = levelNumber !== null ? levelNumber : this.currentLevel;
        return this.levelTemplates[level] || this.generateLevelTemplate(level);
    }

    /**
     * Get current level number
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Get current wave number
     */
    getCurrentWave() {
        return this.currentWave;
    }

    /**
     * Get goal for current level (crowd size needed to win)
     */
    getCurrentLevelGoal() {
        const levelData = this.getLevelData();
        const baseGoal = this.config.getConfig('game', 'startingCrowd') || 15;
        const goalMultiplier = levelData.goalMultiplier || 10;
        const difficulty = levelData.difficulty || 1;

        return Math.floor(baseGoal * goalMultiplier * difficulty);
    }

    /**
     * Complete current wave
     */
    completeWave() {
        this.wavesCompleted++;
        this.currentWave++;

        // Check if level is complete
        if (this.wavesCompleted >= this.totalWavesPerLevel) {
            return this.completeLevel();
        }

        // Prepare for next wave
        this.prepareNextWave();
        return false; // Level not complete yet
    }

    /**
     * Prepare for next wave
     */
    prepareNextWave() {
        // Increase difficulty for next wave within same level
        // This could spawn tougher enemies, more gates, etc.
        this.waveData = {
            waveNumber: this.currentWave,
            difficultyModifier: 1 + (this.currentWave - 1) * 0.1, // 10% increase per wave
            enemySpawnRateIncrease: (this.currentWave - 1) * 0.005,
            gateCountModifier: 1 + (this.currentWave - 1) * 0.05
        };
    }

    /**
     * Complete the current level
     */
    completeLevel() {
        this.levelElapsedTime = Date.now() - this.levelStartTime;

        // Unlock next level
        const nextLevel = this.currentLevel + 1;
        this.unlockLevel(nextLevel);

        // Calculate level completion rewards
        const rewards = this.calculateLevelRewards();

        // Reset for next level
        this.wavesCompleted = 0;
        this.currentWave = 0;

        return {
            completed: true,
            level: this.currentLevel,
            time: this.levelElapsedTime,
            rewards: rewards
        };
    }

    /**
     * Fail the current level
     */
    failLevel() {
        this.levelElapsedTime = Date.now() - this.levelStartTime;
        return {
            failed: true,
            level: this.currentLevel,
            time: this.levelElapsedTime
        };
    }

    /**
     * Check if a level is unlocked
     */
    isLevelUnlocked(levelNumber) {
        return this.unlockedLevels.has(levelNumber);
    }

    /**
     * Unlock a level
     */
    unlockLevel(levelNumber) {
        if (levelNumber > 0) {
            this.unlockedLevels.add(levelNumber);
        }
    }

    /**
     * Calculate rewards for completing a level
     */
    calculateLevelRewards() {
        const levelData = this.getLevelData();
        const baseCoins = this.config.getConfig('progression', 'coinsPerUnit') || 1;
        const baseXP = this.config.getConfig('progression', 'xpPerUnit') || 2;
        const levelBonus = this.config.getConfig('progression', 'levelCompleteBonus') || 100;

        // Calculate based on performance
        const timeBonus = Math.max(0, 300 - this.levelElapsedTime / 1000); // Faster time = more bonus
        const difficultyBonus = (levelData.difficulty || 1) * 50;

        return {
            coins: Math.floor((baseCoins * 50) + timeBonus + difficultyBonus),
            xp: Math.floor((baseXP * 50) + timeBonus + difficultyBonus),
            bonusCoins: Math.floor(timeBonus),
            bonusXp: Math.floor(timeBonus),
            levelBonus: levelBonus
        };
    }

    /**
     * Get level completion rewards
     */
    getLevelCompletionRewards() {
        return this.calculateLevelRewards();
    }

    /**
     * Update level manager (called each frame)
     */
    update(deltaTime) {
        if (this.levelStartTime > 0) {
            this.levelElapsedTime += deltaTime * 1000; // Convert to milliseconds
        }
    }

    /**
     * Get level statistics for debugging
     */
    getStats() {
        return {
            currentLevel: this.currentLevel,
            currentWave: this.currentWave,
            wavesCompleted: this.wavesCompleted,
            totalWavesPerLevel: this.totalWavesPerLevel,
            levelGoal: this.getCurrentLevelGoal(),
            unlockedLevels: Array.from(this.unlockedLevels).sort((a, b) => a - b),
            levelData: this.getLevelData(),
            levelElapsedTime: this.levelElapsedTime
        };
    }

    /**
     * Reset level manager
     */
    reset() {
        this.currentLevel = 1;
        this.currentWave = 0;
        this.wavesCompleted = 0;
        this.levelStartTime = 0;
        this.levelElapsedTime = 0;
        this.unlockedLevels = new Set([1]);
        this.levelData = {};
        this.waveData = {};
    }

    /**
     * Dispose of level manager resources
     */
    dispose() {
        this.levelTemplates = {};
        this.unlockedLevels.clear();
        this.levelData = {};
        this.waveData = {};
    }
}