/**
 * Renderer - Handles all rendering for the game using Three.js for 3D rendering
 * and 2D canvas for overlays (particles, messages, vignette, HUD).
 */
import * as THREE from 'three';
import { ParticleSystem } from '../particle/ParticleSystem.js';
import {
    createCrowdUnitModel,
    createEnemyModel,
    createGateModel,
    createCannonModel,
    createProjectileModel
} from './Models.js';

export class Renderer {
    constructor(canvas, ctx, config) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = config;

        // Three.js setup
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setClearColor(0x000000, 0); // Transparent background

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            canvas.width / -2, // left
            canvas.width / 2, // right
            canvas.height / 2, // top
            canvas.height / -2, // bottom
            -1000, // near
            1000 // far
        );
        this.camera.position.set(0, 0, 500);
        this.camera.lookAt(0, 0, 0);

        // Lights
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Background
        this.createBackground();

        // Groups for organizing objects
        this.levelGroup = new THREE.Group();
        this.gateGroup = new THREE.Group();
        this.entityGroup = new THREE.Group();
        this.weaponEffectGroup = new THREE.Group();

        this.scene.add(this.levelGroup);
        this.scene.add(this.gateGroup);
        this.scene.add(this.entityGroup);
        this.scene.add(this.weaponEffectGroup);

        // Visual settings
        this.showDebug = false;
        this.floatingMessages = [];
        this.screenShake = { intensity: 0, duration: 0, offsetX: 0, offsetY: 0 };
        this.vignetteIntensity = 0.2;

        // Preload assets (placeholder for future)
        this.assets = {};

        // Cache for gradients and patterns (for 2D drawing)
        this.gradientCache = new Map();
        this.patternCache = new Map();

        // Initialize advanced particle system (still uses 2D ctx for rendering)
        this.particleSystem = new ParticleSystem(config);

        // Performance settings
        this.quality = 'HIGH'; // Can be LOW, MEDIUM, HIGH, ULTRA
        this.setQualityLimits();

        // Maps to track Three.js objects for game objects
        this.gateMeshes = new Map();
        this.entityMeshes = new Map();
        this.weaponEffectMeshes = new Map();
    }

    /**
     * Create the background plane
     */
    createBackground() {
        const geometry = new THREE.PlaneGeometry(this.canvas.width, this.canvas.height);
        const material = new THREE.MeshBasicMaterial({ color: 0x0a192f, side: THREE.DoubleSide });
        this.backgroundMesh = new THREE.Mesh(geometry, material);
        this.backgroundMesh.position.z = -1; // Behind everything
        this.scene.add(this.backgroundMesh);
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
        // Update Three.js objects based on game state
        this.updateLevelEnvironment(levelData);
        this.updateGates(gates);
        this.updateEntities(entities);
        this.updateWeaponEffects(weaponEffects);

        // Apply screen shake to camera
        if (this.enableScreenShake && this.screenShake.intensity > 0) {
            this.camera.position.set(
                this.screenShake.offsetX,
                this.screenShake.offsetY,
                500
            );
        } else {
            this.camera.position.set(0, 0, 500);
        }

        // Render the 3D scene
        this.renderer.render(this.scene, this.camera);

        // Reset camera position for 2D rendering (if we changed it for screen shake)
        this.camera.position.set(0, 0, 500);

        // Clear the 2D context for overlays? We want to draw on top of the 3D render.
        // We'll clear only if we need to, but we want to preserve the 3D render.
        // Instead, we'll draw the 2D overlays directly on top.

        // Render particle system (uses the 2D ctx)
        this.ctx.save();
        this.particleSystem.render(this.ctx);
        this.ctx.restore();

        // Draw floating messages
        this.drawFloatingMessages();

        // Draw vignette (if enabled)
        if (this.enableVignette) {
            this.drawVignette();
        }

        // Draw HUD (handled separately by Game class, but we'll draw if data is provided)
        // Note: HUD data is not passed to renderGameWorld, so we'll skip for now.
        // The existing code had a renderHUD method that took hudData.
        // We'll implement renderHUD separately and call it from outside if needed.
    }

    /**
     * Update level environment based on levelData
     */
    updateLevelEnvironment(levelData) {
        // Clear previous level objects
        while (this.levelGroup.children.length) {
            const object = this.levelGroup.children[0];
            this.levelGroup.remove(object);
            object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        }

        if (!levelData) return;

        // Draw background (we already have a background plane, but we can update its color based on level)
        // For now, we'll keep the background as is.

        // Draw level environment (obstacles)
        if (levelData.obstacles) {
            levelData.obstacles.forEach(obstacle => {
                // Create a cylinder or box for the obstacle
                const geometry = new THREE.CylinderGeometry(obstacle.radius || 20, obstacle.radius || 20, 5, 32);
                const material = new THREE.MeshStandardMaterial({
                    color: obstacle.color || 0x555555,
                    metalness: 0.2,
                    roughness: 0.8
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(obstacle.x, obstacle.y, 2.5); // Half height
                this.levelGroup.add(mesh);

                // Add glow if enabled
                if (this.enableGlow && obstacle.glow !== false) {
                    const glowGeometry = new THREE.CylinderGeometry(obstacle.radius || 20, obstacle.radius || 20, 5, 32);
                    const glowMaterial = new THREE.MeshBasicMaterial({
                        color: obstacle.color || 0x555555,
                        transparent: true,
                        opacity: 0.5
                    });
                    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
                    glowMesh.position.set(obstacle.x, obstacle.y, 2.5);
                    glowMesh.scale.set(1.2, 1.2, 1.2);
                    this.levelGroup.add(glowMesh);
                }
            });
        }

        // Draw animated environmental effects based on level theme
        if (levelData && levelData.theme) {
            // We'll implement this as a separate group or modify the levelGroup
            // For simplicity, we'll skip the animated effects in this version.
            // In a full implementation, we would add animated objects to the levelGroup.
        }
    }

    /**
     * Update gates
     */
    updateGates(gates) {
        if (!gates) return;

        // Remove gates that are no longer present
        this.gateMeshes.forEach((mesh, gate) => {
            if (!gates.includes(gate)) {
                this.gateGroup.remove(mesh);
                mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
                this.gateMeshes.delete(gate);
            }
        });

        // Update or create meshes for each gate
        gates.forEach(gate => {
            let mesh = this.gateMeshes.get(gate);
            if (!mesh) {
                mesh = this.createGateMesh(gate);
                this.gateMeshes.set(gate, mesh);
                this.gateGroup.add(mesh);
            } else {
                this.updateGateMesh(gate, mesh);
            }
        });
    }

    /**
     * Create a mesh for a gate using the model from Models.js
     */
    createGateMesh(gate) {
        // Convert gate data to options for the gate model
        const options = {
            width: gate.width,
            height: gate.height,
            color: this.getGateColor(gate.type),
            metalness: 0.2,
            roughness: 0.8
        };
        return createGateModel(options);
    }

    /**
     * Get color for gate type
     */
    getGateColor(gateType) {
        switch (gateType) {
            case 'add':
                return 0x00ff88;
            case 'mult':
                return 0x00ffff;
            case 'sub':
                return 0xff6b6b;
            case 'speed':
                return 0xffd700;
            case 'split':
                return 0xff00ff;
            case 'magnet':
                return 0x8a2be2;
            case 'shield':
                return 0xffffff;
            case 'random':
                return 0xff8c00;
            case 'risk_reward':
                return 0x8b0000;
            default:
                return 0x666666;
        }
    }

    /**
     * Update gate mesh properties
     */
    updateGateMesh(gate, mesh) {
        mesh.position.set(gate.x, gate.y, gate.height / 2);

        // Handle gate activation (pulse, particles) - we'll use the particle system for particles
        // and modify material for pulse.
        if (gate.active && gate.animationProgress) {
            const pulseIntensity = 0.3 * Math.sin(gate.animationProgress * Math.PI * 2);
            mesh.scale.set(
                1 + pulseIntensity,
                1 + pulseIntensity,
                1 + pulseIntensity
            );
        } else {
            mesh.scale.set(1, 1, 1);
        }
    }

    /**
     * Update entities
     */
    updateEntities(entities) {
        if (!entities) return;

        // Remove entities that are no longer present
        this.entityMeshes.forEach((mesh, entity) => {
            const currentEntityList = [...(entities.playerUnits || []), ...(entities.enemyUnits || [])];
            if (!currentEntityList.includes(entity)) {
                this.entityGroup.remove(mesh);
                mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
                this.entityMeshes.delete(entity);
            }
        });

        // Update or create meshes for player units (crowd units)
        if (entities.playerUnits) {
            entities.playerUnits.forEach(entity => {
                let mesh = this.entityMeshes.get(entity);
                if (!mesh) {
                    mesh = this.createCrowdUnitMesh(entity);
                    this.entityMeshes.set(entity, mesh);
                    this.entityGroup.add(mesh);
                } else {
                    this.updateEntityMesh(entity, mesh);
                }
            });
        }

        // Update or create meshes for enemy units
        if (entities.enemyUnits) {
            entities.enemyUnits.forEach(entity => {
                let mesh = this.entityMeshes.get(entity);
                if (!mesh) {
                    mesh = this.createEnemyMesh(entity);
                    this.entityMeshes.set(entity, mesh);
                    this.entityGroup.add(mesh);
                } else {
                    this.updateEntityMesh(entity, mesh);
                }
            });
        }
    }

    /**
     * Create a mesh for a crowd unit (player unit) using the model from Models.js
     */
    createCrowdUnitMesh(entity) {
        const renderData = entity.getRenderData();
        const options = {
            radius: renderData.radius,
            height: renderData.radius * 2, // Make height twice the radius for a cylinder
            useCylinder: true, // Use cylinder for crowd units as per request
            color: parseInt(renderData.color.replace('#', '0x'), 16),
            metalness: 0.2,
            roughness: 0.8
        };
        return createCrowdUnitModel(options);
    }

    /**
     * Create a mesh for an enemy unit using the model from Models.js
     */
    createEnemyMesh(entity) {
        const renderData = entity.getRenderData();
        const options = {
            size: renderData.radius,
            useBox: true, // Use box for enemy units as per request
            color: parseInt(renderData.color.replace('#', '0x'), 16),
            metalness: 0.2,
            roughness: 0.8
        };
        return createEnemyModel(options);
    }

    /**
     * Update entity mesh properties
     */
    updateEntityMesh(entity, mesh) {
        const renderData = entity.getRenderData();
        mesh.position.set(renderData.x, renderData.y, 0);
        mesh.rotation.z = renderData.rotation || 0;

        // Update color based on state
        let color = parseInt(renderData.color.replace('#', '0x'), 16);
        if (renderData.flashTimer && renderData.flashTimer > 0) {
            color = 0xffffff;
        }
        if (renderData.isShielded) {
            color = 0xffffff;
        }
        if (renderData.glow && this.enableGlow) {
            if (mesh.material) {
                mesh.material.color.set(color);
                mesh.material.emissive.set(color);
                mesh.material.emissiveIntensity = 0.5;
            }
        } else {
            if (mesh.material) {
                mesh.material.color.set(color);
                mesh.material.emissive.set(0x000000);
                mesh.material.emissiveIntensity = 0;
            }
        }

        // Update health bar (we'll skip for now)

        // Update range indicator (we'll skip)

        // Update attack indicator (we'll skip)

        // Reset flash timer
        if (entity.flashTimer) {
            entity.flashTimer -= 16; // Approximate 60fps frame time
        }
    }

    /**
     * Update weapon effects
     */
    updateWeaponEffects(weaponEffects) {
        if (!weaponEffects) return;

        // Remove effects that are no longer present
        this.weaponEffectMeshes.forEach((mesh, effect) => {
            if (!weaponEffects.includes(effect)) {
                this.weaponEffectGroup.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
                this.weaponEffectMeshes.delete(effect);
            }
        });

        // Update or create meshes for each effect
        weaponEffects.forEach(effect => {
            let mesh = this.weaponEffectMeshes.get(effect);
            if (!mesh) {
                mesh = this.createWeaponEffectMesh(effect);
                this.weaponEffectMeshes.set(effect, mesh);
                this.weaponEffectGroup.add(mesh);
            } else {
                this.updateWeaponEffectMesh(effect, mesh);
            }
        });
    }

    /**
     * Create a mesh for a weapon effect
     */
    createWeaponEffectMesh(effect) {
        switch (effect.type) {
            case 'explosion':
                // We'll use a sphere that scales up
                const explosionGeometry = new THREE.SphereGeometry(effect.radius, 32, 32);
                const explosionMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff4500,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                const mesh = new THREE.Mesh(explosionGeometry, explosionMaterial);
                mesh.position.set(effect.x, effect.y, 0);
                return mesh;
            case 'pulse':
                const pulseGeometry = new THREE.SphereGeometry(effect.radius, 32, 32);
                const pulseMaterial = new THREE.MeshBasicMaterial({
                    color: effect.color || 0x00ffff,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
                pulseMesh.position.set(effect.x, effect.y, 0);
                return pulseMesh;
            case 'wave':
                // We'll use a ring (torus) or a circle
                const waveGeometry = new THREE.RingGeometry(effect.radius, effect.radius + effect.width, 64);
                const waveMaterial = new THREE.MeshBasicMaterial({
                    color: effect.color || 0x00ffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
                waveMesh.position.set(effect.x, effect.y, 0);
                waveMesh.rotation.x = Math.PI / 2; // Lie flat on XY plane
                return waveMesh;
            case 'beam':
                // We'll use a cylinder
                const beamGeometry = new THREE.CylinderGeometry(effect.width / 2, effect.width / 2,
                    Math.sqrt(Math.pow(effect.endX - effect.startX, 2) + Math.pow(effect.endY - effect.startY, 2)), 32);
                const beamMaterial = new THREE.MeshBasicMaterial({
                    color: effect.color || 0xff00ff,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
                // Position at midpoint and rotate to align with beam direction
                const midX = (effect.startX + effect.endX) / 2;
                const midY = (effect.startY + effect.endY) / 2;
                const angle = Math.atan2(effect.endY - effect.startY, effect.endX - effect.startX);
                beamMesh.position.set(midX, midY, 0);
                beamMesh.rotation.z = angle;
                beamMesh.rotation.x = Math.PI / 2; // Lie flat on XY plane
                return beamMesh;
            case 'particle_burst':
                // We'll rely on the particle system for this, so return null or a placeholder
                // We'll skip creating a mesh and let the particle system handle it.
                return null;
            case 'ring':
                const ringGeometry = new THREE.RingGeometry(effect.radius, effect.radius + effect.width, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: effect.color || 0xffffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
                ringMesh.position.set(effect.x, effect.y, 0);
                ringMesh.rotation.x = Math.PI / 2;
                return ringMesh;
            case 'cone':
                // We'll use a cone geometry
                const coneGeometry = new THREE.ConeGeometry(effect.radius, effect.radius, 32);
                const coneMaterial = new THREE.MeshBasicMaterial({
                    color: effect.color || 0xff0000,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
                coneMesh.position.set(effect.x, effect.y, effect.radius / 2); // Adjust so tip is at (x,y,0)
                coneMesh.rotation.x = Math.PI / 2; // Lie flat on XY plane
                return coneMesh;
            default:
                // Generic effect: sphere
                const geometry = new THREE.SphereGeometry(effect.radius, 32, 32);
                const material = new THREE.MeshBasicMaterial({
                    color: effect.color || 0xffffff,
                    transparent: true,
                    opacity: effect.life / effect.maxLife
                });
                return new THREE.Mesh(geometry, material);
        }
    }

    /**
     * Update weapon effect mesh properties
     */
    updateWeaponEffectMesh(effect, mesh) {
        if (!mesh) return; // For particle_burst we return null

        // Update position and scale based on effect properties
        switch (effect.type) {
            case 'explosion':
                mesh.scale.set(
                    effect.radius / 10, // Assuming initial radius 10
                    effect.radius / 10,
                    effect.radius / 10
                );
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
            case 'pulse':
                mesh.scale.set(
                    effect.radius / 10,
                    effect.radius / 10,
                    effect.radius / 10
                );
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
            case 'wave':
                // Update inner and outer radius of the ring
                // We'll need to update the geometry, which is more complex.
                // For simplicity, we'll recreate the mesh when the effect changes significantly.
                // We'll skip for now.
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
            case 'beam':
                // Update length and position
                // We'll skip for simplicity.
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
            case 'particle_burst':
                // Handled by particle system
                break;
            case 'ring':
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
            case 'cone':
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
            default:
                if (mesh.material) {
                    mesh.material.opacity = effect.life / effect.maxLife;
                }
                break;
        }
    }

    /**
     * Draw particle effects (handled by particle system)
     */
    drawParticleEffects() {
        // Now handled by particle system in renderGameWorld
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
        // Update canvas size
        this.canvas.width = width;
        this.canvas.height = height;

        // Update Three.js renderer and camera
        this.renderer.setSize(width, height);
        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();

        // Update background plane
        if (this.backgroundMesh) {
            this.backgroundMesh.geometry.dispose();
            this.backgroundMesh.geometry = new THREE.PlaneGeometry(width, height);
        }

        // Update cached gradients and patterns
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

        // Dispose of Three.js objects
        this.scene.traverse(object => {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
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