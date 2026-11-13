# NEBULA: Deep Space Landing Page — Design Specification

**Version**: 1.0  
**Target**: Single self-contained HTML file  
**Performance Budget**: 60 FPS @ 4K, <100ms TTI, <2MB total  
**Accessibility**: WCAG 2.1 AA, prefers-reduced-motion, semantic HTML, ARIA

---

## 1. VISUAL DESIGN LANGUAGE

### 1.1 Color Palette (CSS Custom Properties)

```css
:root {
  /* Deep Space Base */
  --space-900: #030308;      /* Near-black background */
  --space-800: #0a0a14;      /* Card backgrounds */
  --space-700: #121220;      /* Elevated surfaces */
  --space-600: #1a1a2e;      /* Borders, subtle elements */

  /* H-Alpha Emission (Ionized Hydrogen) */
  --h-alpha-400: #ff2d6a;    /* Bright emission */
  --h-alpha-500: #e01a5a;    /* Core emission */
  --h-alpha-600: #b81448;    /* Deep emission */
  --h-alpha-glow: rgba(255, 45, 106, 0.6);

  /* O-III Forbidden Line (Doubly Ionized Oxygen) */
  --oiii-400: #00d4ff;       /* Bright teal */
  --oiii-500: #00b8e6;       /* Core teal */
  --oiii-600: #009acc;       /* Deep teal */
  --oiii-glow: rgba(0, 212, 255, 0.5);

  /* S-II (Singly Ionized Sulfur) */
  --sii-400: #ffb800;        /* Gold/amber */
  --sii-500: #e6a000;        /* Core gold */
  --sii-600: #cc8800;        /* Deep gold */
  --sii-glow: rgba(255, 184, 0, 0.5);

  /* Cosmic Radiation / High Energy */
  --cosmic-400: #bf5fff;     /* Electric purple */
  --cosmic-500: #a040e0;     /* Core purple */
  --cosmic-600: #7b2dbb;     /* Deep purple */
  --cosmic-glow: rgba(191, 95, 255, 0.4);

  /* Stellar White / Hot Stars */
  --stellar-100: #fff8f0;    /* Warm stellar white */
  --stellar-200: #ffe8d8;    /* Cool stellar white */

  /* Magnetic Field Lines */
  --field-400: #00ffc8;      /* Cyan field lines */
  --field-500: #00e6b0;      /* Core field */
  --field-glow: rgba(0, 255, 200, 0.3);

  /* Semantic */
  --text-primary: #ffffff;
  --text-secondary: #b8c0d0;
  --text-muted: #788098;
  --focus-ring: var(--oiii-400);
}
```

### 1.2 Typography Scale

```css
/* Fluid clamping: mobile (320px) → desktop (1440px) → 4K (3840px) */
--font-display: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-ui: 'DM Sans', 'Inter', system-ui, sans-serif;

--step--2: clamp(0.69rem, 0.64rem + 0.26vw, 0.88rem);   /* 11px → 14px */
--step--1: clamp(0.83rem, 0.75rem + 0.42vw, 1.13rem);   /* 13px → 18px */
--step-0:  clamp(1rem, 0.88rem + 0.63vw, 1.44rem);      /* 16px → 23px */
--step-1:  clamp(1.2rem, 1.03rem + 0.85vw, 1.85rem);    /* 19px → 30px */
--step-2:  clamp(1.44rem, 1.2rem + 1.2vw, 2.38rem);     /* 23px → 38px */
--step-3:  clamp(1.73rem, 1.4rem + 1.65vw, 3.05rem);    /* 28px → 49px */
--step-4:  clamp(2.07rem, 1.63rem + 2.2vw, 3.92rem);    /* 33px → 63px */
--step-5:  clamp(2.49rem, 1.9rem + 2.95vw, 5.04rem);    /* 40px → 81px */
--step-6:  clamp(2.99rem, 2.22rem + 3.85vw, 6.48rem);   /* 48px → 104px */
```

### 1.3 Spacing & Layout Tokens

```css
--space-unit: clamp(4px, 3.2px + 0.4vw, 6px);
--space-xs: var(--space-unit);           /* 4-6px */
--space-sm: calc(var(--space-unit) * 2);  /* 8-12px */
--space-md: calc(var(--space-unit) * 4);  /* 16-24px */
--space-lg: calc(var(--space-unit) * 6);  /* 24-36px */
--space-xl: calc(var(--space-unit) * 10); /* 40-60px */
--space-2xl: calc(var(--space-unit) * 16); /* 64-96px */
--space-3xl: calc(var(--space-unit) * 24); /* 96-144px */

--container-max: 1400px;
--container-padding: clamp(20px, 4vw, 80px);
--header-height: clamp(60px, 5vh, 80px);
```

### 1.4 Visual Effects Vocabulary

| Effect | Description | Implementation |
|--------|-------------|----------------|
| **Volumetric Nebula** | 3D fractal noise raymarched density field | WebGL fragment shader, 3D fBm + curl noise |
| **Magnetic Field Lines** | Animated flux tubes following B-field | GPU particle trails, biot-savart approximation |
| **Ionized Gas Particles** | Charged particles in E×B drift | Compute shader or GPU instanced points |
| **Stellar Nursery** | Protostar formation with accretion disks | Morphing signed distance fields |
| **Cosmic Ray Bursts** | High-energy particle cascades | Screen-space radial blur + additive particles |
| **Gravitational Lensing** | Spacetime distortion around mass | Spherical distortion in fragment shader |
| **Aurora Shimmer** | Curtain-like wave interference | Gerstner waves in vertex shader + Fresnel |
| **Pulsar Beams** | Rotating lighthouse emission | Conic gradient + rotation + Doppler shift |

---

## 2. SECTION ARCHITECTURE & ANIMATION CHOREOGRAPHY

### 2.1 Section Map & Scroll Progress

```
Scroll Progress (0.0 → 1.0)
├── 0.00–0.12  ▸ HERO: Immersive nebula viewport
├── 0.12–0.25  ▸ ABOUT: What is a Nebula (animated diagrams)
├── 0.25–0.40  ▸ TYPES: 5 nebula types carousel
├── 0.40–0.55  ▸ FORMATION: Stellar nursery timelapse
├── 0.55–0.72  ▸ GALLERY: Famous nebulae 3D cards
├── 0.72–0.88  ▸ SCIENCE: Spectroscopy, B-fields, lifecycle
└── 0.88–1.00  ▸ CTA: Particle explosion → "Explore the Cosmos"
```

### 2.2 Hero Section (0.00–0.12)

**Visual**: Full-viewport WebGL canvas with volumetric nebula. Title "NEBULA" emerges from gas clouds.

| Scroll Range | Animation |
|--------------|-----------|
| 0.00–0.04 | Camera pulls back from nebula core (FOV 90°→60°) |
| 0.04–0.08 | Title letters materialize: each character forms from particle condensation |
| 0.08–0.12 | Subtitle fades in with aurora shimmer underline; mouse parallax activates |

**Interactive**: Mouse position → 2D offset in shader uniforms (nebula drift ±15%). Touch → same.

**Reduced Motion**: Static nebula render, instant title reveal, no parallax.

### 2.3 About Section (0.12–0.25)

**Visual**: Split layout — left: animated diagram, right: prose with scroll-reveal.

| Scroll Range | Animation |
|--------------|-----------|
| 0.12–0.16 | Diagram: gas cloud collapses under gravity (2D simulation) |
| 0.16–0.20 | Ionization front propagates outward (shader: expanding shell) |
| 0.20–0.25 | Magnetic field lines thread through cloud (animated streamlines) |

**Diagram Shader**: 2D fragment shader on `<canvas>` — reaction-diffusion (Gray-Scott) for ionization fronts.

### 2.4 Types Section (0.25–0.40)

**Visual**: Horizontal carousel of 5 type cards, each with unique WebGL thumbnail.

| Type | Thumbnail Shader | Palette | Key Animation |
|------|------------------|---------|---------------|
| **Emission** | H-II region raymarch | H-alpha + O-III | Ionization front pulses |
| **Reflection** | Dust scattering (Mie) | Blue-white stellar | Starlight sweeps across dust |
| **Dark** | Absorption silhouette | Space black + gold rim | Background stars wink out |
| **Planetary** | Shell expansion + central star | O-III ring + S-II ansae | Shell expands, star pulses |
| **Supernova Remnant** | Filamentary shock fronts | All lines + synchrotron | Filaments ripple outward |

**Interaction**: Hover/focus → card expands, thumbnail animates faster, field lines appear.

### 2.5 Formation Section (0.40–0.55)

**Visual**: Full-width canvas — 3D stellar nursery simulation.

| Scroll Range | Animation |
|--------------|-----------|
| 0.40–0.45 | Giant molecular cloud: turbulent gas (3D fBm velocity field) |
| 0.45–0.50 | Jeans instability: dense cores form (density threshold visualization) |
| 0.50–0.55 | Protostars ignite: accretion disks + bipolar outflows (signed distance fields) |

**Technique**: GPU particle system (100k points) with compute-shader-like simulation via ping-pong textures.

### 2.6 Gallery Section (0.55–0.72)

**Visual**: 3D card stack in perspective space (CSS 3D transforms + WebGL backgrounds).

| Nebula | Distance | Visual Signature |
|--------|----------|------------------|
| **Orion (M42)** | Near | Trapezium cluster, H-alpha bright |
| **Eagle (M16)** | Mid | Pillars of Creation, dark silhouettes |
| **Crab (M1)** | Mid | Synchrotron filaments, pulsar center |
| **Helix (NGC 7293)** | Near | Planetary, eye-like, O-III ring |
| **Carina (NGC 3372)** | Far | Complex, Eta Carinae, keyhole |

**Animation**: Cards rotate on Y-axis as scroll progresses. Click → modal with full-screen WebGL explore mode.

### 2.7 Science Section (0.72–0.88)

**Visual**: Three interactive panels — Spectroscopy, Magnetic Fields, Lifecycle.

| Panel | Interaction | Visual |
|-------|-------------|--------|
| **Spectroscopy** | Hover wavelength → highlight emission line | Animated spectrum graph, photon particles |
| **Magnetic Fields** | Drag to rotate 3D field visualization | Animated flux tubes, Alfven waves |
| **Lifecycle** | Scrub timeline → morph nebula stages | Shape morphing via SDF blending |

### 2.8 CTA Section (0.88–1.00)

**Visual**: Particle explosion forming "EXPLORE THE COSMOS" text.

| Scroll Range | Animation |
|--------------|-----------|
| 0.88–0.92 | Nebula collapses inward (gravitational implosion) |
| 0.92–0.96 | Core ignites — particle burst (50k particles) |
| 0.96–1.00 | Particles reassemble into CTA text, button pulses |

**Interaction**: Button hover → magnetic field lines connect cursor to button. Click → page transition (not implemented in spec).

---

## 3. SHADER CONCEPTS & FRAGMENT SHADER OUTLINES

### 3.1 Volumetric Nebula Raymarching (Hero & Formation)

```glsl
// uniforms
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform mat4 uCameraMatrix;
uniform float uScrollProgress;

// 3D Fractal Brownian Motion
float fbm3d(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p = p * 2.02 + vec3(uTime * 0.03, uTime * 0.02, uTime * 0.01);
        a *= 0.5;
    }
    return v;
}

// Curl noise for magnetic field visualization
vec3 curlNoise(vec3 p) {
    const float eps = 0.01;
    vec3 n = vec3(
        fbm3d(p + vec3(eps, 0, 0)) - fbm3d(p - vec3(eps, 0, 0)),
        fbm3d(p + vec3(0, eps, 0)) - fbm3d(p - vec3(0, eps, 0)),
        fbm3d(p + vec3(0, 0, eps)) - fbm3d(p - vec3(0, 0, eps))
    );
    return normalize(vec3(n.y - n.z, n.z - n.x, n.x - n.y));
}

// Emission line color mapping (H-alpha, O-III, S-II)
vec3 emissionColor(float density, float temp, float ion) {
    vec3 hAlpha = vec3(1.0, 0.18, 0.42) * smoothstep(0.3, 0.7, density) * ion;
    vec3 oiii   = vec3(0.0, 0.84, 1.0)  * smoothstep(0.4, 0.8, density) * (1.0 - ion) * temp;
    vec3 sii    = vec3(1.0, 0.72, 0.0)  * smoothstep(0.2, 0.5, density) * (1.0 - temp);
    return hAlpha + oiii + sii;
}

// Main raymarch
vec4 raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    vec3 accum = vec3(0.0);
    float transmittance = 1.0;
    
    for (int i = 0; i < 96; i++) {
        vec3 pos = ro + rd * t;
        
        // Density field with magnetic distortion
        float density = fbm3d(pos * 0.5);
        vec3 field = curlNoise(pos * 0.3);
        density += length(field) * 0.15 * sin(uTime * 0.5 + t * 0.1);
        
        // Temperature & ionization from density gradients
        float temp = smoothstep(0.3, 0.8, density);
        float ion = smoothstep(0.5, 0.9, density);
        
        vec3 color = emissionColor(density, temp, ion);
        float alpha = density * 0.08 * transmittance;
        
        accum += color * alpha;
        transmittance *= 1.0 - alpha;
        
        if (transmittance < 0.01) break;
        t += max(0.02, t * 0.05); // Adaptive step
    }
    
    // Stellar point sources
    accum += starField(rd, uTime);
    
    return vec4(accum, 1.0);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.0));
    
    // Camera from scroll
    float scroll = uScrollProgress;
    ro.z = mix(3.0, 6.0, scroll);
    rd = rotateY(rd, scroll * 0.5);
    
    // Mouse parallax
    rd.xy += uMouse * 0.15;
    
    vec4 color = raymarch(ro, rd);
    
    // Vignette & filmic tonemap
    float vig = 1.0 - 0.35 * length(uv);
    color.rgb *= vig;
    color.rgb = color.rgb / (color.rgb + vec3(0.15)); // Reinhard
    color.rgb = pow(color.rgb, vec3(1.0/2.2));
    
    gl_FragColor = color;
}
```

### 3.2 Magnetic Field Line Shader (Types & Science)

```glsl
// Vertex shader: generates field line geometry from seed points
// Fragment shader: animated glow along field lines

uniform float uTime;
uniform vec3 uFieldColor;
uniform float uLineWidth;

varying float vLineProgress; // 0→1 along field line
varying vec3 vFieldDir;

void main() {
    // Animate glow propagation along field line
    float wave = sin(vLineProgress * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    float pulse = smoothstep(0.0, 1.0, fract(uTime * 0.5 + vLineProgress));
    
    float alpha = wave * pulse * uLineWidth;
    vec3 color = uFieldColor * (1.0 + wave * 0.5);
    
    // Fresnel glow at edges
    float fresnel = 1.0 - abs(vFieldDir.z);
    alpha *= 1.0 + fresnel * 2.0;
    
    gl_FragColor = vec4(color, alpha);
}
```

### 3.3 Ionized Gas Particle Shader (Formation & Gallery)

```glsl
// Point sprite shader for GPU particles
uniform sampler2D uParticleTexture; // Circular gradient
uniform float uTime;
uniform float uPointSize;

attribute vec3 aPosition;
attribute vec3 aVelocity;
attribute float aLife;
attribute float aMass;
attribute vec3 aCharge; // RGB = charge type (H+, O2+, S+)

varying vec3 vCharge;
varying float vLife;

void main() {
    // Physics simulation in vertex shader
    vec3 pos = aPosition + aVelocity * uTime * 0.1;
    
    // E×B drift
    vec3 E = vec3(0.0, 0.01, 0.0);
    vec3 B = normalize(vec3(sin(uTime * 0.1), cos(uTime * 0.1), 0.5));
    vec3 drift = cross(E, B) / dot(B, B);
    pos += drift * uTime * 0.05 * aCharge.r;
    
    // Magnetic mirroring
    float bStrength = length(B);
    pos.z *= 1.0 - 0.3 * smoothstep(0.5, 1.0, bStrength) * aCharge.g;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * (1.0 / -mvPosition.z) * aMass * 50.0;
    
    vCharge = aCharge;
    vLife = aLife;
}

// Fragment
varying vec3 vCharge;
varying float vLife;

void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv) * 2.0;
    float alpha = smoothstep(1.0, 0.0, dist) * vLife;
    
    // Color by ionization state
    vec3 color = mix(
        vec3(1.0, 0.2, 0.4),  // H-alpha
        vec3(0.0, 0.8, 1.0),  // O-III
        vCharge.g
    );
    color = mix(color, vec3(1.0, 0.7, 0.0), vCharge.b); // S-II
    
    // Additive bloom core
    float core = smoothstep(0.3, 0.0, dist);
    color += vec3(1.0) * core * 0.5;
    
    gl_FragColor = vec4(color, alpha);
}
```

### 3.4 Gravitational Lensing Distortion (Gallery Modal)

```glsl
// Post-process effect: spherical mass distortion
uniform sampler2D uScene;
uniform vec2 uLensCenter;
uniform float uLensMass;      // Schwarzschild radius in screen space
uniform float uTime;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 offset = uv - uLensCenter;
    float r = length(offset);
    
    // Einstein deflection angle approximation
    float theta = uLensMass / max(r, 0.001);
    vec2 deflected = uv + normalize(offset) * theta * 0.1;
    
    // Chromatic aberration (wavelength-dependent)
    vec3 color;
    color.r = texture2D(uScene, deflected + vec2(0.002, 0.0)).r;
    color.g = texture2D(uScene, deflected).g;
    color.b = texture2D(uScene, deflected - vec2(0.002, 0.0)).b;
    
    // Einstein ring glow
    float ring = smoothstep(uLensMass*0.9, uLensMass*1.1, r);
    color += vec3(0.0, 0.8, 1.0) * ring * 0.3;
    
    gl_FragColor = vec4(color, 1.0);
}
```

### 3.5 Aurora Shimmer (Hero & About)

```glsl
// Gerstner wave vertex displacement + Fresnel fragment
// Applied to a subdivided plane mesh

// Vertex
uniform float uTime;
attribute vec3 aPosition;
varying vec3 vWorldPos;
varying vec2 vUv;

void main() {
    vec3 pos = aPosition;
    vec2 uv = pos.xz * 0.1;
    
    // Multiple Gerstner waves
    for (int i = 0; i < 4; i++) {
        float k = 0.5 + float(i) * 0.8;
        float w = 0.8 + float(i) * 0.3;
        float a = 0.15 / (float(i) + 1.0);
        float phase = uTime * w + uv.x * k * 3.0;
        float c = cos(phase);
        pos.y += a * c;
        pos.x += a * c * 0.3;
        pos.z += a * c * 0.2;
    }
    
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
}

// Fragment
varying vec3 vWorldPos;
varying vec2 vUv;
uniform float uTime;

void main() {
    // Interference pattern
    float wave1 = sin(vUv.x * 10.0 + uTime * 1.5);
    float wave2 = sin(vUv.y * 8.0 - uTime * 1.2);
    float wave3 = sin((vUv.x + vUv.y) * 6.0 + uTime * 0.8);
    float interference = (wave1 + wave2 + wave3) / 3.0;
    
    // Fresnel facing camera
    vec3 normal = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
    float fresnel = pow(1.0 - abs(dot(normal, vec3(0,0,1))), 3.0);
    
    vec3 color = mix(
        vec3(0.0, 0.5, 1.0),   // O-III blue
        vec3(0.5, 0.0, 1.0),   // Cosmic purple
        interference * 0.5 + 0.5
    );
    
    float alpha = fresnel * 0.4 * (interference * 0.5 + 0.5);
    gl_FragColor = vec4(color, alpha);
}
```

---

## 4. PARTICLE SYSTEM ARCHITECTURES

### 4.1 System Overview

| System | Count | Update Method | Render Method | Use Case |
|--------|-------|---------------|---------------|----------|
| **Star Field** | 5,000 | Static (precomputed) | Point sprites (WebGL) | Background stars |
| **Nebula Gas** | 50,000 | GPU ping-pong textures | Point sprites | Volumetric gas |
| **Ionized Particles** | 20,000 | Vertex shader physics | Point sprites | Formation, Gallery |
| **Cosmic Rays** | 500 | CPU (burst only) | Additive quads | CTA, transitions |
| **Field Lines** | 1,000 vertices | GPU streamlines | Line strips | Science, Types |
| **Aurora Vertices** | 10,000 | Vertex shader waves | Triangle strip | Hero, About |

### 4.2 Star Field (Static, Precomputed)

```javascript
// Generated once at init, stored in Float32Array
function generateStarField(count, seed = 42) {
  const rng = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    // Spherical distribution
    const u = rng(), v = rng();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = Math.pow(rng(), 0.33) * 100; // Concentrated near center
    
    positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = r * Math.cos(phi);
    
    // Stellar classification colors
    const temp = rng();
    if (temp < 0.76) { // M/K/G - warm
      colors[i*3] = 1.0; colors[i*3+1] = 0.9; colors[i*3+2] = 0.7;
    } else if (temp < 0.93) { // F/A - white
      colors[i*3] = 1.0; colors[i*3+1] = 1.0; colors[i*3+2] = 1.0;
    } else { // O/B - blue
      colors[i*3] = 0.7; colors[i*3+1] = 0.8; colors[i*3+2] = 1.0;
    }
    
    sizes[i] = 0.5 + rng() * 2.0;
  }
  return { positions, colors, sizes };
}
```

### 4.3 Nebula Gas Particles (GPU Simulation)

```javascript
// Two render targets ping-pong: position + velocity
class NebulaGasSystem {
  constructor(gl, count = 50000) {
    this.count = count;
    this.gl = gl;
    this.current = 0;
    this.buffers = [this.createBuffers(), this.createBuffers()];
    this.initParticles();
    this.simulationProgram = this.createSimulationProgram();
    this.renderProgram = this.createRenderProgram();
  }
  
  createBuffers() {
    // Position (rgba32f), Velocity (rgba32f), Life (r32f), Type (r8ui)
    // All in floating-point textures for GPU compute
  }
  
  simulate(dt) {
    // Bind current as input, next as output
    // Simulation shader: 
    //   - Curl noise velocity field
    //   - Magnetic field alignment (E×B drift)
    //   - Gravitational attraction to protostars
    //   - Dissipation & recombination
    this.swap();
  }
  
  render(camera) {
    // Point sprite rendering with additive blending
    // Size by life, color by ionization state
  }
}
```

### 4.4 Cosmic Ray Burst (CPU Burst, One-Shot)

```javascript
class CosmicRayBurst {
  constructor(canvas) {
    this.particles = [];
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  
  trigger(center, direction, intensity = 1.0) {
    const count = Math.floor(200 * intensity);
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(direction.y, direction.x) + (Math.random() - 0.5) * 0.5;
      const speed = 500 + Math.random() * 1000;
      this.particles.push({
        x: center.x, y: center.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.5 + Math.random() * 1.0,
        size: 2 + Math.random() * 4,
        hue: 300 + Math.random() * 60 // Purple-pink
      });
    }
  }
  
  update(dt) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      p.vx *= 0.99; p.vy *= 0.99; // Drag
      return p.life > 0;
    });
  }
  
  render() {
    this.ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      const alpha = p.life;
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalCompositeOperation = 'source-over';
  }
}
```

---

## 5. PERFORMANCE BUDGETS & OPTIMIZATION

### 5.1 Frame Budget (16.67ms @ 60 FPS)

| Component | Budget | Optimization |
|-----------|--------|--------------|
| **Main Raymarch (Hero)** | 6-8ms | Adaptive steps, early exit, 96 max steps |
| **Gas Particles Sim** | 2-3ms | Compute via fragment shader, 50k points |
| **Gas Particles Render** | 2-3ms | Instanced points, additive blending |
| **Field Lines** | 1-2ms | Precomputed geometry, line strips |
| **Star Field** | 0.5ms | Static VBO, single draw call |
| **Aurora Mesh** | 1ms | Vertex shader waves, 10k verts |
| **UI/Layout/Scroll** | 1ms | IntersectionObserver, requestAnimationFrame |
| **Composite/Post** | 2ms | Single full-screen quad, minimal passes |
| **Total Target** | **<16ms** | Headroom for 4K (4x pixels → ~20ms) |

### 5.2 Resolution Scaling Strategy

```javascript
const QUALITY_TIERS = {
  low: {    // Mobile, <768px, or reduced-motion
    raymarchSteps: 48,
    particleCount: 10000,
    renderScale: 0.5,
    enablePostFX: false
  },
  medium: { // Tablet, 768-1440px
    raymarchSteps: 72,
    particleCount: 30000,
    renderScale: 0.75,
    enablePostFX: true
  },
  high: {   // Desktop, >1440px
    raymarchSteps: 96,
    particleCount: 50000,
    renderScale: 1.0,
    enablePostFX: true
  },
  ultra: {  // 4K, high-end GPU
    raymarchSteps: 120,
    particleCount: 80000,
    renderScale: 1.0,
    enablePostFX: true
  }
};

// Auto-detect at init
function detectQualityTier() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = Math.min(window.devicePixelRatio, 2);
  
  if (isReduced || isMobile || mem < 4) return 'low';
  if (dpr > 1.5 || mem >= 8) return 'ultra';
  if (mem >= 6) return 'high';
  return 'medium';
}
```

### 5.3 Memory Budget

| Resource | Size | Notes |
|----------|------|-------|
| Shaders (compiled) | ~200 KB | 8-10 programs |
| Star Field VBO | 5,000 × 32B = 160 KB | Static |
| Gas Particles (2× RT) | 50k × 64B × 2 = 6.4 MB | Ping-pong RGBA32F |
| Field Line Geometry | 1k × 48B = 48 KB | Static |
| Aurora Mesh | 10k × 32B = 320 KB | Static |
| Textures (noise, gradients) | ~2 MB | 3D noise 128³ = 8MB but use 2D + time |
| **Total GPU** | **~10-15 MB** | Well within 4GB+ VRAM |

### 5.4 Load Performance

- **Critical Path**: HTML → Inline CSS/JS → WebGL init → First frame
- **Target**: <100ms to interactive (TTI)
- **Strategy**: 
  - Inline all CSS/JS (no external requests)
  - Defer non-hero WebGL init to `requestIdleCallback`
  - Show CSS-only fallback (static gradient) during init
  - Precompute noise textures in WebWorker

---

## 6. ACCESSIBILITY CONSIDERATIONS

### 6.1 Reduced Motion (`prefers-reduced-motion`)

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all continuous animations */
  .nebula-canvas,
  .particle-canvas,
  .aurora-mesh,
  .field-lines {
    animation: none !important;
    transition: none !important;
  }
  
  /* Static hero: render single frame */
  .hero-canvas { 
    background: var(--space-900);
    background-image: url('data:image/svg+xml,...'); /* Pre-rendered fallback */
  }
  
  /* Instant reveals */
  .scroll-reveal { opacity: 1; transform: none; }
  
  /* Disable parallax */
  .parallax-layer { transform: none !important; }
}
```

### 6.2 Semantic HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEBULA — Cosmic Clouds & Stellar Nurseries</title>
  <meta name="description" content="Explore the physics and beauty of nebulae: emission, reflection, dark, planetary, and supernova remnants.">
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  
  <header role="banner">
    <nav aria-label="Primary navigation">
      <ul>
        <li><a href="#about">What is a Nebula</a></li>
        <li><a href="#types">Types</a></li>
        <li><a href="#formation">Formation</a></li>
        <li><a href="#gallery">Gallery</a></li>
        <li><a href="#science">Science</a></li>
      </ul>
    </nav>
  </header>
  
  <main id="main" role="main">
    <section id="hero" aria-labelledby="hero-title">
      <div class="canvas-wrapper" aria-hidden="true">
        <canvas id="hero-canvas"></canvas>
      </div>
      <div class="hero-content">
        <h1 id="hero-title">NEBULA</h1>
        <p class="hero-subtitle">Where stars are born</p>
      </div>
    </section>
    
    <section id="about" aria-labelledby="about-title">
      <h2 id="about-title">What is a Nebula?</h2>
      <div class="about-diagram" aria-label="Nebula formation diagram">
        <canvas id="about-canvas"></canvas>
      </div>
      <div class="about-text">
        <p>...</p>
      </div>
    </section>
    
    <section id="types" aria-labelledby="types-title">
      <h2 id="types-title">Types of Nebulae</h2>
      <div class="types-carousel" role="list" aria-label="Nebula types">
        <!-- 5 cards with role="listitem" -->
      </div>
    </section>
    
    <section id="formation" aria-labelledby="formation-title">
      <h2 id="formation-title">Stellar Nursery</h2>
      <div class="formation-canvas" aria-label="3D stellar formation simulation">
        <canvas id="formation-canvas"></canvas>
      </div>
    </section>
    
    <section id="gallery" aria-labelledby="gallery-title">
      <h2 id="gallery-title">Famous Nebulae</h2>
      <div class="gallery-grid" role="list">
        <!-- 5 cards, each role="listitem" -->
      </div>
    </section>
    
    <section id="science" aria-labelledby="science-title">
      <h2 id="science-title">The Science</h2>
      <div class="science-panels">
        <section aria-labelledby="spec-title">
          <h3 id="spec-title">Spectroscopy</h3>
          <canvas id="spec-canvas" aria-label="Interactive emission spectrum"></canvas>
        </section>
        <section aria-labelledby="field-title">
          <h3 id="field-title">Magnetic Fields</h3>
          <canvas id="field-canvas" aria-label="3D magnetic field visualization"></canvas>
        </section>
        <section aria-labelledby="life-title">
          <h3 id="life-title">Lifecycle</h3>
          <canvas id="life-canvas" aria-label="Nebula lifecycle timeline"></canvas>
        </section>
      </div>
    </section>
    
    <section id="cta" aria-labelledby="cta-title">
      <h2 id="cta-title">Explore the Cosmos</h2>
      <div class="cta-canvas" aria-hidden="true">
        <canvas id="cta-canvas"></canvas>
      </div>
      <button class="cta-button" type="button">Begin Journey</button>
    </section>
  </main>
  
  <footer role="contentinfo">
    <p>Built with WebGL • Data from ESA/Hubble/NASA</p>
  </footer>
</body>
</html>
```

### 6.3 ARIA & Keyboard Support

| Element | ARIA | Keyboard |
|---------|------|----------|
| Navigation links | `aria-current="page"` on active | Tab/Enter |
| Type cards | `role="listitem"`, `tabindex="0"` | Arrow keys navigate, Enter opens modal |
| Gallery cards | `role="listitem"`, `aria-describedby` | Same as types |
| Science panels | `aria-live="polite"` on value changes | Tab to canvas, Arrow keys scrub |
| CTA button | `aria-label="Begin cosmic journey"` | Enter/Space |
| Canvas elements | `aria-hidden="true"` (decorative) | N/A |
| Modal (gallery) | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` | Esc closes, Trap focus |

### 6.4 Color Contrast & Visual Accessibility

- All text: ≥4.5:1 contrast against `--space-900`
- Focus indicators: 3px solid `var(--focus-ring)` with 2px offset
- No information conveyed by color alone (icons + labels)
- High contrast mode: `@media (prefers-contrast: more)` → thicker lines, higher saturation

### 6.5 Screen Reader Content

```html
<!-- Hidden descriptive text for complex visualizations -->
<div class="sr-only" id="hero-desc">
  A vast cosmic nebula fills the view: clouds of ionized hydrogen glow magenta, 
  oxygen emits teal, sulfur shows gold. Stars pierce through the gas. 
  As you scroll, the camera pulls back revealing the nebula's full structure.
</div>

<div class="sr-only" id="formation-desc">
  Simulation shows a giant molecular cloud collapsing under gravity. 
  Dense cores form and ignite as protostars with accretion disks and bipolar outflows.
</div>
```

---

## 7. FILE STRUCTURE (SINGLE HTML)

```
nebula-landing.html
├── <!DOCTYPE html>
├── <html lang="en">
│   ├── <head>
│   │   ├── Meta tags (charset, viewport, description, theme-color)
│   │   ├── <title>NEBULA — Cosmic Clouds & Stellar Nurseries</title>
│   │   ├── <link rel="preconnect" href="https://fonts.googleapis.com">
│   │   ├── <link rel="preload" as="font" href="...Space Grotesk..." crossorigin>
│   │   ├── <link rel="preload" as="font" href="...JetBrains Mono..." crossorigin>
│   │   ├── <style>...</style>        ← ALL CSS INLINE (custom properties, layout, components, media queries)
│   │   └── <script type="importmap">← ES Module imports for Three.js (if used) or raw WebGL
│   ├── <body>
│   │   ├── <a class="skip-link" href="#main">Skip to main content</a>
│   │   ├── <header role="banner">...</header>
│   │   ├── <main id="main" role="main">
│   │   │   ├── <section id="hero">...</section>
│   │   │   ├── <section id="about">...</section>
│   │   │   ├── <section id="types">...</section>
│   │   │   ├── <section id="formation">...</section>
│   │   │   ├── <section id="gallery">...</section>
│   │   │   ├── <section id="science">...</section>
│   │   │   └── <section id="cta">...</section>
│   │   └── <footer role="contentinfo">...</footer>
│   └── <script type="module">...</script>  ← ALL JS INLINE (module pattern)
│       ├── Configuration & Constants
│       ├── Utility Functions (rng, math, color)
│       ├── WebGL Context Manager
│       ├── Shader Programs (vertex/fragment strings)
│       ├── Particle Systems (classes)
│       ├── Scene Controllers (per section)
│       ├── Scroll Orchestrator (IntersectionObserver + rAF)
│       ├── Input Handlers (mouse, touch, keyboard, resize)
│       ├── Accessibility Manager (reduced motion, contrast, ARIA)
│       ├── Performance Monitor (FPS, memory, quality auto-adjust)
│       └── Initialization & Main Loop
└── </html>
```

### 7.1 Inline Asset Strategy

| Asset | Strategy |
|-------|----------|
| **Fonts** | `preload` WOFF2 from Google Fonts, `font-display: swap`, local fallback stack |
| **Noise Textures** | Procedural in shader (no texture fetch) OR generated in WebWorker at init |
| **Gradient Maps** | CSS `conic-gradient` / `radial-gradient` or 1D texture generated in JS |
| **Star Catalog** | Algorithmic (seeded RNG) — no data file |
| **Nebula Parameters** | Hardcoded in JS config object per section |

---

## 8. IMPLEMENTATION SEQUENCE

### Phase 1: Foundation (Day 1)
1. HTML skeleton with semantic structure
2. CSS custom properties, fluid typography, layout grid
3. WebGL context creation + resize handling
4. Basic render loop with `requestAnimationFrame`
5. Scroll orchestrator with `IntersectionObserver`

### Phase 2: Core Shaders (Day 2-3)
1. Volumetric nebula raymarch (Hero)
2. Star field point sprites
3. Aurora shimmer mesh
4. Magnetic field line geometry + shader
5. Ionized particle system (GPU)

### Phase 3: Section Controllers (Day 4-5)
1. Hero: Camera + title reveal + mouse parallax
2. About: 2D reaction-diffusion diagram
3. Types: Carousel + 5 thumbnail shaders
4. Formation: 3D particle simulation
5. Gallery: 3D card stack + modal
6. Science: 3 interactive panels
7. CTA: Particle burst + text assembly

### Phase 4: Polish & Performance (Day 6)
1. Quality tier detection + auto-scaling
2. Reduced motion fallbacks (static images)
3. Accessibility audit (keyboard, ARIA, contrast)
4. Performance profiling (4K, mobile, low-end)
5. Bundle size optimization (minify inline CSS/JS)

### Phase 5: Testing & Delivery (Day 7)
1. Cross-browser (Chrome, Firefox, Safari, Edge)
2. Device testing (mobile, tablet, desktop, 4K)
3. Lighthouse audit (Performance, Accessibility, Best Practices)
4. Final single-file HTML output

---

## 9. TECHNICAL DEPENDENCIES (ZERO EXTERNAL AT RUNTIME)

| Dependency | Usage | Inclusion Method |
|------------|-------|------------------|
| **Three.js** | Optional: only for camera/math helpers | **Excluded** — use raw WebGL + minimal math lib (gl-matrix functions inlined) |
| **GSAP** | Scroll animations | **Excluded** — custom scroll orchestrator with `interpolate` |
| **Fonts** | Space Grotesk, JetBrains Mono, DM Sans | Google Fonts `preload` + `font-display: swap` |
| **Noise** | Procedural | Inlined shader functions (no texture) |

**Rationale**: Single HTML file constraint → zero network requests after initial load. All math inlined (~2KB). Shaders as template strings.

---

## 10. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| **First Contentful Paint** | <800ms (3G) / <200ms (wifi) |
| **Time to Interactive** | <100ms (desktop) / <300ms (mobile) |
| **Frame Rate** | 60 FPS sustained (desktop), 30 FPS minimum (mobile) |
| **Lighthouse Performance** | ≥90 |
| **Lighthouse Accessibility** | 100 |
| **Lighthouse Best Practices** | ≥95 |
| **Bundle Size (HTML)** | <500 KB (gzipped <100 KB) |
| **GPU Memory** | <50 MB at 4K ultra |
| **Reduced Motion** | Zero animations, instant reveals |
| **Keyboard Navigation** | 100% reachable, logical order |

---

## 11. FALLBACK STRATEGIES

| Scenario | Fallback |
|----------|----------|
| WebGL2 unavailable | Canvas 2D: static gradients + CSS animations |
| WebGL1 only | Simplified shaders (no 3D textures, reduced loops) |
| `prefers-reduced-motion` | Pre-rendered hero image, CSS-only section transitions |
| Low memory (<2GB) | Auto-downgrade to `low` quality tier |
| Touch device | Disable hover effects, enlarge touch targets (48×48px) |
| High DPR (>2) | Cap render scale at 2.0, use CSS `image-rendering: pixelated` for canvas |

---

## 12. EXTENSIBILITY HOOKS

```javascript
// Event bus for external integration
window.NebulaLanding = {
  on: (event, callback) => { /* 'section:enter', 'section:leave', 'cta:click' */ },
  off: (event, callback) => {},
  goto: (sectionId) => { /* programmatic scroll */ },
  setQuality: (tier) => { /* 'low'|'medium'|'high'|'ultra' */ },
  captureFrame: () => Promise<Blob> /* screenshot */
};
```

---

**End of Specification** — Ready for implementation as single `nebula-landing.html`