---
name: canvas-game-dev
description: Develop high-performance HTML5 Canvas 2D/3D browser games, game loops, physics simulations, spatial partitioning, particle engines, and fluid 60FPS animations.
---

# Canvas Game Dev Skill

This skill guides the design, rendering pipeline, physics systems, and optimization of browser games and interactive graphics using HTML5 `<canvas>`, WebGL, and Three.js.

## High-Performance Game Architecture

1. **Fixed Timestep Game Loop**:
   - Never tie physics calculations directly to raw frame rate; use delta time (`dt`) or fixed-step integration to keep movement consistent across 60Hz, 120Hz, and lag spikes.
   - Use `requestAnimationFrame` for the render cycle.
   ```javascript
   let lastTime = performance.now();
   function gameLoop(currentTime) {
     const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap to prevent spiral of death
     lastTime = currentTime;
     update(dt);
     render();
     requestAnimationFrame(gameLoop);
   }
   ```
2. **Entity-Component & Object Pooling**:
   - Reuse object instances (bullets, particles, enemies) in pools instead of creating new objects every frame, eliminating garbage collection pauses.
3. **Collision Detection & Spatial Partitioning**:
   - Use Axis-Aligned Bounding Box (AABB) or circle distance checks for quick narrow-phase collision.
   - Use Spatial Hash Grids or Quadtrees when handling large numbers of moving entities (>100) to drop collision complexity from \(O(n^2)\) to \(O(n)\).
4. **Smooth Responsive Controls**:
   - Support keyboard (WASD/Arrows), mouse pointer lock, and touch thumbsticks for mobile.
   - Buffer inputs for responsiveness.

## Visual Polish Checklist

- [ ] **Camera Smoothing**: Implement lerp (linear interpolation) camera following.
- [ ] **Particle Systems**: Explosions, trails, dust puffs on jump/landing, and sparkles.
- [ ] **Screen Shake**: Subtle rotational and positional shake on high-impact events.
- [ ] **Sound FX Integration**: Web Audio API synthesized SFX or audio buffers.

## Invocation Examples
- `/canvas-game-dev Add a spatial hash grid to optimize collisions between 500 characters`
- "Implement smooth 3D camera controls and collision response in Three.js/Canvas."
- "Build a particle explosion engine with pooled particles and fading alpha."
