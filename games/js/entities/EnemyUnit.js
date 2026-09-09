/**
 * Enemy Unit Entity - Base class for enemy units
 * Implements enemy behavior for crowd control gameplay
 */
export class EnemyUnit {
    constructor(config, type = 'basic') {
        this.config = config;
        this.type = type;

        // Position and movement
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;

        // Visual properties
        this.radius = this.getRadiusForType();
        this.color = this.getColorForType();

        // Stats from config
        const unitConfig = this.getUnitConfig();
        this.maxHealth = unitConfig.health || 1;
        this.health = this.maxHealth;
        this.damage = unitConfig.damage || 1;
        this.speed = unitConfig.speed || 100;

        // Scoring
        this.scoreValue = unitConfig.scoreValue || 10;

        // State
        this.active = true;
        this.isMoving = false;

        // AI state
        this.targetPlayerX = 0;
        this.targetPlayerY = 0;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 2000 + Math.random() * 3000; // Randomize AI behavior

        // Special properties
        this.isShielded = unitConfig.shield || false;
        this.shieldTimer = 0;
        this.isRanged = unitConfig.range !== undefined;
        this.range = unitConfig.range || 0;
        this.fireRate = unitConfig.fireRate || 1000;
        this.lastFireTime = 0;
    }

    /**
     * Get unit configuration based on type
     */
    getUnitConfig() {
        const enemyConfigs = this.config.getConfig('enemyUnits');
        return enemyConfigs[this.type] || enemyConfigs.basic || {};
    }

    /**
     * Get radius for unit type
     */
    getRadiusForType() {
        const enemyConfigs = this.config.getConfig('enemyUnits');
        const config = enemyConfigs[this.type] || enemyConfigs.basic || {};
        return config.radius || 12;
    }

    /**
     * Get color for unit type
     */
    getColorForType() {
        const enemyConfigs = this.config.getConfig('enemyUnits');
        const config = enemyConfigs[this.type] || enemyConfigs.basic || {};
        return config.color || '#ff4444';
    }

    /**
     * Initialize enemy unit at position
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.health = this.maxHealth;
        this.isMoving = false;
        this.shieldTimer = 0;
        this.isShielded = this.config.getConfig('enemyUnits', this.type, 'shield') || false;
        this.lastFireTime = 0;

        // Set initial target to player cannon area
        this.setPlayerTarget();

        return this;
    }

    /**
     * Reset enemy unit to initial state (for pooling)
     */
    reset() {
        this.active = true;
        this.isMoving = false;
        this.health = this.maxHealth;
        this.shieldTimer = 0;
        this.isShielded = this.config.getConfig('enemyUnits', this.type, 'shield') || false;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 2000 + Math.random() * 3000;
        this.lastFireTime = 0;
        this.rotation = 0;
    }

    /**
     * Update enemy unit state
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update shield timer
        if (this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime * 1000;
            if (this.shieldTimer <= 0) {
                this.shieldTimer = 0;
                this.isShielded = false;
            }
        }

        // Update AI
        this.updateAI(deltaTime);

        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Update rotation based on velocity (for visual effect)
        if (this.vx !== 0 || this.vy !== 0) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }

        // Update fire timer for ranged enemies
        if (this.isRanged && this.lastFireTime > 0) {
            this.lastFireTime -= deltaTime * 1000;
        }
    }

    /**
     * Update AI behavior
     */
    updateAI(deltaTime) {
        // Change direction periodically for more natural movement
        if (Date.now() - this.lastDirectionChange > this.directionChangeInterval) {
            this.lastDirectionChange = Date.now();
            this.directionChangeInterval = 1500 + Math.random() * 2500;
            // Add some randomness to movement
            const randomAngle = Math.random() * Math.PI * 2;
            const randomStrength = 20 + Math.random() * 30;
            this.vx += Math.cos(randomAngle) * randomStrength;
            this.vy += Math.sin(randomAngle) * randomStrength;
        }

        // Move toward player with some randomness
        this.moveTowardsPlayer(deltaTime);
    }

    /**
     * Set target to player cannon area
     */
    setPlayerTarget() {
        // Target the bottom center area where player cannon is
        const canvasWidth = this.config.getConfig('game', 'canvasWidth') || 800;
        const canvasHeight = this.config.getConfig('game', 'canvasHeight') || 600;

        this.targetPlayerX = canvasWidth / 2;
        this.targetPlayerY = canvasHeight * 0.85; // 85% down the screen
    }

    /**
     * Move toward player target
     */
    moveTowardsPlayer(deltaTime) {
        const dx = this.targetPlayerX - this.x;
        const dy = this.targetPlayerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) { // Only move if not already close
            const moveSpeed = this.speed * (1 + Math.random() * 0.2); // Add slight variation
            this.vx = (dx / distance) * moveSpeed;
            this.vy = (dy / distance) * moveSpeed;
        } else {
            // If close to target, wander around it
            const wanderAngle = Date.now() * 0.001 + this.x * 0.1;
            this.vx = Math.cos(wanderAngle) * 20;
            this.vy = Math.sin(wanderAngle) * 20;
        }
    }

    /**
     * Apply force to enemy (for push/knockback)
     */
    applyForce(fx, fy) {
        this.vx += fx;
        this.vy += fy;
    }

    /**
     * Take damage
     */
    takeDamage(amount) {
        if (this.isShielded) {
            // Shield absorbs damage
            return false;
        }

        this.health -= amount;
        return true;
    }

    /**
     * Check if enemy is alive
     */
    isAlive() {
        return this.health > 0 && this.active;
    }

    /**
     * Activate shield for duration
     */
    activateShield(duration = 2000) {
        this.isShielded = true;
        this.shieldTimer = duration;
    }

    /**
     * Check if enemy can fire (for ranged enemies)
     */
    canFire() {
        return this.isRanged && this.lastFireTime <= 0;
    }

    /**
     * Fire projectile (for ranged enemies)
     */
    fire() {
        if (this.canFire()) {
            this.lastFireTime = this.fireRate;
            // Would create projectile in real implementation
            return true;
        }
        return false;
    }

    /**
     * Get enemy data for rendering
     */
    getRenderData() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            rotation: this.rotation,
            isShielded: this.isShielded,
            health: this.health,
            maxHealth: this.maxHealth,
            type: this.type,
            isRanged: this.isRanged,
            animationFrame: Date.now() * 0.1 // Simple animation
        };
    }

    /**
     * Create a copy of this enemy unit
     */
    clone() {
        const enemy = new EnemyUnit(this.config, this.type);
        enemy.x = this.x;
        enemy.y = this.y;
        enemy.vx = this.vx;
        enemy.vy = this.vy;
        enemy.rotation = this.rotation;
        enemy.health = this.health;
        return enemy;
    }
}

/**
 * Specialized enemy unit types
 */

export class FastEnemy extends EnemyUnit {
    constructor(config) {
        super(config, 'fast');
        const unitConfig = this.getUnitConfig();
        this.speed = unitConfig.speed || 150;
        this.radius = unitConfig.radius || 10;
        this.color = unitConfig.color || '#ff44ff';
        this.scoreValue = unitConfig.scoreValue || 15;
    }
}

export class HeavyEnemy extends EnemyUnit {
    constructor(config) {
        super(config, 'heavy');
        const unitConfig = this.getUnitConfig();
        this.maxHealth = unitConfig.health || 3;
        this.health = this.maxHealth;
        this.speed = unitConfig.speed || 70;
        this.damage = unitConfig.damage || 2;
        this.radius = unitConfig.radius || 16;
        this.color = unitConfig.color || '#ff8844';
        this.scoreValue = unitConfig.scoreValue || 25;
    }

    takeDamage(amount) {
        // Heavy enemies take reduced damage
        const reducedDamage = amount * 0.6;
        return super.takeDamage(reducedDamage);
    }
}

export class ShieldEnemy extends EnemyUnit {
    constructor(config) {
        super(config, 'shield');
        const unitConfig = this.getUnitConfig();
        this.maxHealth = unitConfig.health || 2;
        this.health = this.maxHealth;
        this.speed = unitConfig.speed || 90;
        this.damage = unitConfig.damage || 1;
        this.radius = unitConfig.radius || 14;
        this.color = unitConfig.color || '#4444ff';
        this.scoreValue = unitConfig.scoreValue || 20;
        // Shield property already set in parent
    }

    takeDamage(amount) {
        // Shield enemies have damage reduction
        const reducedDamage = amount * 0.7;
        const result = super.takeDamage(reducedDamage);
        if (result) {
            this.isShielded = false;
        }
        return result;
    }

    isAlive() {
        return (this.health > 0 || this.isShielded) && this.active;
    }
}

export class FastEnemyVariant extends EnemyUnit {
    constructor(config) {
        super(config, 'fastEnemy');
        const unitConfig = this.getUnitConfig();
        this.maxHealth = unitConfig.health || 1;
        this.health = this.maxHealth;
        this.speed = unitConfig.speed || 200;
        this.damage = unitConfig.damage || 1;
        this.radius = unitConfig.radius || 8;
        this.color = unitConfig.color || '#ffff44';
        this.scoreValue = unitConfig.scoreValue || 20;
    }
}