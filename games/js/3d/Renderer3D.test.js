// Test for 3D Renderer functionality
// Tests rendering, entity positioning, and basic interaction

// This test file is designed to work with the simple test runner in test-runner.html

import { Renderer3D } from './Renderer3D.js';

// Mock canvas for testing
function createMockCanvas(width = 800, height = 600) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.clientWidth = width;
    canvas.clientHeight = height;
    return canvas;
}

// Mock config
const mockConfig = {
    // Add any config properties the renderer might need
};

// Test functions that will be called by the test runner
function runRendererTests(testRunner) {
    // Test 1: Initialization
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        testRunner.assert(
            renderer.scene instanceof THREE.Scene,
            'Renderer has a THREE.Scene instance'
        );

        testRunner.assert(
            renderer.camera instanceof THREE.PerspectiveCamera,
            'Renderer has a THREE.PerspectiveCamera instance'
        );

        testRunner.assert(
            renderer.renderer instanceof THREE.WebGLRenderer,
            'Renderer has a THREE.WebGLRenderer instance'
        );

        testRunner.assert(
            renderer.scene.background instanceof THREE.Color,
            'Renderer scene has a background color'
        );

        renderer.dispose();
    }, 'Renderer Initialization');

    // Test 2: Lighting setup
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        testRunner.assert(
            renderer.ambientLight instanceof THREE.AmbientLight,
            'Renderer has ambient light'
        );

        testRunner.assert(
            renderer.directionalLight instanceof THREE.DirectionalLight,
            'Renderer has directional light'
        );

        const lightCount = renderer.scene.children.filter(child =>
            child instanceof THREE.Light).length;

        testRunner.assert(
            lightCount >= 2,
            `Renderer has at least 2 lights (found ${lightCount})`
        );

        renderer.dispose();
    }, 'Lighting Setup');

    // Test 3: Adding crowd unit
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        const position = new THREE.Vector3(0, 1, 0);
        const crowdUnit = renderer.addCrowdUnit(position, 0x38bdf8);

        testRunner.assert(
            crowdUnit instanceof THREE.Mesh,
            'Crowd unit is a THREE.Mesh'
        );

        testRunner.assert(
            crowdUnit.position.equals(position),
            'Crowd unit has correct position'
        );

        testRunner.assert(
            crowdUnit.material.color.getHex() === 0x38bdf8,
            'Crowd unit has correct color'
        );

        testRunner.assert(
            crowdUnit.castShadow && crowdUnit.receiveShadow,
            'Crowd unit has shadow properties set'
        );

        testRunner.assert(
            renderer.crowdUnits.includes(crowdUnit),
            'Crowd unit is stored in renderer crowdUnits array'
        );

        testRunner.assert(
            renderer.scene.children.includes(crowdUnit),
            'Crowd unit is added to scene'
        );

        renderer.dispose();
    }, 'Add Crowd Unit');

    // Test 4: Adding enemy with different types
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        // Test basic enemy
        const basicEnemy = renderer.addEnemy(
            new THREE.Vector3(5, 0, -10),
            'basic',
            0xef4444
        );

        testRunner.assert(
            basicEnemy instanceof THREE.Mesh,
            'Basic enemy is a THREE.Mesh'
        );

        testRunner.assert(
            basicEnemy.geometry instanceof THREE.SphereGeometry,
            'Basic enemy uses SphereGeometry'
        );

        testRunner.assert(
            basicEnemy.material.color.getHex() === 0xef4444,
            'Basic enemy has correct color'
        );

        // Test fast enemy
        const fastEnemy = renderer.addEnemy(
            new THREE.Vector3(0, 0, 0),
            'fast',
            0xf97316
        );

        testRunner.assert(
            fastEnemy.geometry instanceof THREE.SphereGeometry,
            'Fast enemy uses SphereGeometry'
        );

        // Test tank enemy
        const tankEnemy = renderer.addEnemy(
            new THREE.Vector3(0, 0, 0),
            'tank',
            0x6b7280
        );

        testRunner.assert(
            tankEnemy.geometry instanceof THREE.BoxGeometry,
            'Tank enemy uses BoxGeometry'
        );

        renderer.dispose();
    }, 'Add Enemy Types');

    // Test 5: Adding gate
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        const position = new THREE.Vector3(0, 0, -20);
        const gateData = { type: 'add', text: '+5' };
        const gate = renderer.addGate(position, gateData, 3);

        testRunner.assert(
            gate instanceof THREE.Group,
            'Gate is a THREE.Group'
        );

        testRunner.assert(
            gate.position.equals(position),
            'Gate has correct position'
        );

        testRunner.assert(
            gate.userData.type === 'gate',
            'Gate has correct userData type'
        );

        testRunner.assert(
            gate.userData.gateData === gateData,
            'Gate stores gateData correctly'
        );

        // Check for mesh child (the ring)
        const gateMesh = gate.children.find(child => child instanceof THREE.Mesh);
        testRunner.assert(
            gateMesh !== undefined,
            'Gate has a mesh child'
        );

        testRunner.assert(
            gateMesh.geometry instanceof THREE.RingGeometry,
            'Gate mesh uses RingGeometry'
        );

        // Check for text sprite
        const textSprite = gate.children.find(child => child instanceof THREE.Sprite);
        testRunner.assert(
            textSprite !== undefined,
            'Gate has a text sprite'
        );

        testRunner.assert(
            renderer.gates.includes(gate),
            'Gate is stored in renderer gates array'
        );

        testRunner.assert(
            renderer.scene.children.includes(gate),
            'Gate is added to scene'
        );

        renderer.dispose();
    }, 'Add Gate');

    // Test 6: Adding projectile
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        const position = new THREE.Vector3(0, 1, 0);
        const direction = new THREE.Vector3(0, 0, -1).normalize();
        const weaponData = {
            color: 0x38bdf8,
            projectileSpeed: 10,
            damage: 25,
            piercing: false
        };

        const projectile = renderer.addProjectile(
            position,
            direction,
            weaponData,
            false
        );

        testRunner.assert(
            projectile instanceof THREE.Mesh,
            'Projectile is a THREE.Mesh'
        );

        testRunner.assert(
            projectile.position.equals(position),
            'Projectile has correct initial position'
        );

        testRunner.assert(
            projectile.userData.type === 'projectile',
            'Projectile has correct userData type'
        );

        const expectedVelocity = direction.clone().multiplyScalar(10);
        testRunner.assert(
            projectile.userData.velocity.equals(expectedVelocity),
            'Projectile has correct velocity'
        );

        testRunner.assert(
            projectile.userData.damage === 25,
            'Projectile has correct damage'
        );

        // Test charged projectile
        const chargedProjectile = renderer.addProjectile(
            position,
            direction,
            weaponData,
            true
        );

        testRunner.assert(
            chargedProjectile.userData.velocity.length() >
            projectile.userData.velocity.length(),
            'Charged projectile has greater velocity'
        );

        testRunner.assert(
            chargedProjectile.userData.damage > projectile.userData.damage,
            'Charged projectile has greater damage'
        );

        renderer.dispose();
    }, 'Add Projectile');

    // Test 7: Update function
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        // Add a crowd unit
        const crowdUnit = renderer.addCrowdUnit(
            new THREE.Vector3(0, 0, 0),
            0x38bdf8
        );
        const initialY = crowdUnit.position.y;

        // Add an enemy
        const enemy = renderer.addEnemy(
            new THREE.Vector3(0, 0, -20),
            'basic',
            0xef4444
        );
        const initialEnemyZ = enemy.position.z;

        // Update renderer (simulate one frame)
        const deltaTime = 0.016; // ~60 FPS
        renderer.update(deltaTime);

        // Just check that the function runs without throwing
        testRunner.assert(
            true,
            'Update function runs without throwing'
        );

        renderer.dispose();
    }, 'Update Function');

    // Test 8: Window resize handling
    testRunner.runTest(() => {
        const canvas = createMockCanvas();
        const renderer = new Renderer3D(canvas, mockConfig);

        const originalAspect = renderer.camera.aspect;

        // Resize
        canvas.clientWidth = 1024;
        canvas.clientHeight = 768;
        renderer.onWindowResize();

        testRunner.assert(
            Math.abs(renderer.camera.aspect - (1024/768)) < 0.001,
            'Camera aspect ratio updated on resize'
        );

        renderer.dispose();
    }, 'Window Resize Handling');
}

// Export the test function for use in test runner
if (typeof window !== 'undefined') {
    window.runRendererTests = runRendererTests;
}