/**
 * Advanced Particle System - Handles complex particle effects
 * Supports various particle types with physics and behaviors
 */
export class ParticleSystem {
    constructor(config) {
        this.config = config;
        this.particles = [];
        this.emitters = [];
        this.particleId = 0;

        // Performance settings
        this.maxParticles = 200;
        this.enablePhysics = true;

        // Predefined particle types
        this.particleTypes = this.initParticleTypes();
    }

    /**
     * Initialize predefined particle types
     */
    initParticleTypes() {
        return {
            // Explosion particles
            explosion: {
                life: 800,
                size: { min: 2, max: 6 },
                color: ['#ff4500', '#ffa500', '#ffff00', '#ffffff'],
                speed: { min: 20, max: 80 },
                decay: 0.95,
                gravity: 0.1,
                rotation: { min: 0, max: Math.PI * 2 },
                rotationSpeed: { min: -0.1, max: 0.1 }
            },

            // Spark particles
            spark: {
                life: 400,
                size: { min: 1, max: 3 },
                color: ['#ffff00', '#ff0', '#fff'],
                speed: { min: 50, max: 150 },
                decay: 0.92,
                gravity: 0.05,
                rotation: { min: 0, max: Math.PI * 2 },
                rotationSpeed: { min: -0.2, max: 0.2 }
            },

            // Smoke particles
            smoke: {
                life: 1200,
                size: { min: 3, max: 10 },
                color: ['#666666', '#888888', '#aaaaaa'],
                speed: { min: 5, max: 15 },
                decay: 0.98,
                gravity: -0.02, // Slight rise
                rotation: { min: 0, max: Math.PI * 2 },
                rotationSpeed: { min: -0.02, max: 0.02 }
            },

            // Energy particles
            energy: {
                life: 600,
                size: { min: 1, max: 4 },
                color: ['#00ffff', '#00ff00', '#ffff00'],
                speed: { min: 10, max: 30 },
                decay: 0.96,
                gravity: 0,
                rotation: { min: 0, max: Math.PI * 2 },
                rotationSpeed: { min: -0.05, max: 0.05 },
                pulse: true
            },

            // Blood particles
            blood: {
                life: 500,
                size: { min: 1, max: 3 },
                color: ['#ff0000', '#8b0000', '#660000'],
                speed: { min: 5, max: 20 },
                decay: 0.9,
                gravity: 0.2,
                rotation: { min: 0, max: Math.PI * 2 },
                rotationSpeed: { min: -0.1, max: 0.1 }
            },

            // Gold particles (for rewards)
            gold: {
                life: 1000,
                size: { min: 2, max: 5 },
                color: ['#ffd700', '#ffff00', '#ffea00'],
                speed: { min: 5, max: 15 },
                decay: 0.97,
                gravity: 0.05,
                rotation: { min: 0, max: Math.PI * 2 },
                rotationSpeed: { min: -0.02, max: 0.02 },
                pulse: true,
                bounce: 0.8
            }
        };
    }

    /**
     * Create a new particle
     */
    createParticle(type, x, y, options = {}) {
        // Respect particle limit
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            this.particles.shift();
        }

        const particleType = this.particleTypes[type] || this.particleTypes.spark;

        const particle = {
            id: this.particleId++,
            type: type,
            x: x,
            y: y,
            vx: options.vx || 0,
            vy: options.vy || 0,
            life: options.life || particleType.life,
            maxLife: options.life || particleType.life,
            size: options.size ||
                  (particleType.size.min + Math.random() * (particleType.size.max - particleType.size.min)),
            color: options.color ||
                  particleType.color[Math.floor(Math.random() * particleType.color.length)],
            rotation: options.rotation ||
                     (particleType.rotation.min + Math.random() * (particleType.rotation.max - particleType.rotation.min)),
            rotationSpeed: options.rotationSpeed ||
                          (particleType.rotationSpeed.min + Math.random() * (particleType.rotationSpeed.max - particleType.rotationSpeed.min)),
            decay: options.decay || particleType.decay,
            gravity: options.gravity || particleType.gravity,
            speed: particleType.speed,
            active: true,

            // Custom properties
            pulse: options.pulse || particleType.pulse || false,
            bounce: options.bounce || particleType.bounce || 0,
            trail: options.trail || false,
            trailLength: options.trailLength || 5,
            trailPoints: []
        };

        // Apply random velocity based on type if not specified
        if (options.vx === undefined && options.vy === undefined) {
            const angle = Math.random() * Math.PI * 2;
            const speedMin = typeof particleType.speed === 'number' ? particleType.speed :
                           particleType.speed.min + Math.random() * (particleType.speed.max - particleType.speed.min);
            const speed = options.speed || speedMin;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
        }

        this.particles.push(particle);
        return particle;
    }

    /**
     * Create a burst of particles
     */
    createBurst(type, x, y, count, options = {}) {
        const particles = [];
        const spread = options.spread || Math.PI * 2; // Full circle by default
        const speed = options.speed ||
                     (typeof this.particleTypes[type].speed === 'number' ?
                      this.particleTypes[type].speed :
                      this.particleTypes[type].speed.min);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * spread - spread / 2; // Centered spread
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const particleOptions = {
                ...options,
                vx: vx,
                vy: vy
            };

            particles.push(this.createParticle(type, x, y, particleOptions));
        }

        return particles;
    }

    /**
     * Create a particle trail
     */
    createTrail(type, x, y, length, options = {}) {
        const particles = [];
        const spacing = options.spacing || 2;

        for (let i = 0; i < length; i++) {
            const offsetX = -options.vx * spacing * i;
            const offsetY = -options.vy * spacing * i;

            const particleOptions = {
                ...options,
                life: options.life * (1 - i / length), // Fade out along trail
                size: options.size * (1 - i / length * 0.5) // Shrink along trail
            };

            particles.push(this.createParticle(type, x + offsetX, y + offsetY, particleOptions));
        }

        return particles;
    }

    /**
     * Update all particles
     */
    update(deltaTime) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (!p.active) continue;

            // Update life
            p.life -= deltaTime * 1000;
            if (p.life <= 0) {
                p.active = false;
                // Remove inactive particles occasionally
                if (Math.random() < 0.1) {
                    this.particles.splice(i, 1);
                }
                continue;
            }

            // Apply physics
            if (this.enablePhysics) {
                // Apply gravity
                p.vy += p.gravity * deltaTime * 60; // Convert to per second

                // Apply decay to velocity
                p.vx *= p.decay;
                p.vy *= p.decay;

                // Apply bounce if near ground (simplified)
                if (p.bounce > 0 && p.y > this.config.getConfig('game', 'canvasHeight') - 50) {
                    p.vy = -p.vy * p.bounce;
                    p.y = this.config.getConfig('game', 'canvasHeight') - 50;
                }
            }

            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;

            // Update rotation
            p.rotation += p.rotationSpeed * deltaTime;

            // Apply pulsing effect
            if (p.pulse) {
                // Pulse size based on life
                const pulse = 0.5 + 0.5 * Math.sin(p.life / p.maxLife * Math.PI * 4);
                p.size *= pulse;
            }

            // Update trail points
            if (p.trail) {
                p.trailPoints.push({ x: p.x, y: p.y });
                if (p.trailPoints.length > p.trailLength) {
                    p.trailPoints.shift();
                }
            }
        }

        // Clean up inactive particles
        this.particles = this.particles.filter(p => p.active);
    }

    /**
     * Render all particles
     */
    render(ctx) {
        // Render particles
        for (const p of this.particles) {
            if (!p.active) continue;

            ctx.save();
            ctx.globalAlpha = p.life / p.maxLife;

            // Apply translation
            ctx.translate(p.x, p.y);

            // Apply rotation
            ctx.rotate(p.rotation);

            // Draw trail if enabled
            if (p.trail && p.trailPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trailPoints[0].x, p.trailPoints[0].y);
                for (let i = 1; i < p.trailPoints.length; i++) {
                    ctx.lineTo(p.trailPoints[i].x, p.trailPoints[i].y);
                }
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size * 0.5;
                ctx.stroke();
            }

            // Draw main particle
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);

            // Apply gradient or solid color
            if (Array.isArray(p.color)) {
                // Create gradient from color array
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                for (let i = 0; i < p.color.length; i++) {
                    gradient.addColorStop(i / (p.color.length - 1), p.color[i]);
                }
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = p.color;
            }

            ctx.fill();

            // Add glow effect for certain types
            if (p.type === 'energy' || p.type === 'gold') {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.size * 2;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    /**
     * Create an emitter that continuously emits particles
     */
    createEmitter(type, x, y, rate, options = {}) {
        const emitter = {
            type: type,
            x: x,
            y: y,
            rate: rate, // particles per second
            lastEmit: 0,
            options: options,
            active: true
        };

        this.emitters.push(emitter);
        return emitter;
    }

    /**
     * Update emitters
     */
    updateEmitters(deltaTime) {
        const now = Date.now();

        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const e = this.emitters[i];
            if (!e.active) continue;

            // Emit particles based on rate
            const timeSinceLastEmit = now - e.lastEmit;
            const particlesToEmit = (e.rate * timeSinceLastEmit) / 1000;

            if (particlesToEmit >= 1) {
                const emitCount = Math.floor(particlesToEmit);
                for (let j = 0; j < emitCount; j++) {
                    // Add some randomness to position
                    const offsetX = (Math.random() - 0.5) * 5;
                    const offsetY = (Math.random() - 0.5) * 5;

                    this.createParticle(e.type, e.x + offsetX, e.y + offsetY, e.options);
                }
                e.lastEmit = now - (timeSinceLastEmit % (1000 / e.rate));
            }
        }

        // Remove inactive emitters
        this.emitters = this.emitters.filter(e => e.active);
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.emitters = [];
    }

    /**
     * Get particle count
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Set max particles (for quality adjustment)
     */
    setMaxParticles(max) {
        this.maxParticles = max;
        if (this.particles.length > max) {
            this.particles = this.particles.slice(0, max);
        }
    }
}