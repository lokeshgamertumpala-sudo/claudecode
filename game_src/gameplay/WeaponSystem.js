/**
 * Weapon System - Modular weapon framework for different weapon types
 * Supports pulse cannon, gravity burst, plasma arc, shockwave, and more
 */
export class WeaponSystem {
    constructor(config, entityManager, physicsEngine) {
        this.config = config;
        this.entityManager = entityManager;
        this.physicsEngine = physicsEngine;

        // Weapon configurations
        this.weaponTypes = this.getWeaponTypes();

        // Active weapons (cooldowns, etc.)
        this.activeWeapons = new Map(); // playerId -> weapon data
        this.weaponCooldowns = new Map(); // weaponId -> cooldown timer

        // Weapon effects
        this.weaponEffects = [];

        // Ammo/energy system
        this.energySystem = {
            maxEnergy: 100,
            currentEnergy: 100,
            energyRegenRate: 10, // per second
            lastRegenTime: Date.now()
        };
    }

    /**
     * Get weapon type configurations
     */
    getWeaponTypes() {
        const weaponConfig = this.config.getConfig('weapons');
        return weaponConfig || {
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
            },
            energyBeam: {
                damage: 8,
                cooldown: 600,
                range: 400,
                area: 10,
                energyCost: 5,
                color: '#ffff00',
                particles: 3,
                beamWidth: 4
            },
            meteorDrop: {
                damage: 40,
                cooldown: 2000,
                range: 500,
                area: 60,
                energyCost: 25,
                color: '#8b4513',
                particles: 15,
                dropDelay: 300
            }
        };
    }

    /**
     * Fire a weapon
     * @param {string} weaponType - Type of weapon to fire
     * @param {number} playerId - ID of player firing
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @returns {boolean} - True if weapon fired successfully
     */
    fireWeapon(weaponType, playerId, targetX, targetY) {
        // Check if weapon exists
        const weaponConfig = this.weaponTypes[weaponType];
        if (!weaponConfig) {
            console.warn(`Unknown weapon type: ${weaponType}`);
            return false;
        }

        // Check cooldown
        const cooldownKey = `${playerId}-${weaponType}`;
        const currentTime = Date.now();
        if (this.weaponCooldowns.has(cooldownKey)) {
            const lastFired = this.weaponCooldowns.get(cooldownKey);
            if (currentTime - lastFired < weaponConfig.cooldown) {
                return false; // Still on cooldown
            }
        }

        // Check energy
        if (!this.hasSufficientEnergy(weaponConfig.energyCost)) {
            return false; // Not enough energy
        }

        // Fire the weapon
        this.consumeEnergy(weaponConfig.energyCost);
        this.weaponCooldowns.set(cooldownKey, currentTime);

        // Create weapon effect based on type
        const effect = this.createWeaponEffect(weaponType, targetX, targetY, weaponConfig);
        if (effect) {
            this.weaponEffects.push(effect);
        }

        // Apply weapon effects to entities
        this.applyWeaponEffect(weaponType, targetX, targetY, weaponConfig);

        return true;
    }

    /**
     * Check if player has sufficient energy for weapon
     */
    hasSufficientEnergy(cost) {
        this.regenerateEnergy();
        return this.energySystem.currentEnergy >= cost;
    }

    /**
     * Consume energy for weapon firing
     */
    consumeEnergy(amount) {
        this.energySystem.currentEnergy = Math.max(0, this.energySystem.currentEnergy - amount);
    }

    /**
     * Regenerate energy over time
     */
    regenerateEnergy() {
        const now = Date.now();
        const elapsed = (now - this.energySystem.lastRegenTime) / 1000; // seconds
        if (elapsed >= 0.1) { // Regen every 100ms
            const regenAmount = this.energySystem.energyRegenRate * elapsed;
            this.energySystem.currentEnergy = Math.min(
                this.energySystem.maxEnergy,
                this.energySystem.currentEnergy + regenAmount
            );
            this.energySystem.lastRegenTime = now;
        }
    }

    /**
     * Create weapon effect based on type
     */
    createWeaponEffect(weaponType, targetX, targetY, config) {
        const baseEffect = {
            x: targetX,
            y: targetY,
            weaponType: weaponType,
            color: config.color,
            life: 1000, // 1 second default
            maxLife: 1000,
            active: true
        };

        switch (weaponType) {
            case 'pulseCannon':
                return {
                    ...baseEffect,
                    type: 'pulse',
                    radius: config.area,
                    particles: config.particles
                };
            case 'gravityBurst':
                return {
                    ...baseEffect,
                    type: 'wave',
                    radius: config.area,
                    intensity: config.damage
                };
            case 'plasmaArc':
                return {
                    ...baseEffect,
                    type: 'beam',
                    startX: this.entityManager ? this.entityManager.getPlayerSpawnPoint().x : 400,
                    startY: this.entityManager ? this.entityManager.getPlayerSpawnPoint().y : 300,
                    endX: targetX,
                    endY: targetY,
                    width: config.area
                };
            case 'shockwave':
                return {
                    ...baseEffect,
                    type: 'wave',
                    radius: config.area,
                    intensity: config.damage * 2
                };
            case 'energyBeam':
                return {
                    ...baseEffect,
                    type: 'beam',
                    startX: this.entityManager ? this.entityManager.getPlayerSpawnPoint().x : 400,
                    startY: this.entityManager ? this.entityManager.getPlayerSpawnPoint().y : 300,
                    endX: targetX,
                    endY: targetY,
                    width: config.beamWidth || 4
                };
            case 'meteorDrop':
                return {
                    ...baseEffect,
                    type: 'meteor',
                    startX: targetX,
                    startY: targetY - 200, // Start above target
                    endX: targetX,
                    endY: targetY,
                    delay: config.dropDelay,
                    radius: config.area
                };
            default:
                return {
                    ...baseEffect,
                    type: 'generic',
                    radius: config.area
                };
        }
    }

    /**
     * Apply weapon effect to entities in area
     */
    applyWeaponEffect(weaponType, targetX, targetY, config) {
        // Get entities in range
        const entitiesInRange = this.getEntitiesInRange(targetX, targetY, config.range);

        // Apply damage based on weapon type
        switch (weaponType) {
            case 'pulseCannon':
                this.applyDamageToEntities(entitiesInRange, config.damage, config.area);
                this.applyKnockbackToEntities(entitiesInRange, targetX, targetY, 100);
                break;
            case 'gravityBurst':
                this.applyDamageToEntities(entitiesInRange, config.damage, config.area);
                this.applyPullToEntities(entitiesInRange, targetX, targetY, config.area, 150);
                break;
            case 'plasmaArc':
                // Plasma arc is a line - check entities along the beam path
                this.applyBeamDamage(targetX, targetY, config);
                break;
            case 'shockwave':
                this.applyDamageToEntities(entitiesInRange, config.damage, config.area);
                this.applyKnockbackToEntities(entitiesInRange, targetX, targetY, config.area * 2, 200);
                break;
            case 'energyBeam':
                this.applyBeamDamage(targetX, targetY, config);
                break;
            case 'meteorDrop':
                // Meteor drop has delay - damage applied after delay
                setTimeout(() => {
                    this.applyDamageToEntities(
                        this.getEntitiesInRange(targetX, targetY, config.area),
                        config.damage,
                        config.area
                    );
                }, config.dropDelay);
                break;
            default:
                this.applyDamageToEntities(entitiesInRange, config.damage || 10, config.area || 50);
                break;
        }
    }

    /**
     * Get entities within range of a point
     */
    getEntitiesInRange(x, y, range) {
        const entitiesInRange = [];

        // Check player units
        const playerUnits = this.entityManager.getPlayerUnits();
        for (const unit of playerUnits) {
            const distance = this.physicsEngine.getDistance(
                { x: unit.x, y: unit.y, radius: unit.radius },
                { x: x, y: y, radius: 0 }
            );
            if (distance < range + unit.radius) {
                entitiesInRange.push({ entity: unit, type: 'player', distance });
            }
        }

        // Check enemy units
        const enemyUnits = this.entityManager.getEnemyUnits();
        for (const unit of enemyUnits) {
            const distance = this.physicsEngine.getDistance(
                { x: unit.x, y: unit.y, radius: unit.radius },
                { x: x, y: y, radius: 0 }
            );
            if (distance < range + unit.radius) {
                entitiesInRange.push({ entity: unit, type: 'enemy', distance });
            }
        }

        return entitiesInRange;
    }

    /**
     * Apply damage to entities in range
     */
    applyDamageToEntities(entitiesInRange, damage, range) {
        for (const { entity, type, distance } of entitiesInRange) {
            // Apply falloff based on distance
            const distanceFactor = 1 - Math.min(distance / range, 1);
            const finalDamage = damage * (0.5 + distanceFactor * 0.5); // 50-100% damage based on distance

            if (type === 'enemy') {
                const wasDamaged = entity.takeDamage(finalDamage);
                if (wasDamaged && !entity.isAlive()) {
                    // Enemy killed - notify progression (would use events in full implementation)
                }
            }
            // Note: In a crowd control game, weapons typically don't damage player units
            // They might affect them differently (push, stun, etc.)
        }
    }

    /**
     * Apply knockback to entities from a point
     */
    applyKnockbackToEntities(entitiesInRange, sourceX, sourceY, range, force) {
        for (const { entity, type } of entitiesInRange) {
            // Only apply to enemies typically
            if (type === 'enemy') {
                this.physicsEngine.applyKnockback(entity, sourceX, sourceY, force);
            }
        }
    }

    /**
     * Apply pull force to entities toward a point
     */
    applyPullToEntities(entitiesInRange, targetX, targetY, range, force) {
        for (const { entity, type } of entitiesInRange) {
            if (type === 'enemy') {
                // Pull toward target
                this.physicsEngine.applyForce(
                    entity,
                    (targetX - entity.x) * force * 0.01,
                    (targetY - entity.y) * force * 0.01
                );
            }
        }
    }

    /**
     * Apply beam damage (line-based)
     */
    applyBeamDamage(startX, startY, config) {
        // For simplicity, we'll treat beam as a wide line
        // In a more complex implementation, we'd check line-segment to circle collisions
        const beamWidth = config.area * 2; // Make beam wider for easier hits

        // Get entities and check if they're near the beam line
        const playerUnits = this.entityManager.getPlayerUnits();
        const enemyUnits = this.entityManager.getEnemyUnits();

        // Check player units (usually not damaged by own weapons)
        for (const unit of playerUnits) {
            // Beam typically doesn't affect player in crowd control games
        }

        // Check enemy units
        for (const unit of enemyUnits) {
            // Simple distance check from beam center line
            // For a proper implementation, we'd calculate distance to line segment
            const dx = unit.x - startX;
            const dy = unit.y - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < beamWidth) {
                // Apply damage with falloff based on distance from beam center
                const distanceFactor = 1 - Math.min(distance / beamWidth, 1);
                const finalDamage = config.damage * (0.7 + distanceFactor * 0.3);

                unit.takeDamage(finalDamage);
            }
        }
    }

    /**
     * Update weapon system (called each frame)
     */
    update(deltaTime) {
        // Update weapon cooldowns
        for (const [key, timestamp] of this.weaponCooldowns.entries()) {
            const age = Date.now() - timestamp;
            // Remove old cooldown entries to prevent memory buildup
            if (age > 10000) { // Remove after 10 seconds
                this.weaponCooldowns.delete(key);
            }
        }

        // Update weapon effects
        this.updateWeaponEffects(deltaTime);

        // Regenerate energy
        this.regenerateEnergy();
    }

    /**
     * Update weapon effects (particles, visual effects, etc.)
     */
    updateWeaponEffects(deltaTime) {
        for (let i = this.weaponEffects.length - 1; i >= 0; i--) {
            const effect = this.weaponEffects[i];
            if (!effect.active) continue;

            effect.life -= deltaTime * 1000;
            if (effect.life <= 0) {
                effect.active = false;
                // Clean up occasionally
                if (Math.random() < 0.2) {
                    this.weaponEffects.splice(i, 1);
                }
            }
        }
    }

    /**
     * Get current energy level
     */
    getEnergy() {
        return {
            current: this.energySystem.currentEnergy,
            max: this.energySystem.maxEnergy,
            percentage: this.energySystem.currentEnergy / this.energySystem.maxEnergy
        };
    }

    /**
     * Get weapon statistics for debugging
     */
    getStats() {
        return {
            weaponTypes: Object.keys(this.weaponTypes),
            activeCooldowns: this.weaponCooldowns.size,
            energy: this.getEnergy(),
            activeEffects: this.weaponEffects.filter(e => e.active).length
        };
    }

    /**
     * Dispose of weapon system resources
     */
    dispose() {
        this.weaponCooldowns.clear();
        this.weaponEffects = [];
        this.activeWeapons.clear();
    }
}