/**
 * 3D Renderer - Handles all 3D rendering using Three.js
 * Replaces the 2D Canvas renderer with full Three.js 3D scene
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Renderer3D {
    constructor(canvas, config) {
        this.config = config;
        this.canvas = canvas;

        // Three.js core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Lighting
        this.ambientLight = null;
        this.directionalLight = null;

        // Game entities storage
        this.crowdUnits = [];
        this.enemies = [];
        this.gates = [];
        this.projectiles = [];
        this.powerups = [];
        this.boss = null;

        // Visual effects
        this.particleSystems = [];
        this.explosions = [];

        // Raycaster for 3D picking/collision
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Animation mixers for animated models
        this.mixers = [];

        // Initialize the 3D scene
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x070913); // Dark background matching game theme

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1, // near
            1000 // far
        );
        this.camera.position.set(0, 20, 40); // Initial position
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add lighting
        this.setupLighting();

        // Add controls (orbit for debugging, can be removed/replaced for fixed camera)
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.enableZoom = true;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.8;

        // Set up responsive resizing
        window.addEventListener('resize', () => this.onWindowResize());

        // Add ambient occlusion and other post-processing if desired
        this.setupEnvironment();

        console.log('3D Renderer initialized successfully');
    }

    setupLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(this.ambientLight);

        // Directional light (sun)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(50, 100, 50);
        this.directionalLight.castShadow = true;

        // Shadow properties
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;

        this.scene.add(this.directionalLight);

        // Additional fill lights for better illumination
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight1.position.set(-50, 50, -50);
        this.scene.add(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
        fillLight2.position.set(0, 50, 50);
        this.scene.add(fillLight2);
    }

    setupEnvironment() {
        // Add a subtle grid for reference (can be removed)
        const size = 200;
        const divisions = 20;

        const gridHelper = new THREE.GridHelper(size, divisions, 0x38bdf8, 0x38bdf8);
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Add coordinate axes for debugging (can be removed)
        const axesHelper = new THREE.AxesHelper(10);
        axesHelper.visible = false; // Set to true for debugging
        this.scene.add(axesHelper);
    }

    onWindowResize() {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    // =========================================================================
    // ENTITY MANAGEMENT METHODS
    // =========================================================================

    addCrowdUnit(position, color = 0x38bdf8) {
        // Create a simple 3D person/cylinder for crowd unit
        const geometry = new THREE.CylinderGeometry(0.8, 0.8, 2, 8);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.8
        });
        const crowdUnit = new THREE.Mesh(geometry, material);
        crowdUnit.position.copy(position);
        crowdUnit.castShadow = true;
        crowdUnit.receiveShadow = true;

        // Add bobbing animation data
        crowdUnit.userData = {
            type: 'crowd',
            bobOffset: Math.random() * Math.PI * 2,
            bobSpeed: 1 + Math.random() * 0.5,
            originalY: position.y
        };

        this.scene.add(crowdUnit);
        this.crowdUnits.push(crowdUnit);
        return crowdUnit;
    }

    addEnemy(position, type = 'basic', color = 0xef4444) {
        let geometry, material;

        switch(type) {
            case 'basic':
                geometry = new THREE.SphereGeometry(1, 8, 8);
                break;
            case 'fast':
                geometry = new THREE.SphereGeometry(0.8, 6, 6);
                break;
            case 'tank':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                break;
            case 'shield':
                geometry = new THREE.SphereGeometry(1.2, 8, 8);
                break;
            case 'bomber':
                geometry = new THREE.ConeGeometry(1, 2, 8);
                break;
            case 'healer':
                geometry = new THREE.SphereGeometry(1, 8, 8);
                break;
            default:
                geometry = new THREE.SphereGeometry(1, 8, 8);
        }

        material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.1,
            roughness: 0.9
        });

        const enemy = new THREE.Mesh(geometry, material);
        enemy.position.copy(position);
        enemy.castShadow = true;
        enemy.receiveShadow = true;

        // Store enemy data
        enemy.userData = {
            type: 'enemy',
            enemyType: type,
            originalColor: color,
            hasShield: type === 'shield',
            zigzagAngle: Math.random() * Math.PI * 2,
            speed: 0.75 // base speed, will be modified by level
        };

        // Add shield if needed
        if (type === 'shield') {
            const shieldGeometry = new THREE.SphereGeometry(1.6, 12, 12);
            const shieldMaterial = new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.3,
                metalness: 0.8,
                roughness: 0.2
            });
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.name = 'shield';
            enemy.add(shield);
        }

        this.scene.add(enemy);
        this.enemies.push(enemy);
        return enemy;
    }

    addGate(position, data, size = 3) {
        // Create gate as a ring/frame with visible value
        const gateGroup = new THREE.Group();

        // Gate background (ring/torus)
        let geometry;
        let color;

        switch(data.type) {
            case 'add':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0x10b981; // Green
                break;
            case 'mult':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0x3b82f6; // Blue
                break;
            case 'sub':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0xf87171; // Red
                break;
            case 'div':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0xf59e0b; // Orange
                break;
            case 'frenzy':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0xa855f7; // Purple
                break;
            case 'shield':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0x38bdf8; // Cyan
                break;
            case 'mystery':
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0xec4899; // Pink
                break;
            default:
                geometry = new THREE.RingGeometry(size - 0.5, size, 32);
                color = 0x6b7280; // Gray
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.2,
            roughness: 0.3,
            emissive: color,
            emissiveIntensity: 0.5
        });

        const gate = new THREE.Mesh(geometry, material);
        gate.rotation.x = Math.PI / 2; // Lay flat
        gate.position.set(position.x, 0.1, position.z); // Slightly above ground
        gate.castShadow = true;
        gate.receiveShadow = true;

        // Add text sprite for value
        const textSprite = this.createTextSprite(data.text, color);
        textSprite.position.set(0, 0.2, 0);
        gate.add(textSprite);

        // Store gate data
        gate.userData = {
            type: 'gate',
            gateData: data,
            hp: data.type === 'mult' ? 14 : 8,
            maxHp: data.type === 'mult' ? 14 : 8,
            active: true,
            isOscillating: false,
            oscBaseX: position.x,
            oscAmp: 0,
            speed: 0
        };

        gateGroup.add(gate);
        gateGroup.position.set(position.x, 0, position.z);

        this.scene.add(gateGroup);
        this.gates.push(gateGroup);
        return gateGroup;
    }

    createTextSprite(text, color) {
        // Create a canvas texture for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#ffffff';
        context.fillText(text, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        return new THREE.Sprite(spriteMaterial);
    }

    addProjectile(position, direction, weaponData, isCharged = false) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        let color = new THREE.Color(weaponData.color);

        // Modify color based on charge
        if (isCharged) {
            color.offsetHSL(0, 0.3, 0.2); // Make brighter when charged
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: isCharged ? 0.8 : 0.5,
            metalness: 0.3,
            roughness: 0.2
        });

        const projectile = new THREE.Mesh(geometry, material);
        projectile.position.copy(position);
        projectile.castShadow = true;
        projectile.receiveShadow = false;

        // Store projectile data
        projectile.userData = {
            type: 'projectile',
            velocity: new THREE.Vector3(
                direction.x * (weaponData.projectileSpeed * (isCharged ? 1.4 : 1.0)),
                direction.y * (weaponData.projectileSpeed * (isCharged ? 1.4 : 1.0)),
                direction.z * (weaponData.projectileSpeed * (isCharged ? 1.4 : 1.0))
            ),
            damage: weaponData.damage * (isCharged ? 2.5 : 1.0),
            piercing: weaponData.piercing || false,
            isExplosive: weaponData.isExplosive || false,
            isVortex: weaponData.isVortex || false,
            radius: 0.3 * (isCharged ? 1.5 : 1.0)
        };

        this.scene.add(projectile);
        this.projectiles.push(projectile);
        return projectile;
    }

    addPowerup(position, type) {
        let geometry, material, color;

        switch(type) {
            case 'nuke':
                geometry = new THREE.DodecahedronGeometry(0.8);
                color = 0x8b5cf6; // Violet
                break;
            case 'fire':
                geometry = new THREE.TetrahedronGeometry(0.8);
                color = 0xf97316; // Orange
                break;
            case 'freeze':
                geometry = new THREE.IcosahedronGeometry(0.8);
                color = 0x06b6d4; // Cyan
                break;
            case 'magnet':
                geometry = new THREE.OctahedronGeometry(0.8);
                color = 0x10b981; // Green
                break;
            case 'coin':
                geometry = new THREE.TorusGeometry(0.7, 0.2, 8, 16);
                color = 0xfbbf24; // Gold
                break;
            default:
                geometry = new THREE.SphereGeometry(0.6);
                color = 0x6b7280; // Gray
        }

        material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.8,
            roughness: 0.1,
            emissive: color,
            emissiveIntensity: 0.3
        });

        const powerup = new THREE.Mesh(geometry, material);
        powerup.position.copy(position);
        powerup.castShadow = true;
        powerup.receiveShadow = false;

        // Add floating animation
        powerup.userData = {
            type: 'powerup',
            powerupType: type,
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: 1 + Math.random() * 0.5,
            originalY: position.y,
            bobOffset: 0,
            bobSpeed: 2
        };

        this.scene.add(powerup);
        this.powerups.push(powerup);
        return powerup;
    }

    setBoss(bossData) {
        // Remove existing boss if any
        if (this.boss) {
            this.scene.remove(this.boss);
            this.boss = null;
        }

        if (!bossData) return null;

        // Create boss as a larger, more detailed entity
        const bossGroup = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(3, 2, 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: bossData.color,
            metalness: 0.5,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        body.receiveShadow = true;
        bossGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: bossData.color,
            metalness: 0.3,
            roughness: 0.4
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2;
        head.castShadow = true;
        head.receiveShadow = true;
        bossGroup.add(head);

        // Add details based on boss type
        // This could be expanded with more detailed models for each boss type

        bossGroup.position.set(bossData.x, 0, bossData.z);
        bossGroup.userData = {
            type: 'boss',
            bossData: bossData,
            hp: bossData.hp,
            maxHp: bossData.maxHp,
            phase: 1,
            isEnraged: false,
            shootTimer: 0,
            shootInterval: 2.4
        };

        this.scene.add(bossGroup);
        this.boss = bossGroup;
        return bossGroup;
    }

    // =========================================================================
    // UPDATE METHODS (called each frame)
    // =========================================================================

    update(deltaTime) {
        // Update crowd units (bobbing animation)
        this.crowdUnits.forEach(unit => {
            const data = unit.userData;
            if (data && data.type === 'crowd') {
                const bobOffset = Math.sin(Date.now() * 0.002 + data.bobOffset) * 0.3;
                unit.position.y = data.originalY + bobOffset;
                unit.rotation.y += 0.01; // Slow rotation
            }
        });

        // Update enemies
        this.enemies.forEach(enemy => {
            const data = enemy.userData;
            if (data && data.type === 'enemy') {
                // Apply level-based speed
                const baseSpeed = data.speed * 0.75; // Base movement speed

                // Apply freeze effect if world is frozen
                if (data.isFrozenWorld) {
                    enemy.position.y += 0; // Frozen in place
                } else {
                    // Normal movement
                    enemy.position.z += baseSpeed; // Moving toward player

                    // Add zigzag for fast enemies
                    if (data.enemyType === 'fast') {
                        data.zigzagAngle += deltaTime * 5;
                        enemy.position.x += Math.sin(data.zigzagAngle) * 2 * deltaTime;
                    }
                }

                // Update shield visibility
                if (data.hasShield && enemy.children.length > 0) {
                    const shield = enemy.children.find(child => child.name === 'shield');
                    if (shield) {
                        shield.visible = true;
                        // Pulse shield
                        shield.scale.set(1 + Math.sin(Date.now() * 0.005) * 0.2,
                                       1 + Math.sin(Date.now() * 0.005) * 0.2,
                                       1 + Math.sin(Date.now() * 0.005) * 0.2);
                    }
                }

                // Update color if taking damage (flash effect)
                if (data.flashTimer && data.flashTimer > 0) {
                    enemy.material.color.set(0xffffff);
                    data.flashTimer -= deltaTime * 10;
                } else {
                    enemy.material.color.set(data.originalColor);
                }
            }
        });

        // Update projectiles
        this.projectiles.forEach((projectile, index) => {
            const data = projectile.userData;
            if (data && data.type === 'projectile') {
                // Move projectile
                projectile.position.add(
                    data.velocity.clone().multiplyScalar(deltaTime)
                );

                // Add trail effect for fast projectiles
                if (data.velocity.length() > 5) {
                    this.createProjectileTrail(projectile);
                }

                // Check bounds (simple distance check)
                if (projectile.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 200) {
                    this.scene.remove(projectile);
                    this.projectiles.splice(index, 1);
                }
            }
        });

        // Update gates (movement and oscillation)
        this.gates.forEach(gate => {
            const data = gate.userData;
            if (data && data.type === 'gate') {
                // Apply oscillation if moving gate
                if (data.isOscillating) {
                    const time = Date.now() * 0.001;
                    gate.position.x = data.oscBaseX +
                                    Math.sin(time * data.speed + data.oscBaseX * 0.1) * data.oscAmp;
                }

                // Move gate forward
                gate.position.z += 0.5 * deltaTime; // Adjust speed as needed

                // Remove if past player
                if (gate.position.z > 50) {
                    this.scene.remove(gate);
                    const index = this.gates.indexOf(gate);
                    if (index > -1) this.gates.splice(index, 1);
                }
            }
        });

        // Update powerups (floating animation)
        this.powerups.forEach(powerup => {
            const data = powerup.userData;
            if (data && data.type === 'powerup') {
                // Float up and down
                const floatOffset = Math.sin(Date.now() * 0.002 + data.floatOffset) * 0.5;
                powerup.position.y = data.originalY + floatOffset;

                // Rotate
                powerup.rotation.y += deltaTime * 2;
                powerup.rotation.x += deltaTime * 1;
            }
        });

        // Update boss
        if (this.boss) {
            const data = this.boss.userData;
            if (data && data.type === 'boss') {
                // Update shoot timer
                data.shootTimer += deltaTime;

                // Boss movement (hover, sway)
                const time = Date.now() * 0.0005;
                this.boss.position.x = Math.sin(time * 0.3) * 10;
                this.boss.position.z = 20 + Math.cos(time * 0.2) * 5; // Slow approach

                // Enrage effect
                if (data.isEnraged) {
                    // Pulse red when enraged
                    const intensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
                    this.boss.traverse(child => {
                        if (child.isMesh) {
                            child.material.emissiveIntensity = intensity;
                        }
                    });
                }
            }
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }
    }

    createProjectileTrail(projectile) {
        // Create a temporary trail effect
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: projectile.material.color,
            transparent: true,
            opacity: 0.3
        });

        // Simple trail - in a full implementation, you'd use a more sophisticated system
        const positions = [
            0, 0, 0,
            -projectile.userData.velocity.x * 0.1,
            -projectile.userData.velocity.y * 0.1,
            -projectile.userData.velocity.z * 0.1
        ];

        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const trail = new THREE.Line(trailGeometry, trailMaterial);
        trail.position.copy(projectile.position);
        this.scene.add(trail);

        // Remove trail after short time
        setTimeout(() => {
            if (trail.parent) {
                this.scene.remove(trail);
                trail.geometry.dispose();
                trail.material.dispose();
            }
        }, 100);
    }

    // =========================================================================
    // RENDERING
    // =========================================================================

    render() {
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // =========================================================================
    // CLEANUP AND DISPOSAL
    // =========================================================================

    dispose() {
        // Dispose of geometries and materials
        this.traverseDispose(this.scene);

        // Dispose of render target if any
        if (this.renderer) {
            this.renderer.dispose();
        }

        // Cancel animations
        this.mixers.forEach(mixer => mixer.stopAllAction());
        this.mixers = [];
    }

    traverseDispose(object) {
        object.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }

            if (child.isLight) {
                child.dispose();
            }
        });
    }
}