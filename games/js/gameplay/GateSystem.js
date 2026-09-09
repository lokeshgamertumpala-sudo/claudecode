/**
 * Gate System - Manages gate mechanics and effects
 * Handles multiplier, adder, splitter, and other gate types
 */
export class GateSystem {
    constructor(config) {
        this.config = config;

        // Gate storage
        this.gates = [];
        this.nextGateId = 1;

        // Gate configurations from config manager
        this.gateTypes = this.getGateTypes();

        // Visual effects
        this.pulseEffects = [];
    }

    /**
     * Get gate type configurations
     */
    getGateTypes() {
        const gateConfig = this.config.getConfig('gates');
        return gateConfig || {
            add: { value: 5, color: '#00ff88', symbol: '+' },
            mult: { value: 2, color: '#00ffff', symbol: '×' },
            sub: { value: 3, color: '#ff6b6b', symbol: '-' },
            speed: { value: 1.5, color: '#ffd700', symbol: '⚡' },
            split: { value: 2, color: '#ff00ff', symbol: '↕' },
            magnet: { value: 100, color: '#8a2be2', symbol: '🧲' },
            shield: { value: 5, color: '#ffffff', symbol: '🛡️' },
            random: { value: 0, color: '#ff8c00', symbol: '?' },
            risk_reward: { value: 0, color: '#8b0000', symbol: '⚠️' }
        };
    }

    /**
     * Create a new gate
     */
    createGate(type, x, y, valueOverride = null) {
        const gateType = this.gateTypes[type] || this.gateTypes.add;
        const value = valueOverride !== null ? valueOverride : gateType.value;

        const gate = {
            id: this.nextGateId++,
            type: type,
            value: value,
            x: x,
            y: y,
            width: this.config.getConfig('game', 'gateSize') || 60,
            height: this.config.getConfig('game', 'gateSize') || 60,
            color: gateType.color,
            symbol: gateType.symbol,
            active: true,
            pulseTimer: 0,
            maxPulseTime: 2000, // 2 second pulse cycle
            hitCooldown: 0 // Prevent multiple hits in quick succession
        };

        this.gates.push(gate);
        return gate;
    }

    /**
     * Remove a gate
     */
    removeGate(gateId) {
        const index = this.gates.findIndex(g => g.id === gateId);
        if (index !== -1) {
            this.gates.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get all active gates
     */
    getAllGates() {
        return this.gates.filter(gate => gate.active);
    }

    /**
     * Check if a position hits a gate
     */
    checkGateHit(x, y) {
        for (const gate of this.gates) {
            if (!gate.active) continue;
            if (gate.hitCooldown > 0) continue;

            const dx = x - (gate.x + gate.width/2);
            const dy = y - (gate.y + gate.height/2);
            const distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < gate.width/2) {
                // Start hit cooldown
                gate.hitCooldown = 300; // 300ms cooldown
                return gate;
            }
        }
        return null;
    }

    /**
     * Apply gate effect to crowd count
     */
    applyGateEffect(gate, currentCount) {
        if (!gate || !gate.active) return currentCount;

        let newCount = currentCount;

        switch (gate.type) {
            case 'add':
                newCount = Math.min(
                    this.config.getConfig('game', 'maxCrowdSize') || 500,
                    currentCount + gate.value
                );
                break;
            case 'mult':
                newCount = Math.min(
                    this.config.getConfig('game', 'maxCrowdSize') || 500,
                    Math.floor(currentCount * gate.value)
                );
                break;
            case 'sub':
                newCount = Math.max(0, currentCount - gate.value);
                break;
            case 'speed':
                // Speed gates affect unit movement, not count
                // This would be handled by the entity system
                newCount = currentCount;
                break;
            case 'split':
                // Split gates duplicate units
                newCount = Math.min(
                    this.config.getConfig('game', 'maxCrowdSize') || 500,
                    currentCount * 2
                );
                break;
            case 'magnet':
                // Magnet gates pull units toward them (visual effect only)
                newCount = currentCount;
                break;
            case 'shield':
                // Shield gates give temporary protection
                newCount = currentCount;
                break;
            case 'random':
                // Random gate - could be positive or negative
                const randomType = Math.random();
                if (randomType < 0.3) {
                    // Negative effect
                    newCount = Math.max(0, currentCount - Math.floor(gate.value * 2));
                } else if (randomType < 0.6) {
                    // Small positive
                    newCount = Math.min(
                        this.config.getConfig('game', 'maxCrowdSize') || 500,
                        currentCount + Math.floor(gate.value / 2)
                    );
                } else {
                    // Large positive or extra split
                    if (Math.random() < 0.5) {
                        newCount = Math.min(
                            this.config.getConfig('game', 'maxCrowdSize') || 500,
                            currentCount * gate.value
                        );
                    } else {
                        newCount = Math.min(
                            this.config.getConfig('game', 'maxCrowdSize') || 500,
                            currentCount * 3
                        );
                    }
                }
                break;
            case 'risk_reward':
                // Risk/reward gate - high risk, high reward
                if (Math.random() < 0.4) {
                    // Risk: lose crowd
                    newCount = Math.max(0, currentCount - Math.floor(gate.value * 3));
                } else {
                    // Reward: gain crowd
                    newCount = Math.min(
                        this.config.getConfig('game', 'maxCrowdSize') || 500,
                        Math.floor(currentCount * (gate.value * 4))
                    );
                }
                break;
            default:
                newCount = currentCount;
                break;
        }

        return newCount;
    }

    /**
     * Update gate system (called each frame)
     */
    update(deltaTime) {
        // Update gate timers
        for (const gate of this.gates) {
            // Update hit cooldown
            if (gate.hitCooldown > 0) {
                gate.hitCooldown -= deltaTime * 1000; // Convert to ms
                if (gate.hitCooldown < 0) gate.hitCooldown = 0;
            }

            // Update pulse timer for visual effect
            gate.pulseTimer += deltaTime * 1000;
            if (gate.pulseTimer >= gate.maxPulseTime) {
                gate.pulseTimer = 0;
            }
        }

        // Occasionally spawn new gates
        this.spawnRandomGate(deltaTime);

        // Clean up inactive gates
        this.gates = this.gates.filter(gate => gate.active);
    }

    /**
     * Spawn a random gate occasionally
     */
    spawnRandomGate(deltaTime) {
        const spawnChance = this.config.getConfig('game', 'gateSpawnChance') || 0.002;
        if (Math.random() < spawnChance) {
            const gateTypes = Object.keys(this.gateTypes);
            const randomType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
            const gateConfig = this.gateTypes[randomType];

            // Random value within type's range
            let value = gateConfig.value;
            if (gateConfig.value instanceof Array) {
                value = gateConfig.value[0] + Math.random() * (gateConfig.value[1] - gateConfig.value[0]);
            } else if (typeof gateConfig.value === 'number') {
                // Add some variation to the value
                const variation = 0.2; // 20% variation
                value = gateConfig.value * (1 - variation + Math.random() * (2 * variation));
            }

            // Random position
            const canvasWidth = this.config.getConfig('game', 'canvasWidth') || 800;
            const canvasHeight = this.config.getConfig('game', 'canvasHeight') || 600;
            const margin = 50;

            const x = margin + Math.random() * (canvasWidth - 2 * margin);
            const y = margin + Math.random() * (canvasHeight - 2 * margin);

            this.createGate(randomType, x, y, value);
        }
    }

    /**
     * Clear all gates
     */
    clearAll() {
        this.gates = [];
        this.nextGateId = 1;
    }

    /**
     * Add visual pulse effect when gate is hit
     */
    addPulseEffect(x, y, color, size) {
        this.pulseEffects.push({
            x: x,
            y: y,
            color: color,
            size: size,
            life: 1000, // 1 second
            maxLife: 1000,
            active: true
        });
    }

    /**
     * Update visual effects
     */
    updateEffects(deltaTime) {
        for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
            const effect = this.pulseEffects[i];
            if (!effect.active) continue;

            effect.life -= deltaTime * 1000;
            if (effect.life <= 0) {
                effect.active = false;
                // Clean up occasionally
                if (Math.random() < 0.2) {
                    this.pulseEffects.splice(i, 1);
                }
            }
        }
    }

    /**
     * Get gate statistics for debugging
     */
    getStats() {
        return {
            totalGates: this.gates.length,
            activeGates: this.gates.filter(g => g.active).length,
            nextGateId: this.nextGateId,
            gateTypes: Object.keys(this.gateTypes)
        };
    }

    /**
     * Dispose of gate system resources
     */
    dispose() {
        this.gates = [];
        this.pulseEffects = [];
    }
}