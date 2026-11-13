// Syntax test

(() => {
  'use strict';

  const canvas = document.getElementById('bh-canvas');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  let width = 0, height = 0, dpr = 1;
  let cx = 0, cy = 0;
  let lastTime = 0;
  let scrollY = 0;
  let rng = null;

  const STAR_COUNT = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--star-count').trim(), 10);
  const PARTICLE_COUNT = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--particle-count').trim(), 10);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // Deterministic RNG (Mulberry32)
  // ============================================
  function mulberry32(seed) {
    return function() {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(e0, e1, x) { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // ============================================
  // Starfield - offscreen rendered, parallax drawn
  // ============================================
  let starfieldCanvas = null, starfieldCtx = null, starfieldDirty = true;
  let starData = null;

  function initStars(count, w, h) {
    starData = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      starData[i*4] = rng() * w;
      starData[i*4+1] = rng() * h;
      starData[i*4+2] = 0.4 + rng() * 1.5; // size
      starData[i*4+3] = 0.25 + rng() * 0.6; // brightness
    }
  }

  function renderStarsToOffscreen(w, h, time) {
    if (!starfieldCanvas) {
      starfieldCanvas = document.createElement('canvas');
      starfieldCanvas.width = w;
      starfieldCanvas.height = h;
      starfieldCtx = starfieldCanvas.getContext('2d', { alpha: false });
    }
    if (starfieldCanvas.width !== w || starfieldCanvas.height !== h) {
      starfieldCanvas.width = w; starfieldCanvas.height = h;
    }
    const sctx = starfieldCtx;
    sctx.fillStyle = '#000';
    sctx.fillRect(0, 0, w, h);
    sctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < STAR_COUNT; i++) {
      const x = starData[i*4];
      const y = starData[i*4+1];
      const size = starData[i*4+2];
      const bright = starData[i*4+3];
      const twinkle = 0.45 + 0.55 * Math.sin(time * 0.0008 * (i % 11 + 1) + i * 7.3);
      sctx.globalAlpha = bright * twinkle;
      sctx.fillStyle = '#fff';
      sctx.beginPath();
      sctx.arc(x, y, size, 0, Math.PI * 2);
      sctx.fill();
    }
    sctx.globalAlpha = 1;
    starfieldDirty = false;
  }

  function drawStars(ctx, time) {
    if (starfieldDirty || !starfieldCanvas) renderStarsToOffscreen(width, height, time);
    const oy = (scrollY * 0.06) % height;
    const ox = Math.sin(time * 0.00004) * 25;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.drawImage(starfieldCanvas, 0, 0);
    ctx.drawImage(starfieldCanvas, 0, -height);
    ctx.restore();
  }

  // ============================================
  // Particle Pool (for sparse dust/matter streams)
  // ============================================
  class ParticlePool {
    constructor(capacity) {
      this.capacity = capacity;
      this.pool = new Array(capacity);
      this.active = new Uint16Array(capacity);
      this.count = 0;
      for (let i = 0; i < capacity; i++) {
        this.pool[i] = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, hue: 0, active: false };
      }
      this.paths = new Map();
    }
    getPath(s) { const k = Math.round(s * 10) / 10; let p = this.paths.get(k); if (!p) { p = new Path2D(); p.arc(0, 0, k, 0, Math.PI * 2); this.paths.set(k, p); } return p; }
    spawn(x, y, vx, vy, size, hue, life) {
      for (let i = 0; i < this.capacity; i++) if (!this.pool[i].active) {
        const p = this.pool[i]; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.size = size; p.hue = hue; p.life = 0; p.maxLife = life; p.active = true; this.active[this.count++] = i; return;
      }
    }
    update(dt, bh) {
      const G = 80000 * (1 + bh.scrollProgress * 4);
      for (let i = this.count - 1; i >= 0; i--) {
        const idx = this.active[i]; const p = this.pool[idx];
        const dx = bh.cx - p.x, dy = bh.cy - p.y;
        const d2 = dx*dx + dy*dy; const d = Math.sqrt(d2) || 0.001;
        if (d < bh.rs) { p.active = false; this.active[i] = this.active[--this.count]; continue; }
        if (d > Math.max(width, height) * 1.2) { p.active = false; this.active[i] = this.active[--this.count]; continue; }
        const f = G / d2; p.vx += dx/d * f * dt; p.vy += dy/d * f * dt;
        p.vx *= 0.996; p.vy *= 0.996; p.x += p.vx * dt; p.y += p.vy * dt;
        p.life += dt; if (p.life >= p.maxLife) { p.active = false; this.active[i] = this.active[--this.count]; }
      }
    }
    render(ctx) {
      if (this.count === 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.count; i++) {
        const p = this.pool[this.active[i]];
        const a = 1 - p.life / p.maxLife; if (a <= 0) continue;
        ctx.globalAlpha = a * 0.6;
        ctx.fillStyle = `hsl(${p.hue}, 85%, 65%)`;
        ctx.translate(p.x, p.y); ctx.fill(this.getPath(p.size)); ctx.translate(-p.x, -p.y);
      }
      ctx.restore();
    }
  }

  let particlePool = null;

  // ============================================
  // Blackhole State & Scroll Parameters
  // ============================================
  const bh = {
    rs: 0,           // Schwarzschild radius (event horizon)
    r_photon: 0,     // Photon ring at 1.5 rs
    r_isco: 0,       // ISCO at 3 rs (for Schwarzschild)
    r_disk_in: 0,    // Disk inner edge
    r_disk_out: 0,   // Disk outer edge
    cx: 0, cy: 0,
    scrollProgress: 0,
    rotation: 0,
    pulsePhase: 0,
  };

  const scrollCtrl = {
    progress: 0,
    sectionProg: {},
    sections: ['hero', 'about', 'features', 'cta'],
    init() {
      this.sections.forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        new IntersectionObserver(es => { es.forEach(e => { this.sectionProg[id] = e.intersectionRatio; this.update(); }); }, { threshold: Array.from({length: 21}, (_, i) => i * 0.05) }).observe(el);
      });
      document.querySelectorAll('[data-reveal]').forEach(el => {
        new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); } }); }, { rootMargin: '0px 0px -10% 0px' }).observe(el);
      });
    },
    update() {
      let sum = 0, w = 0;
      this.sections.forEach((id, i) => { const r = this.sectionProg[id] || 0; const wt = i === 0 ? 1.3 : 1; sum += r * wt; w += wt; });
      this.progress = w ? sum / w : 0;
    },
    getParams() {
      const p = this.progress;
      // rs grows from 60px to 160px
      bh.rs = lerp(60, 160, p);
      bh.r_photon = bh.rs * 1.5;
      bh.r_isco = bh.rs * 3;
      bh.r_disk_in = bh.r_isco;         // ISCO = inner edge
      bh.r_disk_out = bh.rs * 7.5;      // Outer edge
      bh.cx = cx; bh.cy = cy;
      bh.scrollProgress = p;
      bh.rotation = performance.now() * 0.00015 * lerp(0.4, 1.8, p);
      bh.pulsePhase = performance.now() * 0.001 * lerp(0.8, 2.2, p);
      return {
        diskRotationSpeed: lerp(0.25, 1.6, p),
        particleSpawnRate: lerp(2, 25, p),
        lensStrength: smoothstep(0.25, 0.65, p),
        dopplerBoost: lerp(0.5, 1.0, p),
      };
    }
  };

  // ============================================
  // Temperature to RGB (blackbody approximation)
  // Interstellar disk: ~6300K (inner) to ~3000K (outer)
  // ============================================
  function tempToRGB(temp) {
    // temp in Kelvin, returns [r,g,b] 0-1
    // Approximation for 3000K-7000K range
    const t = temp / 1000;
    let r, g, b;
    if (t <= 6.6) {
      r = 1;
      g = clamp(0.238 + 0.7 * t - 0.1 * t * t, 0, 1);
      b = t < 2 ? 0 : clamp(1.3 - 0.15 * t, 0, 1);
    } else {
      r = 1;
      g = 1;
      b = 1;
    }
    return [r, g, b];
  }

  function rgbToHex(r, g, b) {
    const toHex = c => Math.round(clamp(c, 0, 1) * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  // Precompute disk color stops
  const DISK_STEPS = 64;
  let diskColors = null;
  function buildDiskColors() {
    diskColors = new Array(DISK_STEPS);
    for (let i = 0; i < DISK_STEPS; i++) {
      const t = i / (DISK_STEPS - 1);
      // Temperature: 6300K at inner (t=0) to 3000K at outer (t=1)
      const temp = lerp(6300, 3000, t);
      const [r, g, b] = tempToRGB(temp);
      // Opacity peaks in middle
      const opacity = 0.15 + 0.7 * (1 - Math.abs(t - 0.5) * 2);
      diskColors[i] = { r, g, b, opacity, temp };
    }
  }

  // ============================================
  // Render: Gargantua / Interstellar Blackhole
  // ============================================
  function renderBlackhole(ctx, params, time) {
    const rs = bh.rs;
    const rPh = bh.r_photon;
    const rIn = bh.r_disk_in;
    const rOut = bh.r_disk_out;
    const rot = bh.rotation;
    const doppler = params.dopplerBoost;

    // ---- 1. ACCRETION DISK (lensed - both top and bottom visible) ----
    // The disk is geometrically thin. We render it as an ellipse (viewed at ~inclination).
    // Gravitational lensing wraps the BACK of the disk OVER the top and UNDER the bottom.
    // We simulate this by drawing the disk in two passes with distortion.

    const inclination = 0.65 * Math.PI / 2; // ~60-70 degrees, like Interstellar
    const cosInc = Math.cos(inclination);
    const sinInc = Math.sin(inclination);

    // Disk vertical scale (geometrically thin)
    const hScale = 0.04; // h/r ~ 0.04

    // We'll render by sampling the disk in polar coordinates and mapping to screen with lensing
    // Simplified but visually accurate approach:
    // - Draw the disk as concentric ellipses
    // - Apply gravitational lensing distortion: r_screen = r * (1 + rs/r) for light bending
    // - The back side of disk appears at negative y (lensed up)

    // Precompute lensing map for radius
    // For each disk radius, compute apparent radius due to lensing
    // Light bending angle: alpha ~ 2*rs/r (weak field) but near horizon it's strong
    // We use a fitted function that matches the Interstellar look

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // ---- RENDER DISK WITH LENSING ----
    // We draw radial segments, each warped by lensing
    const segments = 180;
    const segmentAngle = Math.PI * 2 / segments;

    for (let si = 0; si < segments; si++) {
      const a0 = si * segmentAngle;
      const a1 = a0 + segmentAngle;
      const ca0 = Math.cos(a0), sa0 = Math.sin(a0);
      const ca1 = Math.cos(a1), sa1 = Math.sin(a1);

      // Doppler factor: max at a=0 (approaching), min at a=pi (receding)
      // Viewing angle: we see disk at inclination, so approaching side is at angle = -pi/2 in disk coords
      // For simplicity: brightness varies as cos(angle) where angle=0 is approaching limb
      const diskAngle = a0 - Math.PI * 0.5; // shift so 0 = approaching
      const dopplerFactor = 1 + doppler * 0.8 * Math.cos(diskAngle); // 0.2 to 1.8 range

      // Build path for this segment (trapezoid in polar, lensed)
      ctx.beginPath();
      for (let ri = 0; ri < DISK_STEPS; ri++) {
        const t = ri / (DISK_STEPS - 1);
        const r = lerp(rIn, rOut, t);
        const col = diskColors[ri];

        // Lensing: apparent radius increases near blackhole
        // Strong lensing: r_app = r * (1 + 0.5 * rs/r + 0.3 * (rs/r)^2) approximately
        const rs_r = rs / r;
        const lensFactor = 1 + 0.6 * rs_r + 0.4 * rs_r * rs_r;
        const rLensed = r * lensFactor;

        // Vertical position: disk is thin, but lensing wraps it
        // Top surface (y > 0 in disk coords -> positive y on screen)
        // Bottom surface lensed to negative y
        const yTop = rLensed * sinInc * hScale * 0.5;
        const yBot = -rLensed * sinInc * hScale * 0.5;

        // For the lensed back side: the FAR side of disk (y<0 in disk) gets lensed UP (positive y)
        // and the NEAR side (y>0) gets lensed DOWN
        // This creates the characteristic "hat" shape
        const yLensedTop = yTop + rLensed * (1 - cosInc) * 0.15 * (1 - t); // back side wraps up
        const yLensedBot = yBot - rLensed * (1 - cosInc) * 0.15 * (1 - t); // front side wraps down

        // Actually, the classic Interstellar look: the disk appears as a continuous ring crossing the shadow
        // The top of the disk is visible above, the bottom is lensed below, and they meet at the sides
        // Let's use a simpler but accurate parametric approach

        // Parametric: for each angle, we have two y values (top and bottom surface)
        // Projected to screen with inclination
        // Then apply radial lensing distortion
      }

      // Instead of complex parametric, use the proven "ellipse with lensing offset" method
      // Draw the disk as a series of concentric ellipses with increasing vertical offset near center
    }

    // Simpler, faster, visually accurate method:
    // Draw the disk as filled ellipses from outer to inner, with lensing distortion
    // The lensing makes the inner ellipses taller (wraps around)

    for (let ri = DISK_STEPS - 1; ri >= 0; ri--) {
      const t = ri / (DISK_STEPS - 1);
      const r = lerp(rIn, rOut, t);
      const col = diskColors[ri];

      // Lensing distortion factor
      const rs_r = rs / r;
      const lensFactor = 1 + 0.55 * rs_r + 0.35 * rs_r * rs_r;
      const rApp = r * lensFactor;

      // Vertical radius of ellipse (inclination)
      const ry = rApp * sinInc * 0.5; // h/r ~ 0.5 for visual thickness (exaggerated for visibility)

      // Lensing wrap: inner disk appears to extend vertically over/under shadow
      const wrap = (1 - t) * (1 - t) * rs * 0.45 * (1 - cosInc);
      const ryTop = ry + wrap;
      const ryBot = ry + wrap;

      // Color with doppler boost (average for this ring)
      // Doppler varies with angle, so we'll draw in angular segments instead
      // For now, use average brightness
      const avgDoppler = 1 + doppler * 0.3;

      const rCol = Math.min(1, col.r * avgDoppler);
      const gCol = Math.min(1, col.g * avgDoppler);
      const bCol = Math.min(1, col.b * avgDoppler);
      const alpha = col.opacity * (0.85 + 0.15 * Math.sin(time * 0.0015 + ri * 0.2));

      // Draw top half of ellipse (approaching side brighter)
      // Actually, we need angular variation. Let's draw in angular wedges.
    }

    // ============================================================
    // ANGULAR SEGMENT RENDERING (correct Doppler + lensing)
    // ============================================================
    const angSegments = 120;
    const dang = Math.PI * 2 / angSegments;

    for (let ai = 0; ai < angSegments; ai++) {
      const ang = ai * dang - Math.PI * 0.5; // 0 = approaching (right side in Interstellar)
      const cosA = Math.cos(ang), sinA = Math.sin(ang);

      // Doppler factor for this angle
      // Approaching side (cos > 0) is blueshifted & brighter
      const dopplerF = 1 + doppler * 0.9 * cosA; // 0.1 to 1.9

      ctx.beginPath();
      // Outer edge of disk at this angle
      for (let ri = DISK_STEPS - 1; ri >= 0; ri--) {
        const t = ri / (DISK_STEPS - 1);
        const r = lerp(rIn, rOut, t);
        const col = diskColors[ri];

        // Lensing
        const rs_r = rs / r;
        const lensF = 1 + 0.55 * rs_r + 0.35 * rs_r * rs_r;
        const rApp = r * lensF;

        // Projected coordinates with inclination
        // Disk coords: x_disk = r * cos(phi), y_disk = r * sin(phi) * cosInc (foreshortened)
        // Screen: x = x_disk, y = y_disk * sinInc + z_disk * cosInc (but z=0 for midplane)
        // Actually: for thin disk at inclination i:
        // x_screen = r * cos(phi)
        // y_screen = r * sin(phi) * cos(i)
        // But lensing modifies r -> rApp

        const x = rApp * cosA;
        const y = rApp * sinA * cosInc;

        // Lensing wrap: light from back of disk (phi ~ pi) gets bent up
        // Light from front (phi ~ 0) gets bent down
        // The wrap is strongest at the sides (phi = +/- pi/2)
        const wrapPhase = Math.sin(ang); // max at sides
        const wrapAmount = (1 - t) * (1 - t) * rs * 0.35 * wrapPhase * (1 - cosInc);
        const yLensed = y + wrapAmount;

        const boostedR = Math.min(1, col.r * dopplerF);
        const boostedG = Math.min(1, col.g * dopplerF);
        const boostedB = Math.min(1, col.b * dopplerF);
        const alpha = col.opacity * (0.9 + 0.1 * Math.sin(time * 0.002 + ri * 0.15 + ai * 0.05));

        if (ri === DISK_STEPS - 1) {
          ctx.moveTo(x, yLensed);
        } else {
          ctx.lineTo(x, yLensed);
        }
      }
      // Inner edge - close back along inner radius
      for (let ri = 0; ri < DISK_STEPS; ri++) {
        const t = ri / (DISK_STEPS - 1);
        const r = lerp(rIn, rOut, t);
        const col = diskColors[ri];
        const rs_r = rs / r;
        const lensF = 1 + 0.55 * rs_r + 0.35 * rs_r * rs_r;
        const rApp = r * lensF;
        const x = rApp * cosA;
        const y = rApp * sinA * cosInc;
        const wrapPhase = Math.sin(ang);
        const wrapAmount = (1 - t) * (1 - t) * rs * 0.35 * wrapPhase * (1 - cosInc);
        const yLensed = y + wrapAmount;
        ctx.lineTo(x, yLensed);
      }
      ctx.closePath();

      // Average color for this segment (sample middle of disk)
      const midRi = Math.floor(DISK_STEPS * 0.5);
      const midCol = diskColors[midRi];
      const midT = midRi / (DISK_STEPS - 1);
      const midR = lerp(rIn, rOut, midT);
      const midRs_r = rs / midR;
      const midLensF = 1 + 0.55 * midRs_r + 0.35 * midRs_r * midRs_r;
      const midDopplerF = 1 + doppler * 0.9 * cosA;

      const fr = Math.min(1, midCol.r * midDopplerF);
      const fg = Math.min(1, midCol.g * midDopplerF);
      const fb = Math.min(1, midCol.b * midDopplerF);
      const falpha = midCol.opacity * 0.95;

      ctx.fillStyle = `rgba(${Math.round(fr*255)}, ${Math.round(fg*255)}, ${Math.round(fb*255)}, ${falpha})`;
      ctx.fill();
    }

    // ---- 2. PHOTON RING (razor sharp, at 1.5 rs) ----
    // The photon ring is a narrow, bright circle from light orbiting at 1.5 rs
    // It should be nearly white, very thin, with slight glow
    const phR = rPh;
    // Draw as a thin stroke with radial gradient for glow
    const phGrad = ctx.createRadialGradient(0, 0, phR * 0.992, 0, 0, phR * 1.008);
    phGrad.addColorStop(0, 'rgba(255,251,230,0)');
    phGrad.addColorStop(0.5, 'rgba(255,251,230,0.95)');
    phGrad.addColorStop(1, 'rgba(255,251,230,0)');
    ctx.strokeStyle = phGrad;
    ctx.lineWidth = Math.max(1, rs * 0.012);
    ctx.beginPath();
    ctx.arc(0, 0, phR, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle outer glow on photon ring
    const phGlow = ctx.createRadialGradient(0, 0, phR * 0.98, 0, 0, phR * 1.02);
    phGlow.addColorStop(0, 'rgba(255,240,200,0)');
    phGlow.addColorStop(0.5, 'rgba(255,220,160,0.12)');
    phGlow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.strokeStyle = phGlow;
    ctx.lineWidth = Math.max(2, rs * 0.025);
    ctx.beginPath();
    ctx.arc(0, 0, phR, 0, Math.PI * 2);
    ctx.stroke();

    // ---- 3. EVENT HORIZON (pure black, perfect circle) ----
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, rs, 0, Math.PI * 2);
    ctx.fill();

    // ---- 4. EINSTEIN RING (lensed background - subtle) ----
    if (params.lensStrength > 0.01) {
      const erR = rs * 2.6; // Einstein ring radius for background sources
      const erGrad = ctx.createRadialGradient(0, 0, erR * 0.995, 0, 0, erR * 1.005);
      erGrad.addColorStop(0, 'rgba(255,220,170,0)');
      erGrad.addColorStop(0.5, `rgba(255,220,170,${0.04 * params.lensStrength})`);
      erGrad.addColorStop(1, 'rgba(255,200,140,0)');
      ctx.strokeStyle = erGrad;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, erR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ============================================
  // Animation Loop
  // ============================================
  function animate(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min(ts - lastTime, 33) * 0.001;
    lastTime = ts;

    const params = scrollCtrl.getParams();

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Stars
    drawStars(ctx, ts);

    // Blackhole (includes disk, photon ring, horizon)
    renderBlackhole(ctx, params, ts);

    // Particles (sparse dust streams)
    if (!prefersReducedMotion) {
      const spawnChance = params.particleSpawnRate * dt;
      for (let i = 0; i < 2; i++) if (rng() < spawnChance) {
        const ang = rng() * Math.PI * 2;
        const r = lerp(bh.r_disk_in, bh.r_disk_out, rng() ** 0.5);
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        const vOrb = Math.sqrt(1 / r) * 150;
        const vx = -Math.sin(ang) * vOrb + Math.cos(ang) * 20;
        const vy = Math.cos(ang) * vOrb + Math.sin(ang) * 20;
        particlePool.spawn(x, y, vx, vy, 0.8 + rng() * 1.5, 30 + rng() * 20, 2 + rng() * 4);
      }
      particlePool.update(dt, bh);
      particlePool.render(ctx);
    }

    requestAnimationFrame(animate);
  }

  // ============================================
  // Init & Resize
  // ============================================
  function resize() {
    dpr = Math.min(window.devicePixelRatio, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = width * 0.5;
    cy = height * 0.5;
    initStars(STAR_COUNT, width, height);
    starfieldDirty = true;
    buildDiskColors();
  }

  function onScroll() { scrollY = window.scrollY; }

  function init() {
    rng = mulberry32((width || 1920) * 10000 + (height || 1080));
    resize();
    particlePool = new ParticlePool(PARTICLE_COUNT);
    scrollCtrl.init();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    lastTime = performance.now();
    requestAnimationFrame(animate);
  }

  document.querySelector('.cta-btn').addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
