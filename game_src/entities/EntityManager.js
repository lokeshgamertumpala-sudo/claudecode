/**
 * Entity Manager - Manages all game entities (units, enemies, projectiles, effects)
 */
export class EntityManager {
    constructor(configManager, physicsEngine) {
        this.config = configManager;
        this.physicsEngine = physicsEngine;

        // Entity pools for efficient memory usage
        this.units = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];

        // Entity counters for IDs
        this.nextUnitId = 1;
        this.nextEnemyId = 1;
        this.nextProjectileId = 1;
        this.nextEffectId = 1;

        // Canvas dimensions (set by game)
        this.canvasWidth = 800;
        this.canvasHeight = 600;

        // Count for spawned entities
        this.totalEntities = 0;

        // Connections to other systems
        this.weaponSystem = null;
        this.gateSystem = null;
        this.spawningSystem = null;

        // Reference to renderer for creating advanced effects (set by Game)
        this.renderer = null;
    }

    /**
     * Set linked systems for interactions
     */
    setSystems(systems) {
        this.weaponSystem = systems.weaponSystem || null;
        this.gateSystem = systems.gateSystem || null;
        this.spawningSystem = systems.spawningSystem || null;
    }

    /**
     * Set reference to renderer for creating advanced effects
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }

    /**
     * Update all entities
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update units
        for (const unit of this.units.filter(u => u.active)) {
            unit.update(deltaTime);
        }

        // Update enemies
        for (const enemy of this.enemies.filter(e => e.active)) {
            enemy.update(deltaTime);
        }

        // Update projectiles
        for (const projectile of this.projectiles.filter(p => p.active)) {
            projectile.x += projectile.vx * deltaTime;
            projectile.y += projectile.vy * deltaTime;

            // Update lifetime
            if (projectile.lifetime !== undefined) {
                projectile.lifetime -= deltaTime * 1000;
                if (projectile.lifetime <= 0) {
                    projectile.active = false;
                }
            }

            // Check bounds (off screen = dead)
            if (projectile.x < -30 || projectile.x > this.canvasWidth + 30 ||
                projectile.y < -30 || projectile.y > this.canvasHeight + 30) {
                projectile.active = false;
            }

            // Check gate collisions
            if (this.gateSystem) {
                const gate = this.gateSystem.checkGateHit(projectile.x, projectile.y);
                if (gate) {
                    // Gate hit - apply effect and destroy projectile
                    projectile.active = false;

                    // Notify gate system and/or player
                    if (gate.type === 'add') {
                        // Would add to player crowd
                    }

                    // Add hit effect
                    this.addEffect({
                        type: 'impact',
                        x: gate.x + gate.width/2,
                        y: gate.y + gate.height/2,
                        size: 20,
                        active: true
                    });

                    break;
                }
            }

            // Check enemy collisions
            for (const enemy of this.enemies.filter(e => e.active)) {
                if (this.checkEntityCollision(projectile, enemy)) {
                    // Projectile hits enemy
                    if (enemy.takeDamage(projectile.damage || 10) || enemy.isShielded) {
                        projectile.active = false;

                        // Add hit effect
                        this.addEffect({
                            type: 'impact',
                            x: enemy.x,
                            y: enemy.y,
                            size: 15,
                            color: '#ff6b6b',
                            active: true
                        });
                    }
                    break;
                }
            }
        }

        // Update effects
        for (const effect of this.effects.filter(e => e.active)) {
            if (effect.lifetime !== undefined) {
                effect.lifetime -= deltaTime * 1000;
                if (effect.lifetime <= 0) {
                    effect.active = false;
                }
            }
        }

        // Clean up dead entities
        this.cleanup();
    }

    /**
     * Check collision between two entities
     */
    checkEntityCollision(entityA, entityB) {
        const dx = entityA.x - entityB.x;
        const dy = entityA.y - entityB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = (entityA.radius || 10) + (entityB.radius || 10);
        return distance < minDist;
    }

    /**
     * Clean up inactive entities
     */
    cleanup() {
        this.units = this.units.filter(u => u.active);
        this.enemies = this.enemies.filter(e => e.active);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.effects = this.effects.filter(e => e.active);
    }

    /**
     * Create a player unit
     */
    createUnit(type = 'player', x = null, y = null) {
        // Spawn near cannon at bottom of screen
        const startX = x !== null ? x : this.canvasWidth / 2;
        const startY = y !== null ? y : this.canvasHeight * 0.85;

        const unitConfig = this.config.getConfig('units', type) || this.config.getConfig('units', 'player');
        const unit = {
            id: this.nextUnitId++,
            type: type,
            x: startX,
            y: startY,
            vx: 0,
            vy: 0,
            radius: unitConfig.radius || 12,
            color: unitConfig.color || '#4a90e2',
            active: true,
            health: unitConfig.health || 1,
            maxHealth: unitConfig.health || 1,
            speed: unitConfig.speed || 120,
            isShielded: false,
            shieldTimer: 0,
            flashTimer: 0,
            rotation: 0,
            isMoving: false,
            targetX: null,
            targetY: null,

            update: function(dt) {
                if (!this.active) return;
                // Update flash timer
                if (this.flashTimer > 0) {
                    this.flashTimer -= dt * 1000;
                }

                // Update shield timer
                if (this.shieldTimer > 0) {
                    this.shieldTimer -= dt * 1000;
                    if (this.shieldTimer <= 0) {
                        this.shieldTimer = 0;
                        this.isShielded = false;
                    }
                }

                // Basic movement - will be overridden by input/AI
                if (this.isMoving && this.targetX !== undefined && this.targetY !== undefined) {
                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 1) {
                        this.vx = (dx / dist) * this.speed;
                        this.vy = (dy / dist) * this.speed;
                        this.x += this.vx * dt;
                        this.y += this.vy * dt;
                    } else {
                        this.vx = 0;
                        this.vy = 0;
                        this.isMoving = false;
                    }
                } else {
                    // Default wandering behavior
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                    // Keep in bounds
                    this.x = Math.max(this.radius, Math.min(this.canvasWidth - this.radius, this.x));
                    this.y = Math.max(this.radius, Math.min(this.canvasHeight - this.radius, this.y));
                }

                // Optional: slight rotation based on velocity for visual effect
                if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                    this.rotation = Math.atan2(this.vy, this.vx);
                } else {
                    // Slowly rotate back to 0
                    if (this.rotation > 0) this.rotation -= dt * 2;
                    if (this.rotation < 0) this.rotation += dt * 2;
                }
            },

            moveTo: function(x, y) {
                this.targetX = x;
                this.targetY = y;
                this.isMoving = true;
            },

            stop: function() {
                this.isMoving = false;
                this.targetX = undefined;
                this.targetY = undefined;
                this.vx = 0;
                this.vy = 0;
            },

            takeDamage: function(amount) {
                if (this.isShielded) {
                    // Shield absorbs damage
                    this.flashTimer = 300; // Flash white for 0.3 seconds
                    // Create shield hit particles
                    if (this.renderer) {
                        this.renderer.addParticleEffect(
                            this.x + (Math.random() - 0.5) * this.radius,
                            this.y + (Math.random() - 0.5) * this.radius,
                            '#00ffff',
                            2 + Math.random() * 2,
                            200 + Math.random() * 200,
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2
                        );
                    }
                    return false;
                }
                this.health -= amount;
                if (this.health <= 0) {
                    this.active = false;
                }
                // Flash when taking damage
                this.flashTimer = 300;

                // Create damage particles
                if (this.renderer) {
                    this.renderer.addParticleEffect(
                        this.x + (Math.random() - 0.5) * this.radius,
                        this.y + (Math.random() - 0.5) * this.radius,
                        '#ff6b6b',
                        3 + Math.random() * 2,
                        300 + Math.random() * 300,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3
                    );
                }

                return true;
            },

            activateShield: function(duration = 2000) {
                this.isShielded = true;
                this.shieldTimer = duration;
                this.flashTimer = 100; // Brief flash when shield activates

                // Create shield activate particles
                if (this.renderer) {
                    this.renderer.addParticleEffect(
                        this.x,
                        this.y,
                        '#00ffff',
                        5,
                        400,
                        0,
                        -2
                    );
                }
            },

            isAlive: function() {
                return this.health > 0 && this.active;
            },

            getRenderData: function() {
                return {
                    x: this.x,
                    y: this.y,
                    radius: this.radius,
                    color: this.color,
                    isShielded: this.isShielded,
                    health: this.health,
                    maxHealth: this.maxHealth,
                    animationFrame: Date.now() * 0.1 // Simple animation
                };
            },

            clone: function() {
                const clone = {
                    ...this,
                    id: this.nextUnitId++,
                    x: this.x,
                    y: this.y,
                    vx: this.vx,
                    vy: this.vy
                };
                return clone;
            }
        };

        this.units.push(unit);
        this.totalEntities++;
        return unit;
    }

    /**
     * Create an enemy
     */
    createEnemy(type = 'basic', x = null, y = null) {
        // Spawn at top of screen
        const startX = x !== null ? x : Math.random() * this.canvasWidth;
        const startY = y !== null ? y : -50;

        const enemyConfigs = this.config.getConfig('enemyUnits');
        const typeConfig = enemyConfigs[type] || enemyConfigs.basic;
        const enemy = {
            id: this.nextEnemyId++,
            type: `enemy_${type}`,
            x: startX,
            y: startY,
            vx: 0,
            vy: 0,
            radius: typeConfig.radius || 12,
            color: typeConfig.color || '#ff4444',
            active: true,
            health: typeConfig.health || 1,
            maxHealth: typeConfig.health || 1,
            speed: typeConfig.speed || 100,
            damage: typeConfig.damage || 1,
            scoreValue: typeConfig.scoreValue || 10,
            isShielded: typeConfig.shield || false,
            shieldTimer: 0,
            flashTimer: 0,
            rotation: 0,
            isRanged: typeConfig.range !== undefined,
            range: typeConfig.range || 0,
            fireRate: typeConfig.fireRate || 1000,
            lastFireTime: 0,

            update: function(dt) {
                if (!this.active) return;

                // Update flash timer
                if (this.flashTimer > 0) {
                    this.flashTimer -= dt * 1000;
                }

                // Update shield timer
                if (this.shieldTimer > 0) {
                    this.shieldTimer -= dt * 1000;
                    if (this.shieldTimer <= 0) {
                        this.shieldTimer = 0;
                        this.isShielded = false;
                    }
                }

                // Simple AI: move toward player
                const targetX = this.canvasWidth / 2;
                const targetY = this.canvasHeight * 0.85;
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 5) {
                    this.vx = (dx / dist) * this.speed;
                    this.vy = (dy / dist) * this.speed;
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                } else {
                    // Wandering around target
                    const angle = Date.now() * 0.001 + this.x * 0.1;
                    this.vx = Math.cos(angle) * 20;
                    this.vy = Math.sin(angle) * 20;
                    this.x += this.vx * dt;
                    this.y += this.vy * dt;
                }

                // Update fire timer for ranged enemies
                if (this.isRanged && this.lastFireTime > 0) {
                    this.lastFireTime -= dt * 1000;
                }

                // Optional: rotation based on velocity
                if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                    this.rotation = Math.atan2(this.vy, this.vx);
                } else {
                    // Slowly rotate back to 0
                    if (this.rotation > 0) this.rotation -= dt * 2;
                    if (this.rotation < 0) this.rotation += dt * 2;
                }
            },

            canFire: function() {
                return this.isRanged && this.lastFireTime <= 0;
            },

            fire: function() {
                if (this.canFire()) {
                    this.lastFireTime = this.fireRate;
                    // Would create projectile in real implementation
                    return true;
                }
                return false;
            },

            takeDamage: function(amount) {
                if (this.isShielded) {
                    // Shield absorbs damage
                    this.flashTimer = 300; // Flash white for 0.3 seconds
                    // Create shield hit particles
                    if (this.renderer) {
                        this.renderer.addParticleEffect(
                            this.x + (Math.random() - 0.5) * this.radius,
                            this.y + (Math.random() - 0.5) * this.radius,
                            '#00ffff',
                            2 + Math.random() * 2,
                            200 + Math.random() * 200,
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2
                        );
                    }
                    return false;
                }
                this.health -= amount;
                if (this.health <= 0) {
                    this.active = false;

                    // Create death particles
                    if (this.renderer) {
                        // Blood splatter
                        for (let i = 0; i < 8; i++) {
                            const angle = (i / 8) * Math.PI * 2;
                            const speed = 2 + Math.random() * 3;
                            this.renderer.addParticleEffect(
                                this.x + Math.cos(angle) * this.radius,
                                this.y + Math.sin(angle) * this.radius,
                                '#ff0000',
                                2 + Math.random() * 2,
                                400 + Math.random() * 200,
                                Math.cos(angle) * speed,
                                Math.sin(angle) * speed
                            );
                        }

                        // Gore chunks
                        for (let i = 0; i < 3; i++) {
                            const angle = (i / 3) * Math.PI * 2;
                            const speed = 1 + Math.random() * 2;
                            this.renderer.addParticleEffect(
                                this.x + Math.cos(angle) * this.radius * 0.5,
                                this.y + Math.sin(angle) * this.radius * 0.5,
                                '#8b0000',
                                3 + Math.random() * 2,
                                500 + Math.random() * 300,
                                Math.cos(angle) * speed,
                                Math.sin(angle) * speed
                            );
                        }
                    }
                } else {
                    // Flash when taking damage
                    this.flashTimer = 300;
                }
                return true;
            },

            activateShield: function(duration = 2000) {
                this.isShielded = true;
                this.shieldTimer = duration;
                this.flashTimer = 100; // Brief flash when shield activates

                // Create shield activate particles
                if (this.renderer) {
                    this.renderer.addParticleEffect(
                        this.x,
                        this.y,
                        '#00ffff',
                        5,
                        400,
                        0,
                        -2
                    );
                }
            },

            isAlive: function() {
                return (this.health > 0 || this.isShielded) && this.active;
            },

            getRenderData: function() {
                return {
                    x: this.x,
                    y: this.y,
                    radius: this.radius,
                    color: this.color,
                    isShielded: this.isShielded,
                    health: this.health,
                    maxHealth: this.maxHealth,
                    type: this.type,
                    isRanged: this.isRanged,
                    animationFrame: Date.now() * 0.1 // Simple animation
                };
            },

            clone: function() {
                const clone = {
                    ...this,
                    id: this.nextEnemyId++,
                    x: this.x,
                    y: this.y,
                    vx: this.vx,
                    vy: this.vy
                };
                return clone;
            }
        };

        this.enemies.push(enemy);
        this.totalEntities++;
        return enemy;
    }

    /**
     * Create a projectile
     */
    createProjectile(projectileData) {
        const radius = projectileData.radius || 5;
        const projectile = {
            id: this.nextProjectileId++,
            type: projectileData.type || 'bullet',
            x: projectileData.x,
            y: projectileData.y,
            vx: projectileData.vx || 0,
            vy: projectileData.vy || 0,
            radius: radius,
            width: radius * 2, // For drawing
            color: projectileData.color || '#ffd700',
            damage: projectileData.damage || 10,
            lifetime: projectileData.lifetime || 1000,
            active: true,
            glow: projectileData.glow || 6 // For projectile glow effect
        };

        this.projectiles.push(projectile);
        this.totalEntities++;
        return projectile;
    }

    /**
     * Add a visual effect
     */
    addEffect(effectData) {
        const effect = {
            id: this.nextEffectId++,
            type: effectData.type || 'generic',
            x: effectData.x,
            y: effectData.y,
            size: effectData.size || 10,
            color: effectData.color || '#ffffff',
            lifetime: effectData.lifetime || 500,
            active: true,
            vx: effectData.vx || 0,
            vy: effectData.vy || 0,
            alpha: effectData.alpha || 1
        };

        this.effects.push(effect);
        return effect;
    }

    /**
     * Get all active entities in the format expected by renderer
     */
    getAllEntities() {
        return {
            playerUnits: this.units.filter(u => u.active),
            enemyUnits: this.enemies.filter(e => e.active),
            projectiles: this.projectiles.filter(p => p.active)
        };
    }

    /**
     * Get player units count
     */
    getPlayerUnitCount() {
        return this.units.filter(u => u.active).length;
    }

    /**
     * Get enemy count
     */
    getEnemyCount() {
        return this.enemies.filter(e => e.active).length;
    }

    /**
     * Get projectile count
     */
    getProjectileCount() {
        return this.projectiles.filter(p => p.active).length;
    }

    /**
     * Get total entity count
     */
    getEntityCount() {
        return this.units.length + this.enemies.length + this.projectiles.length + this.effects.length;
    }

    /**
     * Set canvas dimensions
     */
    setCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // Update entities' canvas reference
        for (const unit of this.units) {
            unit.canvasWidth = width;
            unit.canvasHeight = height;
        }
        for (const enemy of this.enemies) {
            enemy.canvasWidth = width;
            enemy.canvasHeight = height;
        }
        for (const projectile of this.projectiles) {
            projectile.canvasWidth = width;
            projectile.canvasHeight = height;
        }
        for (const effect of this.effects) {
            effect.canvasWidth = width;
            effect.canvasHeight = height;
        }
    }

    /**
     * Get canvas width
     */
    getCanvasWidth() {
        return this.canvasWidth;
    }

    /**
     * Get canvas height
     */
    getCanvasHeight() {
        return this.canvasHeight;
    }

    /**
     * Reset the entity manager
     */
    reset() {
        this.units = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.nextUnitId = 1;
        this.nextEnemyId = 1;
        this.nextProjectileId = 1;
        this.nextEffectId = 1;
        this.totalEntities = 0;
    }

    /**
     * Clean up
     */
    dispose() {
        this.units = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
    }
}