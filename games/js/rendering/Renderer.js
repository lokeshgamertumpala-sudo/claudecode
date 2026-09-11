/**
 * Renderer - Handles all rendering for the game
 * Draws entities, effects, and UI using canvas
 */
import { ParticleSystem } from '../particle/ParticleSystem.js';

export class Renderer {
    constructor(canvas, ctx, config) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = config;

        // Visual settings
        this.showDebug = false;
        this.floatingMessages = [];
        this.screenShake = { intensity: 0, duration: 0, offsetX: 0, offsetY: 0 };
        this.vignetteIntensity = 0.2;

        // Preload assets (placeholder for future)
        this.assets = {};

        // Cache for gradients and patterns
        this.gradientCache = new Map();
        this.patternCache = new Map();

        // Initialize advanced particle system
        this.particleSystem = new ParticleSystem(config);

        // Performance settings
        this.quality = 'HIGH'; // Can be LOW, MEDIUM, HIGH, ULTRA
        this.setQualityLimits();
    }

    /**
     * Set quality limits based on performance tier
     */
    setQualityLimits() {
        switch (this.quality) {
            case 'LOW':
                this.maxParticles = 50;
                this.maxFloatingMessages = 5;
                this.enableScreenShake = false;
                this.enableVignette = false;
                this.enableGlow = false;
                this.enableParticleTrails = false;
                this.particleSystem.setMaxParticles(50);
                break;
            case 'MEDIUM':
                this.maxParticles = 100;
                this.maxFloatingMessages = 10;
                this.enableScreenShake = true;
                this.enableVignette = true;
                this.enableGlow = true;
                this.enableParticleTrails = false;
                this.particleSystem.setMaxParticles(100);
                break;
            case 'HIGH':
                this.maxParticles = 200;
                this.maxFloatingMessages = 15;
                this.enableScreenShake = true;
                this.enableVignette = true;
                this.enableGlow = true;
                this.enableParticleTrails = true;
                this.particleSystem.setMaxParticles(200);
                break;
            case 'ULTRA':
                this.maxParticles = 400;
                this.maxFloatingMessages = 20;
                this.enableScreenShake = true;
                this.enableVignette = true;
                this.enableGlow = true;
                this.enableParticleTrails = true;
                this.enableMotionBlur = true;
                this.particleSystem.setMaxParticles(400);
                break;
            default:
                this.maxParticles = 200;
                this.maxFloatingMessages = 15;
                this.enableScreenShake = true;
                this.enableVignette = true;
                this.enableGlow = true;
                this.enableParticleTrails = true;
                this.particleSystem.setMaxParticles(200);
        }
    }

    /**
     * Update effects and animations
     */
    update(deltaTime) {
        this.updateEffects(deltaTime);
        this.updateScreenShake(deltaTime);
        this.particleSystem.update(deltaTime);
    }

    /**
     * Render the entire game world
     */
    renderGameWorld(entities, gates, weaponEffects, levelData) {
        // Apply screen shake
        if (this.enableScreenShake && (this.screenShake.intensity > 0)) {
            this.ctx.save();
            this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        }

        // Clear canvas with background color
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.drawBackground();

        // Draw level environment
        this.drawLevelEnvironment(levelData);

        // Draw gates
        this.drawGates(gates);

        // Draw weapon effects
        this.drawWeaponEffects(weaponEffects);

        // Draw entities
        this.drawEntities(entities);
        if (entities) {
            // Draw enemy units first (back layer)
            if (entities.enemyUnits) {
                entities.enemyUnits.forEach(entity => this.drawEntity(entity));
            }

            // Draw player units
            if (entities.playerUnits) {
                entities.playerUnits.forEach(entity => this.drawEntity(entity));
            }

            // Draw projectiles (top layer)
            if (entities.projectiles) {
                entities.projectiles.forEach(projectile => this.drawProjectile(projectile));
            }
        }

        // Draw particle effects
        this.particleSystem.render(this.ctx);

        // Draw floating messages
        this.drawFloatingMessages();

        // Draw vignette (if enabled)
        if (this.enableVignette) {
            this.drawVignette();
        }

        // Draw HUD (handled separately by Game class)
        // Restore screen shake
        if (this.enableScreenShake && (this.screenShake.intensity > 0)) {
            this.ctx.restore();
        }
    }

    /**
     * Render the game background
     */
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a192f');
        gradient.addColorStop(0.5, '#112240');
        gradient.addColorStop(1, '#0a192f');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle grid or pattern
        this.drawBackgroundGrid();

        // Add animated background elements for polish
        this.drawAnimatedBackground();
    }

    /**
     * Draw background grid pattern
     */
    drawBackgroundGrid() {
        this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        this.ctx.lineWidth = 1;

        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Add animated grid lines for polish
        if (this.quality !== 'LOW') {
            this.drawAnimatedGridLines();
        }
    }

    /**
     * Draw animated background elements
     */
    drawAnimatedBackground() {
        // Add subtle moving dots or lines for visual interest
        const time = Date.now() * 0.001;

        // Draw moving dots
        this.ctx.fillStyle = 'rgba(255,255,255,0.02)';
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time * 0.3 + i) * 100 + this.canvas.width / 2) % this.canvas.width;
            const y = (Math.cos(time * 0.2 + i * 0.7) * 80 + this.canvas.height / 2) % this.canvas.height;
            const size = 2 + Math.sin(time * 0.5 + i) * 2;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Draw animated grid lines
     */
    drawAnimatedGridLines() {
        this.ctx.strokeStyle = 'rgba(0,255,255,0.1)';
        this.ctx.lineWidth = 1;

        const time = Date.now() * 0.0005;
        const offset = Math.sin(time) * 10;

        // Animated horizontal lines
        for (let y = 0; y < this.canvas.height; y += 100) {
            const yOffset = y + Math.sin(time * 0.3 + y * 0.01) * 5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, yOffset);
            this.ctx.lineTo(this.canvas.width, yOffset);
            this.ctx.stroke();
        }

        // Animated vertical lines
        for (let x = 0; x < this.canvas.width; x += 100) {
            const xOffset = x + Math.cos(time * 0.3 + x * 0.01) * 5;
            this.ctx.beginPath();
            this.ctx.moveTo(xOffset, 0);
            this.ctx.lineTo(xOffset, this.canvas.height);
            this.ctx.stroke();
        }
    }

    /**
     * Draw level environment (placeholder for Session 3)
     */
    drawLevelEnvironment(levelData) {
        // This would be enhanced by Session 3 (Levels/Content)
        // For now, just draw a simple ground or obstacles if provided
        if (levelData && levelData.obstacles) {
            levelData.obstacles.forEach(obstacle => {
                this.ctx.fillStyle = obstacle.color || '#555';
                this.ctx.beginPath();
                this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius || 20, 0, Math.PI * 2);
                this.ctx.fill();

                // Add subtle glow to obstacles for polish
                if (this.enableGlow && obstacle.glow !== false) {
                    this.ctx.save();
                    this.ctx.shadowColor = obstacle.color || '#555';
                    this.ctx.shadowBlur = 15;
                    this.ctx.fillStyle = obstacle.color || '#555';
                    this.ctx.beginPath();
                    this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius || 20, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            });
        }

        // Draw animated environmental effects based on level theme
        if (levelData && levelData.theme) {
            this.drawEnvironmentalEffects(levelData.theme);
        }
    }

    /**
     * Draw environmental effects based on theme
     */
    drawEnvironmentalEffects(theme) {
        const time = Date.now() * 0.001;

        switch (theme) {
            case 'Neon Genesis':
                // Digital rain effect
                this.ctx.fillStyle = 'rgba(0,255,166,0.05)';
                for (let i = 0; i < 30; i++) {
                    const x = Math.random() * this.canvas.width;
                    const y = (Date.now() * 0.2 + i * 20) % this.canvas.height;
                    const len = 10 + Math.sin(time + i) * 5;
                    this.ctx.fillRect(x, y, 2, len);
                }
                break;

            case 'Prismatic Frontier':
                // Light refraction effect
                this.ctx.strokeStyle = 'rgba(0,255,255,0.1)';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < 10; i++) {
                    const x = Math.sin(time * 0.5 + i) * 100 + this.canvas.width / 2;
                    const y = Math.cos(time * 0.3 + i) * 100 + this.canvas.height / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 20 + Math.sin(time * 0.7 + i) * 10, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                break;

            case 'Industrial Wasteland':
                // Steam/piston effect
                this.ctx.fillStyle = 'rgba(139,69,19,0.1)';
                for (let i = 0; i < 15; i++) {
                    const x = (Math.sin(time * 0.4 + i) * 50 + this.canvas.width / 2) % this.canvas.width;
                    const y = (Math.cos(time * 0.3 + i * 0.7) * 30 + this.canvas.height / 4) % this.canvas.height;
                    const size = 3 + Math.sin(time * 0.6 + i) * 2;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;

            default:
                // Default subtle animation
                break;
        }
    }

    /**
     * Draw all gates
     */
    drawGates(gates) {
        if (!gates) return;

        gates.forEach(gate => {
            this.drawGate(gate);
        });
    }

    /**
     * Draw a single gate
     */
    drawGate(gate) {
        // Gate background
        this.ctx.save();
        this.ctx.translate(gate.x, gate.y);

        // Gate shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Gate background
        this.ctx.beginPath();
        this.ctx.arc(0, 0, gate.width/2, 0, Math.PI * 2);

        // Apply gradient based on gate type
        let gradient;
        switch (gate.type) {
            case 'add':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#00ff88');
                gradient.addColorStop(1, '#00cc6a');
                break;
            case 'mult':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#00ffff');
                gradient.addColorStop(1, '#00cccc');
                break;
            case 'sub':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(1, '#ff5252');
                break;
            case 'speed':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#ffd700');
                gradient.addColorStop(1, '#ffb800');
                break;
            case 'split':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#ff00ff');
                gradient.addColorStop(1, '#cc00cc');
                break;
            case 'magnet':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#8a2be2');
                gradient.addColorStop(1, '#6a1cb2');
                break;
            case 'shield':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#e0e0e0');
                break;
            case 'random':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#ff8c00');
                gradient.addColorStop(1, '#cc7000');
                break;
            case 'risk_reward':
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#8b0000');
                gradient.addColorStop(1, '#6b0000');
                break;
            default:
                gradient = this.ctx.createLinearGradient(-gate.width/2, -gate.height/2, gate.width/2, gate.height/2);
                gradient.addColorStop(0, '#666');
                gradient.addColorStop(1, '#444');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Gate border with animated pulse
        this.ctx.shadowColor = 'transparent';
        this.ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        this.ctx.lineWidth = 2;

        // Add pulsing effect when gate is active
        if (gate.active && gate.animationProgress) {
            const pulseIntensity = 0.3 * Math.sin(gate.animationProgress * Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255,255,255,${0.7 + pulseIntensity})`;
            this.ctx.lineWidth = 2 + pulseIntensity * 2;
        }

        this.ctx.stroke();

        // Gate text
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Value
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(gate.value, 0, -6);

        // Type symbol
        this.ctx.font = 'bold 20px Arial';
        let symbol;
        switch (gate.type) {
            case 'add': symbol = '+'; break;
            case 'mult': symbol = '×'; break;
            case 'sub': symbol = '-'; break;
            case 'speed': symbol = '⚡'; break;
            case 'split': symbol = '↕'; break;
            case 'magnet': symbol = '🧲'; break;
            case 'shield': symbol = '🛡️'; break;
            case 'random': symbol = '?'; break;
            case 'risk_reward': symbol = '⚠️'; break;
            default: symbol = gate.type.charAt(0).toUpperCase(); break;
        }
        this.ctx.fillText(symbol, 0, 10);

        // Add activation particles when gate is triggered
        if (gate.active && gate.triggerParticles) {
            this.drawGateActivationParticles(gate);
        }

        this.ctx.restore();
    }

    /**
     * Draw gate activation particles
     */
    drawGateActivationParticles(gate) {
        const particleCount = Math.min(gate.triggerParticles.length, 20); // Limit for performance

        for (let i = 0; i < particleCount; i++) {
            const p = gate.triggerParticles[i];
            if (!p.active) continue;

            this.ctx.save();
            this.ctx.globalAlpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(
                gate.x + p.offsetX,
                gate.y + p.offsetY,
                p.size,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            this.ctx.restore();
        }
    }

    /**
     * Draw all entities
     */
    drawEntities(entities) {
        if (!entities) return;

        // Draw player units
        if (entities.playerUnits) {
            entities.playerUnits.forEach(unit => this.drawEntity(unit));
        }

        // Draw enemy units
        if (entities.enemyUnits) {
            entities.enemyUnits.forEach(unit => this.drawEntity(unit));
        }
    }

    /**
     * Draw a single entity (unit or enemy)
     */
    drawEntity(entity) {
        if (!entity || !entity.active) return;

        this.ctx.save();
        this.ctx.translate(entity.x, entity.y);
        this.ctx.rotate(entity.rotation || 0);

        // Draw shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Draw entity body with advanced shading
        this.ctx.beginPath();
        this.ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);

        // Determine color based on state
        let color = entity.color;

        // Flash when taking damage
        if (entity.flashTimer && entity.flashTimer > 0) {
            color = '#ffffff';
        }

        // Apply shield effect
        if (entity.isShielded) {
            // Draw shield aura with pulse
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(0, 0, entity.radius + 8 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
            const shieldGradient = this.ctx.createRadialGradient(0, 0, entity.radius, 0, 0, entity.radius + 12);
            shieldGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
            shieldGradient.addColorStop(1, 'rgba(255,255,255,0)');
            this.ctx.fillStyle = shieldGradient;
            this.ctx.fill();
            this.ctx.restore();
        }

        // Add outer glow for special entities
        if (entity.glow && this.enableGlow) {
            this.ctx.save();
            this.ctx.shadowColor = entity.color;
            this.ctx.shadowBlur = entity.glow * 2;
            this.ctx.fillStyle = entity.color;
            this.ctx.fill();
            this.ctx.restore();

            // Redraw without glow for inner color
            this.ctx.beginPath();
            this.ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
        }

        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Draw entity border
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Draw health indicator for damaged entities
        if (entity.health < entity.maxHealth) {
            this.drawHealthBar(entity);
        }

        // Draw special indicators
        if (entity.type === 'ranged' || entity.isRanged) {
            this.drawRangeIndicator(entity);
        }

        // Draw attack indicator for attacking entities
        if (entity.isAttacking) {
            this.drawAttackIndicator(entity);
        }

        this.ctx.restore();

        // Reset flash timer
        if (entity.flashTimer) {
            entity.flashTimer -= 16; // Approximate 60fps frame time
        }
    }

    /**
     * Draw health bar above entity
     */
    drawHealthBar(entity) {
        const barWidth = entity.radius * 2;
        const barHeight = 4;
        const barX = -entity.radius;
        const barY = -entity.radius - 8;

        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthPercentage = entity.health / entity.maxHealth;
        let healthColor = '#00ff00';
        if (healthPercentage < 0.5) healthColor = '#ffff00';
        if (healthPercentage < 0.25) healthColor = '#ff0000';

        // Add gradient to health bar for polish
        const gradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercentage, barY);
        gradient.addColorStop(0, healthColor);
        gradient.addColorStop(1, this.lightenColor(healthColor, 0.3));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);

        // Border
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Add health text for large entities
        if (entity.radius > 15) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${Math.round(healthPercentage * 100)}%`, 0, barY + barHeight/2);
        }
    }

    /**
     * Draw range indicator for ranged units
     */
    drawRangeIndicator(entity) {
        if (!entity.range) return;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255,255,0,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, entity.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Add pulsing effect for polish
        if (this.quality !== 'LOW') {
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(255,255,0,0.5)';
            this.ctx.lineWidth = 2;
            const pulseRadius = entity.range + Math.sin(Date.now() * 0.005) * 5;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    /**
     * Draw attack indicator
     */
    drawAttackIndicator(entity) {
        // Draw attack arc in front of entity
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        this.ctx.lineWidth = 2;

        const startAngle = -Math.PI/4; // 45 degrees left
        const endAngle = Math.PI/4;    // 45 degrees right

        this.ctx.beginPath();
        this.ctx.arc(0, 0, entity.radius + 5, startAngle, endAngle);
        this.ctx.stroke();

        // Add attack particles
        if (Math.random() < 0.3) { // Sporadic particles
            this.addParticleEffect(
                Math.cos(0) * (entity.radius + 8),
                Math.sin(0) * (entity.radius + 8),
                '#ff0000',
                3 + Math.random() * 2,
                300 + Math.random() * 200
            );
        }
        this.ctx.restore();
    }

    /**
     * Draw projectile
     */
    drawProjectile(projectile) {
        if (!projectile || !projectile.active) return;

        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);

        // Motion blur effect for fast projectiles
        if (this.enableMotionBlur && Math.abs(projectile.vx) > 5 || Math.abs(projectile.vy) > 5) {
            this.drawMotionBlurTrail(projectile);
        }

        // Glow effect
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = projectile.glow || 6;

        // Draw projectile
        this.ctx.beginPath();
        this.ctx.arc(0, 0, projectile.width/2, 0, Math.PI * 2);

        // Gradient for projectile
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, projectile.width/2);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(1, '#ffaa00');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Add trailing sparkles for polish
        if (this.quality === 'ULTRA' && Math.random() < 0.2) {
            this.addParticleEffect(
                -Math.cos(Math.atan2(projectile.vy, projectile.vx)) * 5,
                -Math.sin(Math.atan2(projectile.vy, projectile.vx)) * 5,
                '#ffff00',
                2,
                150
            );
        }

        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    /**
     * Draw motion blur trail for fast projectiles
     */
    drawMotionBlurTrail(projectile) {
        const segments = 3;
        const maxLength = 15;

        for (let i = 0; i < segments; i++) {
            const progress = (i + 1) / segments;
            const length = maxLength * progress;
            const alpha = 0.3 * (1 - progress);

            const offsetX = -(projectile.vx / Math.max(0.1, Math.abs(projectile.vx) + Math.abs(projectile.vy))) * length * progress;
            const offsetY = -(projectile.vy / Math.max(0.1, Math.abs(projectile.vx) + Math.abs(projectile.vy))) * length * progress;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(
                projectile.x + offsetX,
                projectile.y + offsetY,
                projectile.width/2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            this.ctx.restore();
        }
    }

    /**
     * Draw weapon effects
     */
    drawWeaponEffects(effects) {
        if (!effects) return;

        effects.forEach(effect => {
            switch (effect.type) {
                case 'explosion':
                    this.drawExplosion(effect);
                    break;
                case 'pulse':
                    this.drawPulse(effect);
                    break;
                case 'wave':
                    this.drawWave(effect);
                    break;
                case 'beam':
                    this.drawBeam(effect);
                    break;
                case 'particle_burst':
                    this.drawParticleBurst(effect);
                    break;
                case 'ring':
                    this.drawRingEffect(effect);
                    break;
                case 'cone':
                    this.drawConeEffect(effect);
                    break;
                default:
                    this.drawGenericEffect(effect);
                    break;
            }
        });
    }

    /**
     * Draw explosion effect
     */
    drawExplosion(effect) {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life / effect.maxLife;

        // Draw expanding circle
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);

        // Gradient for explosion
        const gradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
        gradient.addColorStop(0, '#ff4500');
        gradient.addColorStop(0.5, '#ffa500');
        gradient.addColorStop(0.8, '#ffff00');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Outer glow
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius * 1.5, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255,165,0,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Add explosion particles for polish
        if (this.enableParticleTrails && Math.random() < 0.5) {
            const particleCount = Math.min(5 + Math.random() * 10, 20);
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.random() * Math.PI * 2);
                const speed = 2 + Math.random() * 8;
                const life = 300 + Math.random() * 400;

                this.addParticleEffect(
                    effect.x,
                    effect.y,
                    '#ffa500',
                    2 + Math.random() * 3,
                    life,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw pulse effect
     */
    drawPulse(effect) {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life / effect.maxLife;

        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);

        const gradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
        gradient.addColorStop(0, effect.color || '#00ffff');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Add inner pulse for polish
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2);
        const innerGradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius * 0.7);
        innerGradient.addColorStop(0, effect.color || '#00ffff');
        innerGradient.addColorStop(1, 'rgba(0,0,0,0.3)');
        this.ctx.fillStyle = innerGradient;
        this.ctx.fill();

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw wave effect
     */
    drawWave(effect) {
        this.ctx.save();
        this.ctx.strokeStyle = effect.color || '#00ffff';
        this.ctx.lineWidth = effect.width || 3;
        this.ctx.globalAlpha = effect.life / effect.maxLife;

        // Draw expanding circle
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Add concentric waves for polish
        if (this.quality !== 'LOW') {
            for (let i = 1; i <= 2; i++) {
                const waveRadius = effect.radius * (1 + i * 0.3);
                const waveAlpha = effect.life / effect.maxLife * (1 - i * 0.3);
                if (waveAlpha > 0) {
                    this.ctx.save();
                    this.ctx.strokeStyle = effect.color || '#00ffff';
                    this.ctx.lineWidth = Math.max(1, effect.width * 0.5);
                    this.ctx.globalAlpha = waveAlpha;
                    this.ctx.beginPath();
                    this.ctx.arc(effect.x, effect.y, waveRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw beam effect
     */
    drawBeam(effect) {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life / effect.maxLife;

        this.ctx.beginPath();
        this.ctx.moveTo(effect.startX, effect.startY);
        this.ctx.lineTo(effect.endX, effect.endY);
        this.ctx.strokeStyle = effect.color || '#ff00ff';
        this.ctx.lineWidth = effect.width || 4;
        this.ctx.stroke();

        // Add glow
        this.ctx.shadowColor = effect.color || '#ff00ff';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(effect.startX, effect.startY);
        this.ctx.lineTo(effect.endX, effect.endY);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Add energy particles along beam for polish
        if (this.enableParticleTrails) {
            const steps = Math.max(3, Math.floor(effect.width / 2));
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const x = effect.startX + (effect.endX - effect.startX) * progress;
                const y = effect.startY + (effect.endY - effect.startY) * progress;

                if (Math.random() < 0.3) {
                    this.addParticleEffect(
                        x,
                        y,
                        effect.color || '#ff00ff',
                        2,
                        200,
                        (Math.random() - 0.5) * 2,
                        (Math.random() - 0.5) * 2
                    );
                }
            }
        }

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw particle burst effect
     */
    drawParticleBurst(effect) {
        // Draw the burst particles directly
        if (effect.particles) {
            effect.particles.forEach(particle => {
                if (!particle.active) return;

                this.ctx.save();
                this.ctx.globalAlpha = particle.life / particle.maxLife;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
                this.ctx.restore();
            });
        }
    }

    /**
     * Draw ring effect
     */
    drawRingEffect(effect) {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life / effect.maxLife;
        this.ctx.strokeStyle = effect.color || '#ffffff';
        this.ctx.lineWidth = effect.width || 3;

        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Add inner glow
        this.ctx.save();
        this.ctx.shadowColor = effect.color || '#ffffff';
        this.ctx.shadowBlur = effect.blur || 10;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw cone effect
     */
    drawConeEffect(effect) {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life / effect.maxLife;
        this.ctx.fillStyle = effect.color || '#ff0000';

        this.ctx.beginPath();
        this.ctx.moveTo(effect.x, effect.y);
        this.ctx.lineTo(effect.x + Math.cos(effect.startAngle) * effect.radius, effect.y + Math.sin(effect.startAngle) * effect.radius);
        this.ctx.arc(effect.x, effect.y, effect.radius, effect.startAngle, effect.endAngle, effect.clockwise || false);
        this.ctx.closePath();
        this.ctx.fill();

        // Add outline
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw generic effect
     */
    drawGenericEffect(effect) {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life / effect.maxLife;
        this.ctx.fillStyle = effect.color || '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw particle effects
     */
    drawParticleEffects() {
        // Now handled by particle system
    }

    /**
     * Draw floating messages
     */
    drawFloatingMessages() {
        this.floatingMessages.forEach((msg, index) => {
            if (!msg.active) return;

            this.ctx.save();
            this.ctx.globalAlpha = msg.life / msg.maxLife;
            this.ctx.fillStyle = msg.color || '#ffffff';
            this.ctx.font = msg.font || 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(msg.text, msg.x, msg.y - msg.offset);
            this.ctx.globalAlpha = 1;
            this.ctx.restore();
        });
    }

    /**
     * Draw vignette effect
     */
    drawVignette() {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0,0,0,${this.vignetteIntensity})`;

        // Create radial gradient for vignette
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Add particle effect - now delegates to particle system
     */
    addParticleEffect(x, y, color, size, life, vx = 0, vy = 0) {
        // Determine particle type based on color
        let type = 'spark'; // default
        if (color === '#ffa500' || color === '#ff4500') type = 'explosion';
        else if (color === '#666666' || color === '#888888') type = 'smoke';
        else if (color === '#00ffff' || color === '#00ff00') type = 'energy';
        else if (color === '#ffd700') type = 'gold';
        else if (color === '#ff0000') type = 'blood';

        this.particleSystem.createParticle(type, x, y, {
            size: size,
            life: life,
            vx: vx,
            vy: vy,
            color: color
        });
    }

    /**
     * Add floating message
     */
    addFloatingMessage(text, x, y, color, life) {
        // Respect quality limits
        if (this.floatingMessages.length >= this.maxFloatingMessages) {
            // Remove oldest message
            this.floatingMessages.shift();
        }

        this.floatingMessages.push({
            text: text,
            x: x,
            y: y,
            color: color,
            life: life,
            maxLife: life,
            offset: 0,
            active: true
        });
    }

    /**
     * Trigger screen shake
     */
    triggerScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.startTime = Date.now();
    }

    /**
     * Update screen shake
     */
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            const elapsed = Date.now() - this.screenShake.startTime;
            const progress = Math.min(elapsed / (this.screenShake.duration * 1000), 1);

            // Ease out effect
            const easeOut = 1 - Math.pow(progress - 1, 2);
            this.screenShake.intensity = this.screenShake.duration > 0 ?
                this.screenShake.duration * easeOut : 0;

            // Calculate offset
            const angle = Math.random() * Math.PI * 2;
            const offset = this.screenShake.intensity * (1 - progress);
            this.screenShake.offsetX = Math.cos(angle) * offset;
            this.screenShake.offsetY = Math.sin(angle) * offset;

            // Reset when done
            if (elapsed >= this.screenShake.duration * 1000) {
                this.screenShake.intensity = 0;
                this.screenShake.duration = 0;
            }
        }
    }

    /**
     * Update effects (called each frame)
     */
    updateEffects(deltaTime) {
        // Update floating messages
        for (let i = this.floatingMessages.length - 1; i >= 0; i--) {
            const msg = this.floatingMessages[i];
            if (!msg.active) continue;

            msg.life -= deltaTime * 1000;
            if (msg.life <= 0) {
                msg.active = false;
                if (Math.random() < 0.1) {
                    this.floatingMessages.splice(i, 1);
                }
            } else {
                // Float upward with slight drift
                msg.offset += deltaTime * 20;
                msg.y -= deltaTime * 10;

                // Add slight wobble for polish
                if (Math.random() < 0.2) {
                    msg.x += (Math.random() - 0.5) * 3;
                }
            }
        }

        // Clean up old effects periodically
        if (Date.now() % 1000 < 16) { // Roughly once per second
            this.floatingMessages = this.floatingMessages.filter(m => m.active);
        }
    }

    /**
     * Render HUD elements
     */
    renderHUD(hudData) {
        if (!hudData) return;

        // Draw crowd count
        if (hudData.crowdCount !== undefined && hudData.goalCount !== undefined) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Crowd: ${hudData.crowdCount} / ${hudData.goalCount}`, 10, 25);

            // Color code based on progress with glow
            const progress = hudData.crowdCount / hudData.goalCount;
            let color = '#ff0000';
            if (progress > 0.8) color = '#00ff00';
            else if (progress > 0.5) color = '#ffff00';
            else if (progress > 0.2) color = '#ff8800';

            this.ctx.fillStyle = color;
            this.ctx.font = 'bold 22px Arial';
            this.ctx.fillText(hudData.crowdCount, 80, 25);

            // Add glow effect for polish
            if (this.enableGlow && progress > 0.5) {
                this.ctx.save();
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 8;
                this.ctx.fillText(hudData.crowdCount, 80, 25);
                this.ctx.restore();
            }
        }

        // Draw score
        if (hudData.score !== undefined) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${hudData.score}`, 10, 50);

            // Add animated glow for high scores
            if (hudData.score > 1000 && this.enableGlow) {
                this.ctx.save();
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 12 + Math.sin(Date.now() * 0.005) * 4;
                this.ctx.fillText(`Score: ${hudData.score}`, 10, 50);
                this.ctx.restore();
            }
        }

        // Draw wave
        if (hudData.waveCount !== undefined) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Wave: ${hudData.waveCount}`, 10, 75);

            // Add pulsing effect
            this.ctx.save();
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 6 + Math.sin(Date.now() * 0.003) * 3;
            this.ctx.fillText(`Wave: ${hudData.waveCount}`, 10, 75);
            this.ctx.restore();
        }

        // Draw level
        if (hudData.levelNumber !== undefined) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Level: ${hudData.levelNumber}`, this.canvas.width - 10, 25);

            // Add level progress bar
            if (hudData.levelProgress !== undefined) {
                const barWidth = 100;
                const barHeight = 4;
                const barX = this.canvas.width - 10 - barWidth;
                const barY = 20;

                // Background
                this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                this.ctx.fillRect(barX, barY, barWidth, barHeight);

                // Progress
                this.ctx.fillStyle = '#00ffff';
                this.ctx.fillRect(barX, barY, barWidth * hudData.levelProgress, barHeight);

                // Border
                this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
        }

        // Draw coins
        if (hudData.coins !== undefined) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Coins: ${hudData.coins}`, this.canvas.width - 10, 50);

            // Add coin sparkle effect
            if (this.enableGlow && hudData.coins > 0) {
                this.ctx.save();
                this.ctx.shadowColor = '#ffd700';
                this.ctx.shadowBlur = 6;
                this.ctx.fillText(`Coins: ${hudData.coins}`, this.canvas.width - 10, 50);
                this.ctx.restore();
            }
        }

        // Draw FPS (debug)
        if (this.showDebug && hudData.fps !== undefined) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`FPS: ${hudData.fps}`, 10, this.canvas.height - 20);

            if (hudData.currentState) {
                this.ctx.fillText(`State: ${hudData.currentState}`, 10, this.canvas.height - 5);
            }

            // Add entity counts to debug
            if (hudData.entityCount !== undefined) {
                this.ctx.fillText(`Entities: ${hudData.entityCount}`, 10, this.canvas.height - 35);
            }

            if (hudData.particleCount !== undefined) {
                this.ctx.fillText(`Particles: ${hudData.particleCount}`, 10, this.canvas.height - 50);
            }
        }
    }

    /**
     * Handle canvas resize
     */
    onResize(width, height) {
        // Canvas size is handled by the Game class
        // But we might need to update cached gradients or other size-dependent resources
        this.gradientCache.clear();
        this.patternCache.clear();
    }

    /**
     * Toggle debug drawing
     */
    toggleDebug() {
        this.showDebug = !this.showDebug;
    }

    /**
     * Clear all effects
     */
    clearEffects() {
        this.floatingMessages = [];
        // Particle system is cleared separately if needed
    }

    /**
     * Dispose of renderer resources
     */
    dispose() {
        this.clearEffects();
        this.gradientCache.clear();
        this.patternCache.clear();
        this.particleSystem.clear();
        this.assets = {};
    }

    /**
     * Get renderer statistics for debugging
     */
    getStats() {
        return {
            particleEffects: this.particleSystem.getParticleCount(),
            floatingMessages: this.floatingMessages.length,
            showDebug: this.showDebug,
            gradientCacheSize: this.gradientCache.size,
            patternCacheSize: this.patternCache.size,
            quality: this.quality,
            screenShakeIntensity: this.screenShake.intensity
        };
    }

    /**
     * Utility: Convert hex color to rgb string
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `${r}, ${g}, ${b}`;
    }

    /**
     * Utility: Lighten a color by a factor (0-1)
     */
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const newR = Math.min(255, r + (255 - r) * factor);
        const newG = Math.min(255, g + (255 - g) * factor);
        const newB = Math.min(255, b + (255 - b) * factor);

        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }

    /**
     * Utility: Darken a color by a factor (0-1)
     */
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const newR = Math.max(0, r - r * factor);
        const newG = Math.max(0, g - g * factor);
        const newB = Math.max(0, b - b * factor);

        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }
}