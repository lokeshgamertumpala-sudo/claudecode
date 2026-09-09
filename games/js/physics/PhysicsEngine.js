/**
 * Physics Engine - Lightweight arcade physics for crowd control gameplay
 * Implements collision detection, separation forces, and basic physics
 */
export class PhysicsEngine {
    constructor(config) {
        this.config = config;

        // Physics configuration
        this.gravity = config.getConfig('physics', 'gravity') || 0;
        this.friction = config.getConfig('physics', 'friction') || 0.98;
        this.separationForce = config.getConfig('physics', 'separationForce') || 0.5;
        this.maxSpeed = config.getConfig('physics', 'maxSpeed') || 300;
        this.acceleration = config.getConfig('physics', 'acceleration') || 800;
        this.knockbackForce = config.getConfig('physics', 'knockbackForce') || 200;

        // Spatial partitioning for optimization
        this.spatialGrid = null;
        this.gridSize = 100; // Grid cell size in pixels
        this.enableSpatialPartitioning = true;
    }

    /**
     * Apply physics to an entity
     * Combines movement, velocity, and forces
     */
    applyPhysics(entity, deltaTime) {
        if (!entity || !entity.active) return;

        // Apply gravity
        entity.vy += this.gravity * deltaTime;

        // Apply friction
        entity.vx *= this.friction;
        entity.vy *= this.friction;

        // Limit speed
        const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
        if (speed > this.maxSpeed) {
            entity.vx = (entity.vx / speed) * this.maxSpeed;
            entity.vy = (entity.vy / speed) * this.maxSpeed;
        }
    }

    /**
     * Check collision between two entities using AABB/circle collision
     */
    checkCollision(entityA, entityB) {
        if (!entityA.active || !entityB.active) return false;

        const dx = entityA.x - entityB.x;
        const dy = entityA.y - entityB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const radiusA = entityA.radius || 12;
        const radiusB = entityB.radius || 12;

        return distance < (radiusA + radiusB);
    }

    /**
     * Check collision using AABB (Axis-Aligned Bounding Box)
     */
    checkAABBCollision(entityA, entityB) {
        if (!entityA.active || !entityB.active) return false;

        const radiusA = entityA.radius || 12;
        const radiusB = entityB.radius || 12;

        return Math.abs(entityA.x - entityB.x) < (radiusA + radiusB) &&
               Math.abs(entityA.y - entityB.y) < (radiusA + radiusB);
    }

    /**
     * Apply separation force between entities to prevent overlap
     */
    applySeparation(entities, minDistance = 25) {
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA = entities[i];
                const entityB = entities[j];

                if (!entityA.active || !entityB.active) continue;

                const dx = entityA.x - entityB.x;
                const dy = entityA.y - entityB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    // Apply separation force
                    const separation = minDistance - distance;
                    const separationX = (dx / distance) * (separation / 2) * this.separationForce;
                    const separationY = (dy / distance) * (separation / 2) * this.separationForce;

                    entityA.x += separationX;
                    entityA.y += separationY;
                    entityB.x -= separationX;
                    entityB.y -= separationY;
                }
            }
        }
    }

    /**
     * Apply knockback to an entity from a point
     */
    applyKnockback(entity, fromX, fromY, force = this.knockbackForce) {
        const dx = entity.x - fromX;
        const dy = entity.y - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            entity.vx += (dx / distance) * force;
            entity.vy += (dy / distance) * force;
        }
    }

    /**
     * Apply force to an entity
     */
    applyForce(entity, fx, fy) {
        entity.vx += fx;
        entity.vy += fy;
    }

    /**
     * Generate repulsion force from a point (e.g., gate explosion)
     */
    generateRepulsion(x, y, radius, force) {
        return { x, y, radius, force };
    }

    /**
     * Update spatial grid for optimization
     */
    updateSpatialGrid(entities, canvasWidth, canvasHeight) {
        if (!this.enableSpatialPartitioning) return;

        const gridWidth = Math.ceil(canvasWidth / this.gridSize);
        const gridHeight = Math.ceil(canvasHeight / this.gridSize);

        this.spatialGrid = [];

        // Initialize grid
        for (let i = 0; i < gridWidth; i++) {
            this.spatialGrid[i] = [];
            for (let j = 0; j < gridHeight; j++) {
                this.spatialGrid[i][j] = [];
            }
        }

        // Place entities in grid cells
        for (const entity of entities) {
            if (!entity.active) continue;

            const gridX = Math.floor(entity.x / this.gridSize);
            const gridY = Math.floor(entity.y / this.gridSize);

            if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
                this.spatialGrid[gridX][gridY].push(entity);
            }
        }
    }

    /**
     * Get nearby entities using spatial grid
     */
    getNearbyEntities(entity, radius = 100) {
        if (!this.spatialGrid || !this.enableSpatialPartitioning) {
            return [];
        }

        const results = new Set();
        const gridRadius = Math.ceil(radius / this.gridSize);

        const gridX = Math.floor(entity.x / this.gridSize);
        const gridY = Math.floor(entity.y / this.gridSize);

        for (let dx = -gridRadius; dx <= gridRadius; dx++) {
            for (let dy = -gridRadius; dy <= gridRadius; dy++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;

                if (checkX >= 0 && checkX < this.spatialGrid.length &&
                    checkY >= 0 && checkY < this.spatialGrid[checkX].length) {
                    for (const neighbor of this.spatialGrid[checkX][checkY]) {
                        results.add(neighbor);
                    }
                }
            }
        }

        return Array.from(results).filter(e => e !== entity);
    }

    /**
     * Handle projectile movement
     */
    updateProjectile(projectile, deltaTime) {
        if (!projectile.active) return;

        // Apply velocity
        projectile.x += projectile.vx * deltaTime;
        projectile.y += projectile.vy * deltaTime;

        // Apply drag if configured
        if (projectile.drag) {
            projectile.vx *= projectile.drag;
            projectile.vy *= projectile.drag;

            // If spent too much, deactivate
            if (projectile.lifetime > 0 && projectile.lifetime <= 0) {
                projectile.active = false;
            }
        }
    }

    /**
     * Simple collision response for entities
     */
    resolveCollision(entityA, entityB) {
        if (!this.checkCollision(entityA, entityB)) return;

        const dx = entityA.x - entityB.x;
        const dy = entityA.y - entityB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return; // Prevent division by zero

        // Normal vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Penetration depth
        const minDist = (entityA.radius + entityB.radius);
        const penetration = minDist - distance;

        // Push entities apart
        const pushA = nx * (penetration / 2 + 1);
        const pushB = -nx * (penetration / 2 + 1);

        entityA.x += pushA;
        entityB.x += pushB;

        // Reflect velocities (simple bounce)
        const dotA = entityA.vx * nx + entityA.vy * ny;
        const dotB = entityB.vx * nx + entityB.vy * ny;

        if (dotA > 0) {
            entityA.vx -= dotA * 0.3;
            entityA.vy -= dotA * 0.3;
        }
        if (dotB < 0) {
            entityB.vx -= dotB * 0.3;
            entityB.vy -= dotB * 0.3;
        }
    }

    /**
     * Test if point is inside entity
     */
    isPointInEntity(x, y, entity) {
        const dx = x - entity.x;
        const dy = y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < entity.radius;
    }

    /**
     * Get distance between two entities
     */
    getDistance(entityA, entityB) {
        const dx = entityA.x - entityB.x;
        const dy = entityA.y - entityB.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate speed of entity
     */
    getSpeed(entity) {
        return Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
    }

    /**
     * Set maximum speed for entity
     */
    setMaxSpeed(entity, maxSpeed) {
        const speed = this.getSpeed(entity);
        if (speed > maxSpeed) {
            entity.vx = (entity.vx / speed) * maxSpeed;
            entity.vy = (entity.vy / speed) * maxSpeed;
        }
    }

    /**
     * Update method called each frame
     */
    update(deltaTime) {
        // Update spatial grid if needed (would be called from game loop with current entities)
        // This is a placeholder - actual grid update happens in game loop
    }

    /**
     * Dispose of physics engine resources
     */
    dispose() {
        this.spatialGrid = null;
    }

    /**
     * Get physics statistics for debugging
     */
    getStats() {
        return {
            gravity: this.gravity,
            friction: this.friction,
            separationForce: this.separationForce,
            maxSpeed: this.maxSpeed,
            enableSpatialPartitioning: this.enableSpatialPartitioning,
            hasSpatialGrid: this.spatialGrid !== null
        };
    }
}