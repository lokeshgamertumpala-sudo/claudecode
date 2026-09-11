/**
 * Unit Entity - Base class for player units
 * Implements the core unit behavior for crowd control gameplay
 */
export class Unit {
    constructor(config, type = 'player') {
        this.config = config;
        this.type = type;

        // Position and movement
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;

        // Visual properties
        this.radius = config.getConfig('units', 'player', 'radius') || 12;
        this.color = config.getConfig('units', 'player', 'color') || '#4a90e2';

        // Stats
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.damage = 0;
        this.speed = config.getConfig('units', 'player', 'speed') || 120;

        // Scoring
        this.scoreValue = config.getConfig('units', 'player', 'scoreValue') || 10;

        // State
        this.active = true;
        this.isMoving = false;
        this.targetX = 0;
        this.targetY = 0;

        // Animation state
        this.animationFrame = 0;
        this.lastUpdate = 0;

        // Effects
        this.isShielded = false;
        this.shieldTimer = 0;
    }

    /**
     * Initialize unit at position
     */
    init(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isMoving = false;

        // Reset health for player units
        if (this.type === 'player') {
            this.health = this.maxHealth;
        }

        return this;
    }

    /**
     * Reset unit to initial state (for pooling)
     */
    reset() {
        this.active = true;
        this.isMoving = false;
        this.health = this.maxHealth;
        this.isShielded = false;
        this.shieldTimer = 0;
        this.animationFrame = 0;
        this.lastUpdate = 0;
    }

    /**
     * Update unit state
     */
    update(deltaTime) {
        if (!this.active) return;

        this.lastUpdate += deltaTime;

        // Handle shield timer
        if (this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime * 1000;
            if (this.shieldTimer <= 0) {
                this.shieldTimer = 0;
                this.isShielded = false;
            }
        }

        // Update position based on velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Update animation frame
        this.animationFrame += deltaTime * 60 / 16; // 60fps reference
    }

    /**
     * Apply force to unit (for push/knockback)
     */
    applyForce(fx, fy) {
        this.vx += fx;
        this.vy += fy;
    }

    /**
     * Set target position for movement
     */
    moveTo(x, y, speed = this.speed) {
        this.targetX = x;
        this.targetY = y;

        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
        }

        this.isMoving = true;
    }

    /**
     * Stop unit movement
     */
    stop() {
        this.vx = 0;
        this.vy = 0;
        this.isMoving = false;
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
     * Check if unit is alive
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
     * Get unit data for rendering
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
            animationFrame: this.animationFrame,
            type: this.type
        };
    }

    /**
     * Create a copy of this unit (for cloning)
     */
    clone() {
        const unit = new Unit(this.config, this.type);
        unit.x = this.x;
        unit.y = this.y;
        unit.vx = this.vx;
        unit.vy = this.vy;
        unit.rotation = this.rotation;
        unit.health = this.health;
        return unit;
    }
}

/**
 * Specialized unit types for different gameplay
 */

export class FastUnit extends Unit {
    constructor(config) {
        super(config, 'fast');
        this.speed = config.getConfig('units', 'fast', 'speed') || 180;
        this.radius = config.getConfig('units', 'fast', 'radius') || 10;
        this.color = config.getConfig('units', 'fast', 'color') || '#00ffff';
        this.scoreValue = config.getConfig('units', 'fast', 'scoreValue') || 15;
    }
}

export class HeavyUnit extends Unit {
    constructor(config) {
        super(config, 'heavy');
        this.maxHealth = config.getConfig('modules', 'heavy', 'health') || 3;
        this.health = this.maxHealth;
        this.speed = config.getConfig('modules', 'heavy', 'speed') || 80;
        this.radius = config.getConfig('modules', 'heavy', 'radius') || 16;
        this.color = config.getConfig('modules', 'heavy', 'color') || '#ff6b6b';
        this.scoreValue = config.getConfig('modules', 'heavy', 'scoreValue') || 25;
    }

    takeDamage(amount) {
        // Heavy units take reduced damage
        const reducedDamage = amount * 0.5;
        return super.takeDamage(reducedDamage);
    }
}

export class ShieldUnit extends Unit {
    constructor(config) {
        super(config, 'shield');
        this.maxHealth = config.getConfig('units', 'shield', 'health') || 2;
        this.health = this.maxHealth;
        this.speed = config.getConfig('units', 'shield', 'speed') || 100;
        this.radius = config.getConfig('units', 'shield', 'radius') || 14;
        this.color = config.getConfig('units', 'shield', 'color') || '#ffffff';
        this.scoreValue = config.getConfig('units', 'shield', 'scoreValue') || 20;
        this.shieldActive = true;
    }

    takeDamage(amount) {
        // Shield units have damage reduction
        const reducedDamage = amount * 0.7;
        const result = super.takeDamage(reducedDamage);
        if (result) {
            this.shieldActive = false;
        }
        return result;
    }

    isAlive() {
        return (this.health > 0 || this.shieldActive) && this.active;
    }
}

export class RangedUnit extends Unit {
    constructor(config) {
        super(config, 'ranged');
        this.speed = config.getConfig('units', 'ranged', 'speed') || 100;
        this.damage = config.getConfig('units', 'ranged', 'damage') || 1;
        this.range = config.getConfig('units', 'ranged', 'range') || 150;
        this.fireRate = config.getConfig('units', 'ranged', 'fireRate') || 1000;
        this.color = config.getConfig('units', 'ranged', 'color') || '#ffd700';
        this.scoreValue = config.getConfig('units', 'ranged', 'scoreValue') || 15;

        this.lastFireTime = 0;
    }

    canFire() {
        return this.lastFireTime <= 0;
    }

    fire() {
        this.lastFireTime = this.fireRate;
        // Would create projectile in real implementation
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Update fire timer
        if (this.lastFireTime > 0) {
            this.lastFireTime -= deltaTime * 1000;
        }
    }
}