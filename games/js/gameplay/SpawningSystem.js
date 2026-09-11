/**
 * Spawning System - Handles spawning of player units and enemies
 * Implements burst, wave, and conditional spawning with object pooling
 */
export class SpawningSystem {
    constructor(config, entityManager) {
        this.config = config;
        this.entityManager = entityManager;

        // Spawning configuration
        this.spawnPoints = [];
        this.enemySpawnPoints = [];
        this.playerSpawnPoint = null;

        // Spawning timers and rates
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = this.config.getConfig('game', 'waveIntervalBase') || 5000;
        this.baseEnemySpawnRate = this.config.getConfig('levels', 'enemySpawnRateBase') || 0.02;
        this.enemySpawnRateIncrease = this.config.getConfig('levels', 'enemySpawnRateIncrease') || 0.001;

        // Wave system
        this.currentWave = 0;
        this.unitsInWave = 0;
        this.maxUnitsPerWave = 0;
        this.waveActive = false;
        this.waveTimer = 0;

        // Burst spawning
        this.burstQueue = [];

        // Special spawning
        this.specialSpawnChance = 0.05; // 5% chance for special units

        // Initialize spawn points
        this.initSpawnPoints();
    }

    /**
     * Initialize spawn points based on level configuration
     */
    initSpawnPoints() {
        const canvasWidth = this.config.getConfig('game', 'canvasWidth') || 800;
        const canvasHeight = this.config.getConfig('game', 'canvasHeight') || 600;

        // Player spawn point (bottom center)
        this.playerSpawnPoint = {
            x: canvasWidth / 2,
            y: canvasHeight * 0.85,
            radius: 20
        };

        // Enemy spawn points (top and sides)
        this.enemySpawnPoints = [
            // Top center
            { x: canvasWidth / 2, y: -50, radius: 30 },
            // Top left
            { x: -50, y: canvasHeight / 4, radius: 30 },
            // Top right
            { x: canvasWidth + 50, y: canvasHeight / 4, radius: 30 },
            // Left center
            { x: -50, y: canvasHeight / 2, radius: 30 },
            // Right center
            { x: canvasWidth + 50, y: canvasHeight / 2, radius: 30 }
        ];

        // General spawn points (for power-ups, etc.)
        this.spawnPoints = [
            { x: canvasWidth / 2, y: canvasHeight / 2, radius: 50 }, // Center
            { x: canvasWidth / 4, y: canvasHeight / 3, radius: 30 }, // Left
            { x: 3 * canvasWidth / 4, y: canvasHeight / 3, radius: 30 }, // Right
            { x: canvasWidth / 2, y: 2 * canvasHeight / 3, radius: 30 } // Bottom center
        ];
    }

    /**
     * Spawn initial player units (starting crowd)
     */
    spawnInitialUnits(count = null) {
        const spawnCount = count || this.config.getConfig('game', 'startingCrowd') || 15;
        const unitTypes = ['player', 'fast', 'shield']; // Mix of starting unit types

        for (let i = 0; i < spawnCount; i++) {
            // Vary unit types for starting crowd
            const typeIndex = i % unitTypes.length;
            const type = unitTypes[typeIndex];

            // Add some randomness to spawn position
            const spawnX = this.playerSpawnPoint.x + (Math.random() - 0.5) * 40;
            const spawnY = this.playerSpawnPoint.y + (Math.random() - 0.5) * 20;

            const unit = this.entityManager.createUnit(type, spawnX, spawnY);
            this.entityManager.addPlayerUnit(unit);
        }
    }

    /**
     * Spawn a wave of enemies
     */
    spawnEnemyWave(waveNumber, levelDifficulty = 1) {
        this.currentWave = waveNumber;
        this.waveActive = true;

        // Calculate wave properties based on difficulty and wave number
        const baseUnits = 5 + Math.floor(waveNumber * 0.5);
        const difficultyMultiplier = 1 + (levelDifficulty - 1) * 0.3;
        this.maxUnitsPerWave = Math.floor(baseUnits * difficultyMultiplier);
        this.unitsInWave = 0;

        // Adjust spawn rate based on wave and difficulty
        const waveIntervalReduction = Math.min(
            this.config.getConfig('levels', 'waveIntervalReductionPerLevel') || 100,
            waveNumber * 10
        );
        this.enemySpawnInterval = Math.max(
            this.config.getConfig('game', 'minWaveInterval') || 1500,
            this.config.getConfig('game', 'waveIntervalBase') || 5000 - waveIntervalReduction
        );

        // Start spawning
        this.lastEnemySpawn = Date.now();
    }

    /**
     * Update spawning system (called each frame)
     */
    update(deltaTime) {
        const now = Date.now();

        // Update wave spawning
        if (this.waveActive) {
            // Check if it's time to spawn next enemy
            const timeSinceLastSpawn = now - this.lastEnemySpawn;
            const adjustedSpawnRate = this.getAdjustedSpawnRate();

            if (timeSinceLastSpawn > (1000 / adjustedSpawnRate) && this.unitsInWave < this.maxUnitsPerWave) {
                this.spawnEnemy();
                this.lastEnemySpawn = now;
                this.unitsInWave++;
            }

            // Check if wave is complete
            if (this.unitsInWave >= this.maxUnitsPerWave) {
                // Wait a bit before declaring wave complete to allow last enemies to spawn
                if (timeSinceLastSpawn > 2000) { // 2 seconds after last spawn
                    this.waveActive = false;
                }
            }
        }

        // Process burst queue
        this.processBurstQueue(deltaTime);

        // Update special spawning timers
    }

    /**
     * Get adjusted spawn rate based on level and wave difficulty
     */
    getAdjustedSpawnRate() {
        let rate = this.baseEnemySpawnRate;

        // Increase rate based on current wave
        rate += this.currentWave * this.enemySpawnRateIncrease;

        // Apply level difficulty multiplier
        const levelDifficulty = 1; // Would come from level manager
        rate *= levelDifficulty;

        // Cap maximum spawn rate
        const maxRate = this.config.getConfig('game', 'maxEnemySpawnRate') || 0.1;
        return Math.min(rate, maxRate);
    }

    /**
     * Spawn a single enemy
     */
    spawnEnemy() {
        // Choose spawn point
        const spawnPoint = this.enemySpawnPoints[Math.floor(Math.random() * this.enemySpawnPoints.length)];

        // Add randomness to spawn position
        const spawnX = spawnPoint.x + (Math.random() - 0.5) * spawnPoint.radius * 2;
        const spawnY = spawnPoint.y + (Math.random() - 0.5) * spawnPoint.radius * 2;

        // Determine enemy type based on wave and chance
        const enemyType = this.determineEnemyType();

        // Create enemy
        const enemy = this.entityManager.createEnemy(enemyType, spawnX, spawnY);
        this.entityManager.addEnemyUnit(enemy);

        return enemy;
    }

    /**
     * Determine enemy type based on wave number and random chance
     */
    determineEnemyType() {
        const wave = this.currentWave;
        const rand = Math.random();

        // Early waves: mostly basic enemies
        if (wave < 3) {
            if (rand < 0.8) return 'basic';
            if (rand < 0.95) return 'fast';
            return 'shield';
        }
        // Mid waves: introduce heavies and specials
        else if (wave < 8) {
            if (rand < 0.5) return 'basic';
            if (rand < 0.7) return 'fast';
            if (rand < 0.85) return 'shield';
            if (rand < 0.95) return 'heavy';
            return 'fastEnemy'; // Special fast enemy
        }
        // Later waves: more challenging mix
        else {
            if (rand < 0.3) return 'basic';
            if (rand < 0.5) return 'fast';
            if (rand < 0.65) return 'shield';
            if (rand < 0.8) return 'heavy';
            if (rand < 0.9) return 'fastEnemy';
            if (rand < 0.95) return 'ranged';
            return 'heavy'; // Bonus heavy
        }
    }

    /**
     * Spawn a burst of units (for power-ups or special effects)
     */
    spawnBurst(count, type = 'player', x = null, y = null) {
        for (let i = 0; i < count; i++) {
            const spawnX = x !== null ? x : (this.playerSpawnPoint ? this.playerSpawnPoint.x : 400) + (Math.random() - 0.5) * 100;
            const spawnY = y !== null ? y : (this.playerSpawnPoint ? this.playerSpawnPoint.y : 300) + (Math.random() - 0.5) * 100;

            const unit = this.entityManager.createUnit(type, spawnX, spawnY);
            if (type.startsWith('enemy') || type.includes('Enemy')) {
                this.entityManager.addEnemyUnit(unit);
            } else {
                this.entityManager.addPlayerUnit(unit);
            }
        }
    }

    /**
     * Spawn special units (power-ups, bosses, etc.)
     */
    spawnSpecialUnit(x = null, y = null) {
        if (Math.random() > this.specialSpawnChance) return null;

        const specialTypes = ['heavy', 'shield', 'fastEnemy', 'ranged'];
        const type = specialTypes[Math.floor(Math.random() * specialTypes.length)];

        const spawnX = x !== null ? x : (this.playerSpawnPoint ? this.playerSpawnPoint.x : 400) + (Math.random() - 0.5) * 200;
        const spawnY = y !== null ? y : (this.playerSpawnPoint ? this.playerSpawnPoint.y : 300) + (Math.random() - 0.5) * 200;

        const unit = this.entityManager.createUnit(type, spawnX, spawnY);
        if (type.startsWith('enemy') || type.includes('Enemy')) {
            this.entityManager.addEnemyUnit(unit);
        } else {
            this.entityManager.addPlayerUnit(unit);
        }

        return unit;
    }

    /**
     * Add to burst queue (for delayed spawning)
     */
    addToBurstQueue(count, type, delay = 0, x = null, y = null) {
        this.burstQueue.push({
            count: count,
            type: type,
            delay: delay,
            timer: delay,
            x: x,
            y: y,
            timestamp: Date.now()
        });
    }

    /**
     * Process burst queue
     */
    processBurstQueue(deltaTime) {
        for (let i = this.burstQueue.length - 1; i >= 0; i--) {
            const burst = this.burstQueue[i];
            if (!burst) continue;

            burst.timer -= deltaTime * 1000;
            if (burst.timer <= 0) {
                this.spawnBurst(burst.count, burst.type, null, burst.x, burst.y);
                this.burstQueue.splice(i, 1);
            }
        }
    }

    /**
     * Get current wave information
     */
    getCurrentWave() {
        return this.currentWave;
    }

    /**
     * Check if wave is active
     */
    isWaveActive() {
        return this.waveActive;
    }

    /**
     * Get units spawned in current wave
     */
    getUnitsInWave() {
        return this.unitsInWave;
    }

    /**
     * Get maximum units for current wave
     */
    getMaxUnitsPerWave() {
        return this.maxUnitsPerWave;
    }

    /**
     * Reset spawning system (for new level)
     */
    reset() {
        this.waveActive = false;
        this.waveTimer = 0;
        this.currentWave = 0;
        this.unitsInWave = 0;
        this.maxUnitsPerWave = 0;
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = this.config.getConfig('game', 'waveIntervalBase') || 5000;
        this.burstQueue = [];
    }

    /**
     * Clear all spawned entities
     */
    clearAll() {
        this.reset();
        // Note: Actual entity clearing is handled by EntityManager
    }

    /**
     * Get spawning statistics for debugging
     */
    getStats() {
        return {
            currentWave: this.currentWave,
            waveActive: this.waveActive,
            unitsInWave: this.unitsInWave,
            maxUnitsPerWave: this.maxUnitsPerWave,
            enemySpawnInterval: this.enemySpawnInterval,
            burstQueueLength: this.burstQueue.length,
            lastSpawn: Date.now() - this.lastEnemySpawn
        };
    }

    /**
     * Dispose of spawning system resources
     */
    dispose() {
        this.spawnPoints = [];
        this.enemySpawnPoints = [];
        this.playerSpawnPoint = null;
        this.burstQueue = [];
    }
}