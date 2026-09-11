/**
 * Configuration Manager - Handles all game configuration
 * Centralized configuration for easy tuning and balancing
 */

export class ConfigManager {
    constructor() {
        this.configs = {};
        this.loadDefaultConfigs();
        // Load external JSON configs (now JS modules)
        this.configs.gameConfig = gameConfig;
        this.configs.enemyTypes = enemyTypes;
        this.configs.weaponRoster = weaponRoster;
    }

    loadDefaultConfigs() {
        // Game configuration
        this.configs.game = {
            targetFPS: 60,
            maxUnits: 1000,
            unitRadius: 12,
            enemyUnitRadius: 12,
            gateSize: 60,
            cannonPositionY: 0.85, // Percentage of screen height
            cannonFireDelay: 250, // ms
            maxCrowdSize: 500,
            startingCrowd: 15,
            levelGoalMultiplier: 10, // goal = startingCrowd * level * multiplier
            waveIntervalBase: 5000, // ms between waves
            waveIntervalReductionPerLevel: 100, // ms reduction per level
            minWaveInterval: 1500, // minimum ms between waves
        };

        // Physics configuration
        this.configs.physics = {
            gravity: 0, // No gravity in this top-down game
            friction: 0.98,
            separationForce: 0.5,
            collisionDistance: 25,
            maxSpeed: 300, // pixels per second
            acceleration: 800, // pixels per second^2
            pushForce: 150,
            knockbackForce: 200,
        };

        // Unit configurations
        this.configs.units = {
            player: {
                health: 1,
                speed: 120,
                damage: 0,
                scoreValue: 10,
                color: '#4a90e2',
                radius: 12
            },
            fast: {
                health: 1,
                speed: 180,
                damage: 0,
                scoreValue: 15,
                color: '#00ffff',
                radius: 10
            },
            heavy: {
                health: 3,
                speed: 80,
                damage: 0,
                scoreValue: 25,
                color: '#ff6b6b',
                radius: 16
            },
            shield: {
                health: 2,
                speed: 100,
                damage: 0,
                scoreValue: 20,
                color: '#ffffff',
                radius: 14,
                shield: true
            },
            ranged: {
                health: 1,
                speed: 100,
                damage: 1,
                scoreValue: 15,
                color: '#ffd700',
                radius: 12,
                range: 150,
                fireRate: 1000
            }
        };

        // Enemy unit configurations
        this.configs.enemyUnits = {
            basic: {
                health: 1,
                speed: 100,
                damage: 1,
                scoreValue: 10,
                color: '#ff4444',
                radius: 12
            },
            fast: {
                health: 1,
                speed: 150,
                damage: 1,
                scoreValue: 15,
                color: '#ff44ff',
                radius: 10
            },
            heavy: {
                health: 3,
                speed: 70,
                damage: 2,
                scoreValue: 25,
                color: '#ff8844',
                radius: 16
            },
            shield: {
                health: 2,
                speed: 90,
                damage: 1,
                scoreValue: 20,
                color: '#4444ff',
                radius: 14,
                shield: true
            },
            fastEnemy: {
                health: 1,
                speed: 200,
                damage: 1,
                scoreValue: 20,
                color: '#ffff44',
                radius: 8
            }
        };

        // Gate configurations
        this.configs.gates = {
            add: { value: 5, color: '#00ff88', symbol: '+' },
            mult: { value: 2, color: '#00ffff', symbol: '×' },
            sub: { value: 3, color: '#ff6b6b', symbol: '-' },
            speed: { value: 1.5, color: '#ffd700', symbol: '⚡' }, // Speed multiplier
            split: { value: 2, color: '#ff00ff', symbol: '↕' }, // Splits crowd
            magnet: { value: 100, color: '#8a2be2', symbol: '🧲' }, // Attraction radius
            shield: { value: 5, color: '#ffffff', symbol: '🛡️' }, // Temporary shield
            random: { value: 0, color: '#ff8c00', symbol: '?' }, // Random effect
            risk_reward: { value: 0, color: '#8b0000', symbol: '⚠️' } // High risk/reward
        };

        // Weapon configurations
        this.configs.weapons = {
            pulseCannon: {
                damage: 25,
                cooldown: 800,
                range: 300,
                area: 20,
                energyCost: 10,
                color: '#ff6b6b',
                particles: 5
            },
            gravityBurst: {
                damage: 15,
                cooldown: 1200,
                range: 200,
                area: 80,
                energyCost: 15,
                color: '#9370db',
                particles: 8
            },
            plasmaArc: {
                damage: 20,
                cooldown: 1000,
                range: 250,
                area: 15,
                energyCost: 12,
                color: '#00ffff',
                particles: 3
            },
            shockwave: {
                damage: 10,
                cooldown: 1500,
                range: 100,
                area: 100,
                energyCost: 20,
                color: '#ffa500',
                particles: 12
            }
        };

        // Level configurations
        this.configs.levels = {
            startingLevel: 1,
            levelsPerWorld: 10,
            worldDifficultyMultiplier: 1.5,
            gatesPerLevel: { min: 4, max: 8 },
            enemySpawnRateBase: 0.02, // per frame chance
            enemySpawnRateIncrease: 0.001, // per level increase
        };

        // Progression configuration
        this.configs.progression = {
            coinsPerUnit: 1,
            coinsPerEnemy: 5,
            levelCompleteBonus: 100,
            upgradeCostMultiplier: 1.5,
            xpPerUnit: 2,
            xpPerEnemy: 10,
            xpPerLevel: 50,
            levelsPerUpgrade: 3
        };

        // UI configuration
        this.configs.ui = {
            hideInstructionsDelay: 5000,
            messageDuration: 2000,
            gatePulseDuration: 2000,
            crowdColorThresholds: [
                { threshold: 0.8, color: '#00ff00' },
                { threshold: 0.5, color: '#ffff00' },
                { threshold: 0.2, color: '#ff8800' },
                { threshold: 0.0, color: '#ff0000' }
            ]
        };

        // Audio configuration (placeholders for Session 2)
        this.configs.audio = {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5,
            enabled: true
        };
    }

    getConfig(category, key = null) {
        if (key === null) {
            return this.configs[category] || {};
        }
        return this.configs[category] && this.configs[category][key] !== undefined
            ? this.configs[category][key]
            : null;
    }

    setConfig(category, key, value) {
        if (!this.configs[category]) {
            this.configs[category] = {};
        }
        this.configs[category][key] = value;
    }

    getAllConfigs() {
        return JSON.parse(JSON.stringify(this.configs)); // Deep copy
    }
}