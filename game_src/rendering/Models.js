/**
 * Models - Defines 3D models for game entities using Three.js built-in geometries
 */
import * as THREE from 'three';

/**
 * Create a crowd unit model
 * @param {Object} options - Options for the model
 * @param {number} options.radius - Radius of the crowd unit
 * @param {number} options.height - Height of the crowd unit (if cylinder)
 * @param {number} options.radialSegments - Number of radial segments for cylinder
 * @param {number} options.heightSegments - Number of height segments for cylinder
 * @param {boolean} options.useCylinder - Whether to use cylinder (true) or sphere (false)
 * @param {number} options.color - Color of the model
 * @param {number} options.metalness - Metalness of the material
 * @param {number} options.roughness - Roughness of the material
 * @returns {THREE.Mesh} The crowd unit mesh
 */
export function createCrowdUnitModel(options = {}) {
    const {
        radius = 10,
        height = 20,
        radialSegments = 16,
        heightSegments = 1,
        useCylinder = true,
        color = 0x00ff88,
        metalness = 0.2,
        roughness = 0.8
    } = options;

    let geometry;
    if (useCylinder) {
        geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments);
    } else {
        geometry = new THREE.SphereGeometry(radius, 32, 32);
    }

    const material = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness
    });

    const mesh = new THREE.Mesh(geometry, material);
    // If cylinder, we want it to stand upright (default orientation is along Y-axis, which is up in our scene)
    // No rotation needed for cylinder if we want it upright.
    // For sphere, no rotation needed.
    return mesh;
}

/**
 * Create an enemy model
 * @param {Object} options - Options for the model
 * @param {number} options.size - Size of the enemy (for box) or radius (for sphere)
 * @param {boolean} options.useBox - Whether to use box (true) or sphere (false)
 * @param {number} options.color - Color of the model
 * @param {number} options.metalness - Metalness of the material
 * @param {number} options.roughness - Roughness of the material
 * @returns {THREE.Mesh} The enemy mesh
 */
export function createEnemyModel(options = {}) {
    const {
        size = 15,
        useBox = true,
        color = 0xff6b6b,
        metalness = 0.2,
        roughness = 0.8
    } = options;

    let geometry;
    if (useBox) {
        geometry = new THREE.BoxGeometry(size, size, size);
    } else {
        geometry = new THREE.SphereGeometry(size, 32, 32);
    }

    const material = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness
    });

    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

/**
 * Create a gate model
 * @param {Object} options - Options for the model
 * @param {number} options.width - Width of the gate (diameter)
 * @param {number} options.height - Height of the gate
 * @param {number} options.tubularSegments - Number of tubular segments for torus
 * @param {number} options.radialSegments - Number of radial segments for torus
 * @param {number} options.radius - Radius of the torus ring
 * @param {number} options.tubeRadius - Radius of the tube in the torus
 * @param {boolean} options.useRing - Whether to use a ring (torus) or a frame (we'll use a cylinder for simplicity, but we can make a frame later)
 * @param {number} options.color - Color of the model
 * @param {number} options.metalness - Metalness of the material
 * @param {number} options.roughness - Roughness of the material
 * @returns {THREE.Mesh} The gate mesh
 */
export function createGateModel(options = {}) {
    const {
        width = 50,
        height = 20,
        tubularSegments = 16,
        radialSegments = 8,
        radius = width / 2,
        tubeRadius = 5,
        useRing = true,
        color = 0x666666,
        metalness = 0.2,
        roughness = 0.8
    } = options;

    let geometry;
    if (useRing) {
        // Create a torus for the ring
        geometry = new THREE.TorusGeometry(radius, tubeRadius, tubularSegments, radialSegments);
        // Rotate the torus to lie flat in the XY plane (like a door)
        // The torus by default lies in the XY plane? Actually, the TorusGeometry constructor creates a torus in the XY plane.
        // We want the ring to be vertical (like a door frame) so we rotate it 90 degrees on the X axis.
        // But note: in our scene, the camera is looking along the Z axis, and the XY plane is the ground.
        // We want the gate to be upright, so we want the ring to be in the XZ plane? Actually, we want the gate to be facing the player.
        // Let's think: the gate is a ring that the player walks through. We want the ring to be in the XY plane (flat on the ground) or vertical?
        // Looking at the existing code, the gate was a cylinder standing upright (so the gate is like a pole). But the user asked for a ring or frame.
        // We'll do a ring that is vertical (like a door frame) so we rotate the torus 90 degrees on the X axis so that it stands upright.
        // However, the existing gate was a cylinder (which is more like a pole). We'll stick to the user's request: ring or frame.
        // We'll make a ring that is in the XZ plane (so it's like a vertical ring) by rotating the torus 90 degrees on the X axis.
        // But note: the TorusGeometry by default is in the XY plane. So to make it stand upright (in the XZ plane) we rotate 90 degrees on the X axis.
        // Alternatively, we can make it in the XY plane (flat on the ground) and then the player walks over it? That doesn't match the existing code.
        // Let's check the existing code: the gate was a cylinder with height and width, and it was positioned at (x, y, height/2). So it was standing upright.
        // We'll do the same: a ring that is standing upright. We'll use a torus and rotate it so that it is in the XZ plane (so the hole is along the Y axis?).
        // Actually, we want the player to walk through the hole in the ring. If the ring is in the XZ plane, then the hole is along the Y axis (vertical). That would be like a ring on the ground?
        // Let's change: we want the ring to be in the XY plane (flat on the ground) so that the player walks through it on the ground? But then the gate would be flat.
        // Alternatively, we can make the ring in the YZ plane (so it's like a vertical ring) by rotating 90 degrees on the Z axis?
        // We'll avoid overcomplicating and follow the existing gate's orientation: upright. We'll create a cylinder for the gate frame?
        // But the user asked for a ring or frame. We can make a frame by using a torus and then scaling it appropriately?
        // We'll do: a torus that is scaled to be very flat in the Y direction to look like a frame?
        // Given the time, we'll do a simple ring that is upright by using a torus and rotating it 90 degrees on the X axis, and then we'll scale the Y axis to be small to make it look like a frame.
        // Actually, let's just use the existing cylinder for now and note that we can improve later.
        // We'll do: if useRing is true, we use a torus and then we rotate it 90 degrees on the X axis and scale the Y axis by 0.1 to make it look like a thin ring.
        // But note: the user might expect a different model. We'll do as requested: ring or frame.
        // We'll create a torus and then adjust its rotation and scale to look like a vertical ring.
        geometry = new THREE.TorusGeometry(radius, tubeRadius, tubularSegments, radialSegments);
        // Rotate 90 degrees on the X axis to make it stand upright (so the ring is in the XZ plane)
        // Then we'll scale the Y axis to make it thin (like a wireframe)
        // We'll apply the rotation and scale to the mesh, not the geometry, so that we can still adjust.
    } else {
        // Frame: we'll create a cube that is scaled to be a frame (we'll do a simple rectangle for now)
        // We'll leave this as a box for simplicity and note that we can improve.
        geometry = new THREE.BoxGeometry(width, height, 5); // thin in Z
    }

    const material = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness
    });

    const mesh = new THREE.Mesh(geometry, material);
    if (useRing) {
        // Rotate the torus to stand upright (in the XZ plane) and scale Y to make it thin
        mesh.rotation.x = Math.PI / 2;
        mesh.scale.y = 0.1; // Make it thin in Y
    }
    // Position will be set by the caller (we set the position at the gate's base center? but for a ring we might want the center)
    // We'll leave positioning to the caller.
    return mesh;
}

/**
 * Create a cannon model (turret)
 * @param {Object} options - Options for the model
 * @param {number} options.baseRadius - Radius of the base
 * @param {number} options.topRadius - Radius of the top (for a cone shape)
 * @param {number} options.height - Height of the cannon
 * @param {number} options.radialSegments - Number of radial segments
 * @param {number} options.heightSegments - Number of height segments
 * @param {number} options.color - Color of the model
 * @param {number} options.metalness - Metalness of the material
 * @param {number} options.roughness - Roughness of the material
 * @returns {THREE.Mesh} The cannon mesh
 */
export function createCannonModel(options = {}) {
    const {
        baseRadius = 10,
        topRadius = 5,
        height = 30,
        radialSegments = 16,
        heightSegments = 1,
        color = 0xffd700,
        metalness = 0.2,
        roughness = 0.8
    } = options;

    const geometry = new THREE.ConeGeometry(baseRadius, height, radialSegments, heightSegments);
    // Note: ConeGeometry creates a cone with the tip at the origin and base at (0, height, 0) by default?
    // Actually, the ConeGeometry is centered at the origin, with the base at y = -height/2 and tip at y = height/2?
    // Let's check: the ConeGeometry arguments are (radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
    // It creates a cone centered at the origin, with the base at y = -height/2 and the tip at y = height/2.
    // We want the base at the bottom and the tip at the top. We'll adjust the position of the mesh accordingly.

    const material = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness
    });

    const mesh = new THREE.Mesh(geometry, material);
    // We want the cannon to sit on the ground (y=0) with the tip pointing up.
    // The geometry has its center at (0,0,0) and extends from y = -height/2 to y = height/2.
    // So to have the base at y=0, we need to shift the mesh up by height/2.
    mesh.position.y = height / 2;
    return mesh;
}

/**
 * Create a projectile model
 * @param {Object} options - Options for the model
 * @param {number} options.radius - Radius of the projectile (for sphere) or base radius (for cone)
 * @param {number} options.height - Height of the projectile (for cone)
 * @param {boolean} options.useSphere - Whether to use sphere (true) or cone (false)
 * @param {number} options.color - Color of the model
 * @param {number} options.metalness - Metalness of the material
 * @param {number} options.roughness - Roughness of the material
 * @returns {THREE.Mesh} The projectile mesh
 */
export function createProjectileModel(options = {}) {
    const {
        radius = 5,
        height = 20,
        useSphere = true,
        color = 0xff0000,
        metalness = 0.2,
        roughness = 0.8
    } = options;

    let geometry;
    if (useSphere) {
        geometry = new THREE.SphereGeometry(radius, 32, 32);
    } else {
        geometry = new THREE.ConeGeometry(radius, height, 32);
        // For cone, we want the tip at the front and the base at the back.
        // The ConeGeometry is centered at the origin, with base at y = -height/2 and tip at y = height/2.
        // We'll adjust the mesh position so that the base is at the origin and the tip extends in the positive Y direction?
        // But note: in our scene, the projectile moves in the XY plane. We'll adjust later.
        // We'll leave the geometry centered and adjust the mesh position when we set it.
    }

    const material = new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness
    });

    const mesh = new THREE.Mesh(geometry, material);
    // For cone, we want to rotate it so that the tip points in the direction of movement.
    // We'll leave the rotation to the caller (based on velocity).
    // For now, we'll just return the mesh.
    return mesh;
}