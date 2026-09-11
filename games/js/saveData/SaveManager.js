/**
 * Save Manager - Handles saving and loading game progress
 * Supports localStorage with fallback and versioned save data
 */
export class SaveManager {
    constructor(config) {
        this.config = config;

        // Save configuration
        this.saveKey = 'crowdCommandSave';
        this.version = '1.0';
        this.autoSaveInterval = 30000; // 30 seconds
        this.lastAutoSave = 0;

        // Save data structure
        this.saveData = {
            version: this.version,
            timestamp: 0,
            progress: {
                currentLevel: 1,
                unlockedLevels: [1],
                completedLevels: [],
                highestLevelCompleted: 0
            },
            currency: {
                coins: 0,
                totalCoinsEarned: 0
            },
            progression: {
                xp: 0,
                level: 1,
                skillPoints: 0,
                upgrades: {}
            },
            settings: {
                musicVolume: 0.7,
                sfxVolume: 0.8,
                masterVolume: 0.7,
                vibrationEnabled: true,
                showTutorial: true
            },
            statistics: {
                totalPlaytime: 0,
                totalEnemiesDefeated: 0,
                totalUnitsLost: 0,
                totalShotsFired: 0,
                accuracy: 0,
                bestStreak: 0,
                favoriteWeapon: 'pulseCannon'
            }
        };

        // Check if localStorage is available
        this.storageAvailable = this.checkStorageAvailability();

        // Load saved data
        this.load();
    }

    /**
     * Check if localStorage is available
     */
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Save game progress
     */
    save() {
        if (!this.storageAvailable) {
            console.warn('Storage not available, cannot save game');
            return false;
        }

        try {
            // Update timestamp
            this.saveData.timestamp = Date.now();

            // Update playtime (approximate)
            if (this.saveData.timestamp > 0) {
                const lastTimestamp = this.saveData.timestamp || this.saveData.timestamp;
                const sessionLength = Date.now() - lastTimestamp;
                this.saveData.statistics.totalPlaytime += sessionLength;
            }

            // Save to localStorage
            localStorage.setItem(this.saveKey, JSON.stringify(this.saveData));
            this.lastAutoSave = Date.now();

            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load game progress
     */
    load() {
        if (!this.storageAvailable) {
            console.warn('Storage not available, starting fresh game');
            return this.getDefaultSaveData();
        }

        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);

                // Check version compatibility
                if (this.isVersionCompatible(parsedData.version)) {
                    this.saveData = this.migrateSaveData(parsedData);
                    return true;
                } else {
                    console.warn('Save data version incompatible, starting fresh');
                    // Keep defaults but maybe migrate some data
                    this.saveData = this.migrateSaveData(parsedData);
                    return true;
                }
            } else {
                console.log('No save data found, starting fresh game');
                return this.getDefaultSaveData();
            }
        } catch (error) {
            console.error('Failed to load game save:', error);
            // Return default data on corruption
            this.saveData = this.getDefaultSaveData();
            return false;
        }
    }

    loadProgress() {
        return this.load();
    }

    saveProgress() {
        return this.save();
    }

    /**
     * Check if save data version is compatible
     */
    isVersionCompatible(saveVersion) {
        // Simple version check - in practice, use semver
        return saveVersion === this.version ||
               (saveVersion.startsWith('1.') && this.version.startsWith('1.'));
    }

    /**
     * Migrate save data from older versions
     */
    migrateSaveData(oldData) {
        // Start with current structure
        const migrated = { ...this.getDefaultSaveData() };

        // Copy over compatible data
        if (oldData.progress) {
            migrated.progress = { ...migrated.progress, ...oldData.progress };
        }
        if (oldData.currency) {
            migrated.currency = { ...migrated.currency, ...oldData.currency };
        }
        if (oldData.progression) {
            migrated.progression = { ...migrated.progression, ...oldData.progression };
        }
        if (oldData.settings) {
            migrated.settings = { ...migrated.settings, ...oldData.settings };
        }
        if (oldData.statistics) {
            migrated.statistics = { ...migrated.statistics, ...oldData.statistics };
        }

        // Ensure version is current
        migrated.version = this.version;
        migrated.timestamp = Date.now();

        return migrated;
    }

    /**
     * Get default save data structure
     */
    getDefaultSaveData() {
        return {
            version: this.version,
            timestamp: Date.now(),
            progress: {
                currentLevel: 1,
                unlockedLevels: [1],
                completedLevels: [],
                highestLevelCompleted: 0
            },
            currency: {
                coins: 0,
                totalCoinsEarned: 0
            },
            progression: {
                xp: 0,
                level: 1,
                skillPoints: 0,
                upgrades: {}
            },
            settings: {
                musicVolume: 0.7,
                sfxVolume: 0.8,
                masterVolume: 0.7,
                vibrationEnabled: true,
                showTutorial: true
            },
            statistics: {
                totalPlaytime: 0,
                totalEnemiesDefeated: 0,
                totalUnitsLost: 0,
                totalShotsFired: 0,
                accuracy: 0,
                bestStreak: 0,
                favoriteWeapon: 'pulseCannon'
            }
        };
    }

    /**
     * Update progress data
     */
    updateProgress(updates) {
        this.saveData.progress = { ...this.saveData.progress, ...updates };
    }

    /**
     * Update currency data
     */
    updateCurrency(updates) {
        this.saveData.currency = { ...this.saveData.currency, ...updates };

        // Track total coins earned
        if (updates.coins !== undefined && updates.coins > this.saveData.currency.coins) {
            const coinsEarned = updates.coins - this.saveData.currency.coins;
            this.saveData.currency.totalCoinsEarned += coinsEarned;
        }
    }

    /**
     * Update progression data
     */
    updateProgression(updates) {
        this.saveData.progression = { ...this.saveData.progression, ...updates };
    }

    /**
     * Update settings data
     */
    updateSettings(updates) {
        this.saveData.settings = { ...this.saveData.settings, ...updates };
    }

    /**
     * Update statistics data
     */
    updateStatistics(updates) {
        this.saveData.statistics = { ...this.saveData.statistics, ...updates };
    }

    /**
     * Get current save data (copy)
     */
    getSaveData() {
        return JSON.parse(JSON.stringify(this.saveData)); // Deep copy
    }

    /**
     * Get specific save data section
     */
    getSection(section) {
        return this.saveData[section] || null;
    }

    /**
     * Reset save data (for testing or new game)
     */
    reset() {
        this.saveData = this.getDefaultSaveData();
        this.save(); // Immediately save the reset data
    }

    /**
     * Auto-save check (call each frame or second)
     */
    autoSaveCheck() {
        const now = Date.now();
        if (now - this.lastAutoSave > this.autoSaveInterval) {
            this.save();
        }
    }

    /**
     * Get save statistics for debugging
     */
    getStats() {
        return {
            storageAvailable: this.storageAvailable,
            saveKey: this.saveKey,
            version: this.version,
            lastSave: this.lastAutoSave,
            hasSaveData: !!localStorage.getItem(this.saveKey),
            saveDataSize: localStorage.getItem(this.saveKey)?.length || 0
        };
    }

    /**
     * Dispose of save manager resources
     */
    dispose() {
        // Note: We don't clear localStorage on dispose as that would lose player data
        // The save data persists until explicitly cleared
    }
}