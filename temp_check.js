
    (function() {
      'use strict';

      // ============================================================
      // CORE UTILITIES
      // ============================================================
      const Utils = {
        seed: Date.now(),
        rand() {
          this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
          return this.seed / 4294967296;
        },
        randRange(min, max) { return min + this.rand() * (max - min); },
        randInt(min, max) { return Math.floor(this.randRange(min, max + 1)); },
        randChoice(arr) { return arr[this.randInt(0, arr.length - 1)]; },

        lerp(a, b, t) { return a + (b - a) * t; },
        clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
        map(v, a1, a2, b1, b2) { return b1 + (v - a1) * (b2 - b1) / (a2 - a1); },
        dist(x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return Math.hypot(dx, dy); },
        angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); },

        hslToRgb(h, s, l) {
          s /= 100; l /= 100;
          const k = n => (n + h / 30) % 12;
          const a = s * Math.min(l, 1 - l);
          const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
          return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
        },

        hexToRgb(hex) {
          const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
        },

        rgbToHex(r, g, b) {
          return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        },

        now: () => performance.now(),
      };

      // ============================================================
      // PARTICLE POOL — Object Pooling for 60fps
      // ============================================================
      class ParticlePool {
        constructor(maxSize = 3000) {
          this.maxSize = maxSize;
          this.particles = new Array(maxSize);
          this.active = new Uint16Array(maxSize);
          this.activeCount = 0;
          this.freeList = new Uint16Array(maxSize);
          this.freeCount = maxSize;
          for (let i = 0; i < maxSize; i++) this.freeList[i] = i;
        }

        acquire() {
          if (this.freeCount === 0) return null;
          const idx = this.freeList[--this.freeCount];
          this.active[this.activeCount++] = idx;
          return idx;
        }

        release(idx) {
          for (let i = 0; i < this.activeCount; i++) {
            if (this.active[i] === idx) {
              this.active[i] = this.active[--this.activeCount];
              this.freeList[this.freeCount++] = idx;
              return;
            }
          }
        }

        getActiveIndices() { return this.active.subarray(0, this.activeCount); }

        resize(newMaxSize) {
          if (newMaxSize >= this.maxSize) return;
          this.maxSize = newMaxSize;
          this.active = new Uint16Array(newMaxSize);
          this.freeList = new Uint16Array(newMaxSize);
          this.activeCount = 0;
          this.freeCount = newMaxSize;
          for (let i = 0; i < newMaxSize; i++) this.freeList[i] = i;
        }
      }

      // ============================================================
      // PARTICLE TYPE DEFINITIONS
      // ============================================================
      const ParticleType = {
        CORE: 0, PLASMA: 1, DEBRIS: 2, SHOCKWAVE: 3,
        SPARK: 4, ASH: 5, PHOTON: 6, NEUTRINO: 7
      };

      const TYPE_CONFIG = {
        [ParticleType.CORE]:      { life: 3.0, size: [8, 24], speed: [50, 150], gravity: 0.1, drag: 0.98, colors: ['#fff', '#cff', '#ffd700', '#ff8c00', '#ff4444'], glow: true, ring: false, trail: false, rotate: false },
        [ParticleType.PLASMA]:    { life: 2.5, size: [4, 16], speed: [100, 300], gravity: 0.05, drag: 0.96, colors: ['#00ffff', '#4488ff', '#8844ff', '#ff44aa'], glow: true, ring: false, trail: false, rotate: false },
        [ParticleType.DEBRIS]:    { life: 5.0, size: [2, 10], speed: [30, 120], gravity: 0.3, drag: 0.99, colors: ['#888', '#aaa', '#666', '#999', '#555'], glow: false, ring: false, trail: false, rotate: true },
        [ParticleType.SHOCKWAVE]: { life: 1.5, size: [2, 8],  speed: [200, 500], gravity: 0, drag: 0.92, colors: ['#fff', '#88ffff', '#8888ff', '#ff88ff'], glow: true, ring: true, trail: false, rotate: false },
        [ParticleType.SPARK]:     { life: 0.8, size: [1, 4],  speed: [150, 400], gravity: 0.2, drag: 0.95, colors: ['#fff', '#ffff88', '#ffaa44'], glow: true, ring: false, trail: false, rotate: false },
        [ParticleType.ASH]:       { life: 8.0, size: [1, 6],  speed: [10, 50],  gravity: 0.4, drag: 0.995, colors: ['#222', '#333', '#111', '#444'], glow: false, ring: false, trail: false, rotate: false },
        [ParticleType.PHOTON]:    { life: 0.5, size: [0.5, 2], speed: [800, 1500], gravity: 0, drag: 1.0, colors: ['#fff', '#aaffff', '#ffaaff'], glow: true, ring: false, trail: true, rotate: false },
        [ParticleType.NEUTRINO]:  { life: 0.3, size: [0.5, 1], speed: [2000, 4000], gravity: 0, drag: 1.0, colors: ['#88ffff'], glow: false, ring: false, trail: false, rotate: false },
      };

      // ============================================================
      // PARTICLE CLASS — Data-oriented design
      // ============================================================
      class Particle {
        constructor() {
          this.x = 0; this.y = 0;
          this.vx = 0; this.vy = 0;
          this.ax = 0; this.ay = 0;
          this.life = 0; this.maxLife = 1;
          this.age = 0;
          this.size = 0; this.startSize = 0; this.endSize = 0;
          this.rotation = 0; this.rotationSpeed = 0;
          this.color = '#fff'; this.glowColor = '#fff';
          this.alpha = 1; this.startAlpha = 1; this.endAlpha = 0;
          this.type = 0;
          this.trail = [];
          this.maxTrail = 8;
        }

        init(x, y, type, angleOverride = null, speedOverride = null) {
          const cfg = TYPE_CONFIG[type];
          this.x = x; this.y = y;
          this.type = type;
          this.maxLife = cfg.life;
          this.age = 0;
          this.startSize = Utils.randRange(...cfg.size);
          this.endSize = cfg.ring ? this.startSize * 3 : this.startSize * 0.1;
          this.size = this.startSize;
          this.startAlpha = 1;
          this.endAlpha = 0;
          this.alpha = 1;
          this.color = Utils.randChoice(cfg.colors);
          this.glowColor = this.color;
          this.rotation = Utils.randRange(0, Math.PI * 2);
          this.rotationSpeed = cfg.rotate ? Utils.randRange(-0.5, 0.5) : 0;

          const angle = angleOverride !== null ? angleOverride : Utils.randRange(0, Math.PI * 2);
          const speed = speedOverride !== null ? speedOverride : Utils.randRange(...cfg.speed);
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.ax = 0; this.ay = cfg.gravity * 50;

          this.trail.length = 0;
          return this;
        }

        update(dt) {
          this.age += dt;
          const t = this.age / this.maxLife;
          if (t >= 1) return false;

          const cfg = TYPE_CONFIG[this.type];
          this.vx *= cfg.drag;
          this.vy *= cfg.drag;
          this.vx += this.ax * dt;
          this.vy += this.ay * dt;
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.rotation += this.rotationSpeed * dt;

          this.size = Utils.lerp(this.startSize, this.endSize, t);
          this.alpha = Utils.lerp(this.startAlpha, this.endAlpha, t);

          if (cfg.trail) {
            this.trail.unshift({ x: this.x, y: this.y, alpha: this.alpha * 0.5 });
            if (this.trail.length > this.maxTrail) this.trail.pop();
          }

          return true;
        }
      }

      // ============================================================
      // PARTICLE SYSTEM — Main emitter manager
      // ============================================================
      class ParticleSystem {
        constructor(canvas, pool) {
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
          this.pool = pool;
          this.particles = new Array(pool.maxSize).fill(null).map(() => new Particle());
          this.emitters = [];
          this.gravityWells = [];
          this.time = 0;
          this.mouse = { x: 0, y: 0, down: false };
          this.screenShake = { x: 0, y: 0, intensity: 0, decay: 0.9 };
          this.width = 0; this.height = 0;
          this.centerX = 0; this.centerY = 0;
        }

        resize(w, h) {
          const dpr = window.devicePixelRatio || 1;
          this.canvas.width = w * dpr;
          this.canvas.height = h * dpr;
          this.canvas.style.width = w + 'px';
          this.canvas.style.height = h + 'px';
          this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          this.width = w; this.height = h;
          this.centerX = w * 0.5; this.centerY = h * 0.5;
        }

        emitSupernova(x, y, intensity = 1) {
          const count = Math.floor(800 * intensity);
          // Core explosion
          for (let i = 0; i < count * 0.15; i++) this.emit(x, y, ParticleType.CORE);
          // Plasma streams
          for (let i = 0; i < count * 0.25; i++) this.emit(x, y, ParticleType.PLASMA);
          // Debris field
          for (let i = 0; i < count * 0.2; i++) this.emit(x, y, ParticleType.DEBRIS);
          // Shockwave rings
          this.emitShockwave(x, y, intensity);
          // Sparks
          for (let i = 0; i < count * 0.15; i++) this.emit(x, y, ParticleType.SPARK);
          // Photons (light burst)
          for (let i = 0; i < count * 0.1; i++) this.emit(x, y, ParticleType.PHOTON);
          // Neutrinos (instant burst)
          for (let i = 0; i < count * 0.05; i++) this.emit(x, y, ParticleType.NEUTRINO);
          // Screen shake
          this.screenShake.intensity = 15 * intensity;
          // Stats update
          this.updateStats(intensity);
        }

        emitShockwave(x, y, intensity) {
          const rings = 3 + Math.floor(intensity * 2);
          for (let r = 0; r < rings; r++) {
            const delay = r * 0.08;
            setTimeout(() => {
              const particles = 60 + r * 20;
              for (let i = 0; i < particles; i++) {
                const angle = (i / particles) * Math.PI * 2;
                const idx = this.pool.acquire();
                if (idx !== null) {
                  const p = this.particles[idx];
                  p.init(x, y, ParticleType.SHOCKWAVE, angle, 300 + r * 100);
                  p.maxLife = 1.2 + r * 0.3;
                }
              }
            }, delay * 1000);
          }
        }

        emitCollapse(x, y) {
          const count = 400;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = Utils.randRange(100, 400);
            const sx = x + Math.cos(angle) * dist;
            const sy = y + Math.sin(angle) * dist;
            const idx = this.pool.acquire();
            if (idx !== null) {
              const p = this.particles[idx];
              p.init(sx, sy, ParticleType.PLASMA, angle + Math.PI, Utils.randRange(200, 400));
              p.maxLife = 2.0;
            }
          }
          setTimeout(() => this.emitSupernova(x, y, 0.6), 600);
          this.screenShake.intensity = 20;
        }

        emitClickExplosion(x, y) {
          for (let i = 0; i < 30; i++) this.emit(x, y, ParticleType.SPARK);
          for (let i = 0; i < 15; i++) this.emit(x, y, ParticleType.PLASMA);
          for (let i = 0; i < 8; i++) this.emit(x, y, ParticleType.PHOTON);
          this.emitShockwave(x, y, 0.3);
        }

        emit(x, y, type, angle = null, speed = null) {
          const idx = this.pool.acquire();
          if (idx === null) return;
          this.particles[idx].init(x, y, type, angle, speed);
        }

        addGravityWell(x, y, strength, radius) {
          this.gravityWells.push({ x, y, strength, radius, life: 3 });
        }

        updateStats(intensity) {
          const energy = (1.2 * intensity).toFixed(1);
          const temp = Math.floor(1e9 * intensity);
          const velocity = Math.floor(30000 * intensity);
          window.supernovaStats = { energy, temp, velocity };
        }

        update(dt) {
          this.time += dt;

          // Screen shake decay
          this.screenShake.intensity *= this.screenShake.decay;
          this.screenShake.x = (Utils.rand() - 0.5) * this.screenShake.intensity;
          this.screenShake.y = (Utils.rand() - 0.5) * this.screenShake.intensity;

          // Update gravity wells
          for (let i = this.gravityWells.length - 1; i >= 0; i--) {
            const w = this.gravityWells[i];
            w.life -= dt;
            if (w.life <= 0) { this.gravityWells.splice(i, 1); continue; }

            const active = this.pool.getActiveIndices();
            for (const idx of active) {
              const p = this.particles[idx];
              const dx = w.x - p.x;
              const dy = w.y - p.y;
              const dist = Math.hypot(dx, dy);
              if (dist < w.radius && dist > 1) {
                const force = (w.strength / (dist * dist)) * dt;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
              }
            }
          }

          // Update particles
          const active = this.pool.getActiveIndices();
          const w = this.width, h = this.height;
          const margin = 100;
          for (let i = active.length - 1; i >= 0; i--) {
            const idx = active[i];
            const p = this.particles[idx];
            if (!p.update(dt) || p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) {
              this.pool.release(idx);
            }
          }
        }

        render() {
          const ctx = this.ctx;
          const w = this.width, h = this.height;

          // Clear with motion blur trail
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'rgba(8, 8, 12, 0.15)';
          ctx.fillRect(0, 0, w, h);

          // Apply screen shake
          ctx.save();
          ctx.translate(this.screenShake.x, this.screenShake.y);

          const active = this.pool.getActiveIndices();

          // Pass 1: Non-glow particles (opaque)
          ctx.globalCompositeOperation = 'source-over';
          for (const idx of active) {
            const p = this.particles[idx];
            const cfg = TYPE_CONFIG[p.type];
            if (cfg.glow) continue;
            this.drawParticle(ctx, p);
          }

          // Pass 2: Glow particles (additive blend)
          ctx.globalCompositeOperation = 'lighter';
          for (const idx of active) {
            const p = this.particles[idx];
            const cfg = TYPE_CONFIG[p.type];
            if (!cfg.glow) continue;
            this.drawParticle(ctx, p);
          }

          ctx.restore();
        }

        drawParticle(ctx, p) {
          const cfg = TYPE_CONFIG[p.type];
          const t = p.age / p.maxLife;

          // Trail
          if (p.trail.length > 1) {
            for (let i = 0; i < p.trail.length; i++) {
              const tp = p.trail[i];
              const ts = p.size * (1 - i / p.trail.length) * 0.5;
              const ta = tp.alpha * 0.4;
              ctx.beginPath();
              ctx.arc(tp.x, tp.y, ts, 0, Math.PI * 2);
              const [r, g, b] = Utils.hexToRgb(p.color);
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${ta})`;
              ctx.fill();
            }
          }

          // Main particle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;

          if (cfg.ring) {
            // Shockwave ring
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            const [r, g, b] = Utils.hexToRgb(p.color);
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
            grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.8})`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();

            if (cfg.glow) {
              ctx.shadowColor = p.glowColor;
              ctx.shadowBlur = p.size * 2;
              ctx.fill();
            }
          } else {
            // Standard particle with radial gradient
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            const [r, g, b] = Utils.hexToRgb(p.color);
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha})`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();

            if (cfg.glow) {
              ctx.shadowColor = p.glowColor;
              ctx.shadowBlur = p.size * 1.5;
              ctx.fill();
            }
          }
          ctx.restore();
        }
      }

      // ============================================================
      // WEBGL STARFIELD — Background layer
      // ============================================================
      class WebGLStarfield {
        constructor(canvas) {
          this.canvas = canvas;
          this.gl = null;
          this.program = null;
          this.buffers = {};
          this.starCount = 3000;
          this.time = 0;
          this.mouse = { x: 0.5, y: 0.5 };
          this.active = false;
          this.init();
        }

        init() {
          try {
            this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: false, desynchronized: true });
            if (!this.gl) return;

            const gl = this.gl;

            // Vertex shader
            const vsSource = `
              attribute vec2 a_position;
              attribute float a_size;
              attribute vec3 a_color;
              attribute float a_phase;
              uniform float u_time;
              uniform vec2 u_resolution;
              uniform vec2 u_mouse;
              varying vec3 v_color;
              varying float v_size;
              void main() {
                vec2 pos = a_position;
                pos.x += sin(u_time * 0.05 + a_phase) * 0.3;
                pos.y += cos(u_time * 0.03 + a_phase) * 0.2;
                vec2 mouseNorm = (u_mouse - 0.5) * 2.0;
                pos += mouseNorm * 0.15 * a_size;
                pos = mod(pos + 1.0, 2.0) - 1.0;
                gl_Position = vec4(pos, 0.0, 1.0);
                v_color = a_color;
                v_size = a_size * (1.0 + sin(u_time * 2.0 + a_phase * 10.0) * 0.3);
                gl_PointSize = v_size * u_resolution.y * 0.01;
              }
            `;

            // Fragment shader
            const fsSource = `
              precision mediump float;
              varying vec3 v_color;
              varying float v_size;
              void main() {
                vec2 center = gl_PointCoord - 0.5;
                float dist = length(center) * 2.0;
                float alpha = smoothstep(1.0, 0.0, dist) * v_size;
                float cross = max(1.0 - abs(center.x) * 20.0, 1.0 - abs(center.y) * 20.0) * 0.3;
                alpha = max(alpha, cross);
                gl_FragColor = vec4(v_color, alpha);
              }
            `;

            this.program = this.createProgram(vsSource, fsSource);
            if (!this.program) return;

            // Generate star data
            const positions = new Float32Array(this.starCount * 2);
            const sizes = new Float32Array(this.starCount);
            const colors = new Float32Array(this.starCount * 3);
            const phases = new Float32Array(this.starCount);

            const colorPalette = [
              [1.0, 1.0, 1.0],     // white
              [0.8, 0.9, 1.0],     // blue-white
              [0.2, 0.8, 1.0],     // cyan
              [1.0, 0.85, 0.0],    // gold
              [1.0, 0.55, 0.0],    // orange
              [1.0, 0.3, 0.3],     // red
              [1.0, 0.4, 0.8],     // magenta
            ];

            for (let i = 0; i < this.starCount; i++) {
              positions[i * 2] = Utils.randRange(-1, 1);
              positions[i * 2 + 1] = Utils.randRange(-1, 1);
              sizes[i] = Utils.randRange(0.5, 2.5);
              const c = colorPalette[Utils.randInt(0, colorPalette.length - 1)];
              colors[i * 3] = c[0];
              colors[i * 3 + 1] = c[1];
              colors[i * 3 + 2] = c[2];
              phases[i] = Utils.randRange(0, Math.PI * 2);
            }

            this.buffers.position = this.createBuffer(positions, 2);
            this.buffers.size = this.createBuffer(sizes, 1);
            this.buffers.color = this.createBuffer(colors, 3);
            this.buffers.phase = this.createBuffer(phases, 1);

            this.u_time = gl.getUniformLocation(this.program, 'u_time');
            this.u_resolution = gl.getUniformLocation(this.program, 'u_resolution');
            this.u_mouse = gl.getUniformLocation(this.program, 'u_mouse');

            this.active = true;
            // Hide CSS fallback
            this.canvas.style.background = 'transparent';
          } catch (e) {
            console.warn('WebGL unavailable, using CSS fallback:', e);
            this.active = false;
          }
        }

        createShader(type, source) {
          const gl = this.gl;
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
          }
          return shader;
        }

        createProgram(vs, fs) {
          const gl = this.gl;
          const vsShader = this.createShader(gl.VERTEX_SHADER, vs);
          const fsShader = this.createShader(gl.FRAGMENT_SHADER, fs);
          if (!vsShader || !fsShader) return null;
          const program = gl.createProgram();
          gl.attachShader(program, vsShader);
          gl.attachShader(program, fsShader);
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
          }
          return program;
        }

        createBuffer(data, components) {
          const gl = this.gl;
          const buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
          return { buffer, components, count: data.length / components };
        }

        resize(w, h) {
          const dpr = window.devicePixelRatio || 1;
          this.canvas.width = w * dpr;
          this.canvas.height = h * dpr;
          this.canvas.style.width = w + 'px';
          this.canvas.style.height = h + 'px';
          if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }

        setMouse(x, y) {
          this.mouse.x = x; this.mouse.y = y;
        }

        render(dt) {
          if (!this.active || !this.gl || !this.program) return;
          const gl = this.gl;
          this.time += dt;

          gl.useProgram(this.program);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.disable(gl.DEPTH_TEST);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);

          gl.uniform1f(this.u_time, this.time * 0.001);
          gl.uniform2f(this.u_resolution, this.canvas.width, this.canvas.height);
          gl.uniform2f(this.u_mouse, this.mouse.x, this.mouse.y);

          const attrs = ['a_position', 'a_size', 'a_color', 'a_phase'];
          const bufs = [this.buffers.position, this.buffers.size, this.buffers.color, this.buffers.phase];
          for (let i = 0; i < attrs.length; i++) {
            const loc = gl.getAttribLocation(this.program, attrs[i]);
            gl.enableVertexAttribArray(loc);
            gl.bindBuffer(gl.ARRAY_BUFFER, bufs[i].buffer);
            gl.vertexAttribPointer(loc, bufs[i].components, gl.FLOAT, false, 0, 0);
          }

          gl.drawArrays(gl.POINTS, 0, this.starCount);
        }

        setStarCount(count) {
          if (!this.active) return;
          this.starCount = count;
          // Re-init would be needed for actual buffer resize, but we just limit draw calls
        }
      }

      // ============================================================
      // MAIN APPLICATION CONTROLLER
      // ============================================================
      class SupernovaApp {
        constructor() {
          this.canvas2d = document.getElementById('particle-canvas');
          this.canvasWebGL = document.getElementById('webgl-canvas');
          this.overlay = document.getElementById('overlay');
          this.btnSupernova = document.getElementById('trigger-supernova');
          this.btnCollapse = document.getElementById('trigger-collapse');
          this.phasesContainer = document.getElementById('phases-container');
          this.lensFlare = document.querySelector('.lens-flare');

          this.pool = new ParticlePool(3000);
          this.particleSystem = new ParticleSystem(this.canvas2d, this.pool);
          this.starfield = new WebGLStarfield(this.canvasWebGL);

          this.lastTime = 0;
          this.running = false;
          this.mouse = { x: 0.5, y: 0.5 };
          this.scrollY = 0;
          this.frameTimes = [];
          this.adaptiveQuality = false;

          this.init();
        }

        init() {
          this.setupEventListeners();
          this.buildPhaseCards();
          this.resize();
          this.start();

          // Trigger initial supernova after brief delay
          setTimeout(() => this.triggerSupernova(), 800);
        }

        setupEventListeners() {
          // Resize
          window.addEventListener('resize', () => this.resize(), { passive: true });

          // Mouse move (parallax)
          window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / window.innerWidth;
            this.mouse.y = e.clientY / window.innerHeight;
            this.starfield.setMouse(this.mouse.x, this.mouse.y);
            this.updateHeroParallax(e.clientX, e.clientY);
          }, { passive: true });

          // Touch support
          window.addEventListener('touchmove', (e) => {
            if (e.touches[0]) {
              this.mouse.x = e.touches[0].clientX / window.innerWidth;
              this.mouse.y = e.touches[0].clientY / window.innerHeight;
              this.starfield.setMouse(this.mouse.x, this.mouse.y);
              this.updateHeroParallax(e.touches[0].clientX, e.touches[0].clientY);
            }
          }, { passive: true });

          // Click explosion
          window.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            this.particleSystem.emitClickExplosion(e.clientX, e.clientY);
          }, { passive: true });

          // Buttons
          this.btnSupernova.addEventListener('click', (e) => {
            e.target.classList.add('burst');
            setTimeout(() => e.target.classList.remove('burst'), 600);
            this.triggerSupernova();
          });

          this.btnCollapse.addEventListener('click', (e) => {
            e.target.classList.add('burst');
            setTimeout(() => e.target.classList.remove('burst'), 600);
            this.triggerCollapse();
          });

          // Scroll for phase cards
          window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            this.checkPhaseVisibility();
          }, { passive: true });

          // Context menu prevention for right-click
          window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.particleSystem.emitClickExplosion(e.clientX, e.clientY);
          }, { passive: false });

          // Stats animation
          this.animateStats();
        }

        updateHeroParallax(clientX, clientY) {
          const hero = document.querySelector('.hero');
          if (!hero) return;
          const cx = window.innerWidth * 0.5;
          const cy = window.innerHeight * 0.5;
          const dx = (clientX - cx) / cx;
          const dy = (clientY - cy) / cy;
          hero.style.transform = `perspective(1000px) rotateY(${dx * -15}deg) rotateX(${dy * 10}deg) translateZ(0)`;
        }

        buildPhaseCards() {
          const phases = [
            { num: '01', title: 'CORE COLLAPSE', desc: 'Iron core exceeds Chandrasekhar limit (1.44 M☉). Electron degeneracy pressure fails. Core implodes at 70,000 km/s.' },
            { num: '02', title: 'NEUTRINO BURST', desc: '10^58 neutrinos released in 10 seconds. Carry 99% of supernova energy (100 foe). Pass through star unimpeded.' },
            { num: '03', title: 'SHOCKWAVE PROPAGATION', desc: 'Bounce shockwave stalls, revived by neutrino heating. Blows off stellar envelope at 10,000–30,000 km/s.' },
            { num: '04', title: 'R-PROCESS NUCLEOSYNTHESIS', desc: 'Rapid neutron capture creates heavy elements (gold, platinum, uranium). Seeds galaxy with r-process material.' },
            { num: '05', title: 'REMNANT FORMATION', desc: 'Core becomes neutron star (pulsar) or black hole. Ejecta expands into supernova remnant (SNR) for millennia.' },
          ];

          this.phasesContainer.innerHTML = phases.map(p => `
            <article class="phase-card" data-phase="${p.num}">
              <div class="phase-number">${p.num}</div>
              <h3 class="phase-title">${p.title}</h3>
              <p class="phase-desc">${p.desc}</p>
            </article>
          `).join('');
        }

        checkPhaseVisibility() {
          const cards = document.querySelectorAll('.phase-card');
          const trigger = window.innerHeight * 0.75;
          cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < trigger) {
              setTimeout(() => card.classList.add('visible'), i * 100);
            }
          });
        }

        animateStats() {
          const energyEl = document.getElementById('stat-energy');
          const tempEl = document.getElementById('stat-temp');
          const velocityEl = document.getElementById('stat-velocity');

          let currentEnergy = 0, currentTemp = 0, currentVelocity = 0;

          const animate = () => {
            if (window.supernovaStats) {
              const targetEnergy = parseFloat(window.supernovaStats.energy);
              const targetTemp = parseInt(window.supernovaStats.temp);
              const targetVelocity = parseInt(window.supernovaStats.velocity);

              currentEnergy += (targetEnergy - currentEnergy) * 0.1;
              currentTemp += (targetTemp - currentTemp) * 0.1;
              currentVelocity += (targetVelocity - currentVelocity) * 0.1;

              energyEl.textContent = currentEnergy.toFixed(1);
              tempEl.textContent = currentTemp.toLocaleString();
              velocityEl.textContent = currentVelocity.toLocaleString();
            }
            requestAnimationFrame(animate);
          };
          animate();
        }

        resize() {
          const w = window.innerWidth;
          const h = window.innerHeight;
          this.particleSystem.resize(w, h);
          this.starfield.resize(w, h);
        }

        triggerSupernova() {
          const cx = this.particleSystem.centerX;
          const cy = this.particleSystem.centerY;
          this.particleSystem.emitSupernova(cx, cy, 1.0);
        }

        triggerCollapse() {
          const cx = this.particleSystem.centerX;
          const cy = this.particleSystem.centerY;
          this.particleSystem.emitCollapse(cx, cy);
        }

        checkPerformance(dt) {
          this.frameTimes.push(dt);
          if (this.frameTimes.length > 60) this.frameTimes.shift();
          const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

          if (!this.adaptiveQuality && avg > 0.020) {
            // Reduce quality
            this.adaptiveQuality = true;
            this.pool.resize(1500);
            this.starfield.setStarCount(1500);
            // Disable trails for photons
            TYPE_CONFIG[6].trail = false;
            console.log('Adaptive quality enabled: reduced particle count');
          }
        }

        start() {
          this.running = true;
          this.lastTime = performance.now();
          this.loop();
        }

        loop(now) {
          if (!this.running) return;
          const dt = Math.min((now - this.lastTime) * 0.001, 0.05);
          this.lastTime = now;

          this.checkPerformance(dt);
          this.particleSystem.update(dt);
          this.starfield.render(dt);
          this.particleSystem.render();

          requestAnimationFrame((t) => this.loop(t));
        }
      }

      // ============================================================
      // BOOTSTRAP
      // ============================================================
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          window.app = new SupernovaApp();
        });
      } else {
        window.app = new SupernovaApp();
      }
    })();
  