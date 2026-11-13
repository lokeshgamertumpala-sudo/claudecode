import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const state = {
  sketch: null,
  analysis: null,
  spec: null,
  sceneConfig: null,
  three: { scene: null, camera: null, renderer: null, controls: null, labelRenderer: null, satelliteGroup: null, animationId: null }
};

const els = {
  canvas: document.getElementById('sketchCanvas'),
  canvasWrapper: document.getElementById('canvasWrapper'),
  canvasOverlay: document.getElementById('canvasOverlay'),
  strokeColor: document.getElementById('strokeColor'),
  clearCanvas: document.getElementById('clearCanvas'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  exportBtn: document.getElementById('exportBtn'),
  resetViewBtn: document.getElementById('resetViewBtn'),
  specOutput: document.getElementById('specOutput'),
  validationResults: document.getElementById('validationResults'),
  viewerPlaceholder: document.getElementById('viewerPlaceholder'),
  threeContainer: document.getElementById('threeContainer'),
  progressOverlay: document.getElementById('progressOverlay'),
  progressText: document.getElementById('progressText'),
  progressSubtext: document.getElementById('progressSubtext'),
  toastContainer: document.getElementById('toastContainer'),
  nimStatus: document.getElementById('nimStatus')
};

let currentTool = 'pen';
let isDrawing = false;
let lastPoint = null;
const ctx = els.canvas.getContext('2d', { willReadFrequently: true });

function resizeCanvas() {
  const rect = els.canvasWrapper.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = rect.width * dpr;
  els.canvas.height = rect.height * dpr;
  els.canvas.style.width = rect.width + 'px';
  els.canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);
  if (state.sketch) {
    ctx.drawImage(state.sketch, 0, 0, rect.width, rect.height);
  }
}

function initCanvas() {
  resizeCanvas();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = els.strokeColor.value;
  window.addEventListener('resize', resizeCanvas);
}

function getPoint(e) {
  const rect = els.canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDrawing(e) {
  isDrawing = true;
  lastPoint = getPoint(e);
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
}

function draw(e) {
  if (!isDrawing) return;
  const pt = getPoint(e);
  ctx.lineTo(pt.x, pt.y);
  ctx.stroke();
  lastPoint = pt;
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    state.sketch = new Image();
    state.sketch.src = els.canvas.toDataURL('image/png');
    els.canvasWrapper.classList.add('has-content');
    els.canvasOverlay.classList.add('hidden');
    els.analyzeBtn.disabled = false;
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  state.sketch = null;
  els.canvasWrapper.classList.remove('has-content');
  els.canvasOverlay.classList.remove('hidden');
  els.analyzeBtn.disabled = true;
  hideValidationResults();
}

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  const cursors = { pen: 'crosshair', eraser: 'cell', rect: 'crosshair', circle: 'crosshair', line: 'crosshair' };
  els.canvas.style.cursor = cursors[tool] || 'crosshair';
  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 3;
  }
}

els.canvas.addEventListener('mousedown', startDrawing);
els.canvas.addEventListener('mousemove', draw);
els.canvas.addEventListener('mouseup', stopDrawing);
els.canvas.addEventListener('mouseleave', stopDrawing);
els.canvas.addEventListener('touchstart', startDrawing, { passive: true });
els.canvas.addEventListener('touchmove', draw, { passive: true });
els.canvas.addEventListener('touchend', stopDrawing);

els.canvasWrapper.addEventListener('dragover', e => { e.preventDefault(); els.canvasWrapper.classList.add('drag-over'); });
els.canvasWrapper.addEventListener('dragleave', () => els.canvasWrapper.classList.remove('drag-over'));
els.canvasWrapper.addEventListener('drop', e => {
  e.preventDefault();
  els.canvasWrapper.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImageFile(file);
});
els.canvasWrapper.addEventListener('click', e => {
  if (e.target === els.canvasWrapper || e.target === els.canvasOverlay || e.target.closest('.canvas-overlay')) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => input.files[0] && loadImageFile(input.files[0]);
    input.click();
  }
});

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const rect = els.canvasWrapper.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const scale = Math.min(rect.width / img.width, rect.height / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (rect.width - w) / 2, (rect.height - h) / 2, w, h);
      state.sketch = img;
      els.canvasWrapper.classList.add('has-content');
      els.canvasOverlay.classList.add('hidden');
      els.analyzeBtn.disabled = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => setTool(btn.dataset.tool));
});
els.clearCanvas.addEventListener('click', clearCanvas);
els.strokeColor.addEventListener('input', () => { ctx.strokeStyle = els.strokeColor.value; });

async function checkNIMStatus() {
  try {
    const res = await fetch('http://127.0.0.1:4000/v1/models', { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      els.nimStatus.className = 'status-badge connected';
      els.nimStatus.innerHTML = '<span class="dot"></span><span>NIM: Connected</span>';
      return true;
    }
  } catch {}
  els.nimStatus.className = 'status-badge warning';
  els.nimStatus.innerHTML = '<span class="dot"></span><span>NIM: Offline (fallback)</span>';
  return false;
}

function showProgress(text, subtext) {
  els.progressText.textContent = text;
  els.progressSubtext.textContent = subtext;
  els.progressOverlay.classList.add('visible');
}

function hideProgress() {
  els.progressOverlay.classList.remove('visible');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = {
    success: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  toast.innerHTML = `${icons[type]}<span class="message">${message}</span><button class="close">&times;</button>`;
  toast.querySelector('.close').addEventListener('click', () => toast.remove());
  els.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 8000);
}

function showValidationResults(validation) {
  els.validationResults.style.display = 'grid';
  els.validationResults.innerHTML = '';
  const categories = ['orbital', 'power', 'structural', 'thermal', 'communications'];
  categories.forEach(cat => {
    const catData = validation[cat] || {};
    const issues = catData.issues || [];
    const errors = issues.filter(i => i.type === 'error').length;
    const warnings = issues.filter(i => i.type === 'warning').length;
    let status = 'pass';
    if (errors > 0) status = 'error';
    else if (warnings > 0) status = 'warning';
    const card = document.createElement('div');
    card.className = `validation-card ${status}`;
    card.innerHTML = `<div class="label">${cat}</div><div class="value">${errors > 0 ? errors + 'E' : warnings > 0 ? warnings + 'W' : 'OK'}</div>`;
    card.title = issues.map(i => `${i.type.toUpperCase()}: ${i.message}`).join('\n') || 'No issues';
    els.validationResults.appendChild(card);
  });
}

function hideValidationResults() {
  els.validationResults.style.display = 'none';
  els.validationResults.innerHTML = '';
}

function renderSpec(spec) {
  els.specOutput.innerHTML = '';
  if (!spec) return;
  const sections = [
    { key: 'bus', title: 'Bus', icon: 'cube' },
    { key: 'power', title: 'Power', icon: 'zap' },
    { key: 'comms', title: 'Communications', icon: 'radio' },
    { key: 'thermal', title: 'Thermal', icon: 'thermometer' },
    { key: 'payload', title: 'Payload', icon: 'box' },
    { key: 'orbit', title: 'Orbit', icon: 'globe' },
    { key: 'adcs', title: 'ADCS', icon: 'gyroscope' },
    { key: 'propulsion', title: 'Propulsion', icon: 'rocket' }
  ];
  sections.forEach(s => {
    if (spec[s.key]) {
      const card = document.createElement('div');
      card.className = 'analysis-card';
      card.innerHTML = `<h3>${s.title}</h3><pre>${JSON.stringify(spec[s.key], null, 2)}</pre>`;
      els.specOutput.appendChild(card);
    }
  });
  if (spec.notes) {
    const card = document.createElement('div');
    card.className = 'analysis-card';
    card.innerHTML = `<h3>Notes</h3><pre>${spec.notes}</pre>`;
    els.specOutput.appendChild(card);
  }
}

async function analyzeSketch() {
  if (!state.sketch) return;
  els.analyzeBtn.disabled = true;
  showProgress('Analyzing sketch...', 'Processing with NVIDIA NIM vision model');
  try {
    const base64 = els.canvas.toDataURL('image/png').split(',')[1];
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Analysis failed');
    state.analysis = data.analysis;
    showProgress('Generating design spec...', 'Creating technical specification');
    const specRes = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satellite: parseAnalysis(state.analysis) })
    });
    const specData = await specRes.json();
    if (!specRes.ok) throw new Error(specData.error || 'Generation failed');
    state.spec = specData;
    state.sceneConfig = specData.sceneConfig;
    renderSpec(parseAnalysis(state.analysis));
    showValidationResults(await validateSatellite(parseAnalysis(state.analysis)));
    initThreeJS(state.sceneConfig);
    els.exportBtn.disabled = false;
    els.resetViewBtn.disabled = false;
    showToast('Analysis complete! 3D model generated.', 'success');
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  } finally {
    hideProgress();
    els.analyzeBtn.disabled = false;
  }
}

function parseAnalysis(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return getDefaultSatellite();
}

function getDefaultSatellite() {
  return {
    bus: { dimensions_m: [0.2, 0.2, 0.4], structure_material: 'aluminum', mass_kg: 5 },
    power: { solar_area_m2: 0.3, battery_wh: 50, avg_power_w: 30 },
    comms: { frequency_ghz: 2.4, tx_power_w: 2, antenna_gain_dbi: 5, data_rate_mbps: 1 },
    thermal: { radiator_area_m2: 0.1 },
    payload: { mass_kg: 1, instruments: [] },
    orbit: { altitude_km: 500, inclination_deg: 97.4, eccentricity: 0.001 }
  };
}

async function validateSatellite(sat) {
  try {
    const res = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satellite: sat })
    });
    return await res.json();
  } catch {
    return { orbital: { issues: [] }, power: { issues: [] }, structural: { issues: [] }, thermal: { issues: [] }, communications: { issues: [] } };
  }
}

function initThreeJS(config) {
  const { scene, camera, renderer, controls, labelRenderer, satelliteGroup, animationId } = state.three;
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (labelRenderer) labelRenderer.domElement.remove();

  state.three.scene = new THREE.Scene();
  state.three.scene.background = new THREE.Color(0x0a0f1a);

  const container = els.threeContainer;
  const width = container.clientWidth;
  const height = container.clientHeight;

  state.three.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  state.three.camera.position.set(2, 1.5, 2.5);

  state.three.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  state.three.renderer.setSize(width, height);
  state.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.three.renderer.shadowMap.enabled = true;
  state.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(state.three.renderer.domElement);

  state.three.labelRenderer = new CSS2DRenderer();
  state.three.labelRenderer.setSize(width, height);
  state.three.labelRenderer.domElement.style.position = 'absolute';
  state.three.labelRenderer.domElement.style.top = '0';
  state.three.labelRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(state.three.labelRenderer.domElement);

  state.three.controls = new OrbitControls(state.three.camera, state.three.renderer.domElement);
  state.three.controls.enableDamping = true;
  state.three.controls.dampingFactor = 0.05;
  state.three.controls.minDistance = 0.5;
  state.three.controls.maxDistance = 20;

  buildSatellite(config || getDefaultSatellite());

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  state.three.scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffee, 1.5);
  sun.position.set(5, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  state.three.scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
  fill.position.set(-3, -5, -2);
  state.three.scene.add(fill);

  const earthGeo = new THREE.SphereGeometry(10, 64, 64);
  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a5c,
    roughness: 0.8,
    metalness: 0.1
  });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.position.set(0, -6371, 0);
  state.three.scene.add(earth);

  const stars = createStarfield();
  state.three.scene.add(stars);

  els.viewerPlaceholder.classList.add('hidden');

  animate();

  window.addEventListener('resize', onResize);
}

function buildSatellite(sat) {
  const group = new THREE.Group();
  state.three.satelliteGroup = group;

  const bus = sat.bus || {};
  const [bx, by, bz] = bus.dimensions_m || [0.2, 0.2, 0.4];
  const busMat = getMaterial(bus.structure_material || 'aluminum');
  const busGeo = new THREE.BoxGeometry(bx, by, bz);
  const busMesh = new THREE.Mesh(busGeo, busMat);
  busMesh.castShadow = true;
  busMesh.receiveShadow = true;
  busMesh.userData = { name: 'Bus', type: 'bus' };
  group.add(busMesh);
  addLabel(busMesh, 'Bus', new THREE.Vector3(0, by/2 + 0.05, 0));

  const power = sat.power || {};
  const solarArea = power.solar_area_m2 || 0.3;
  if (power.solar_arrays && power.solar_arrays.length > 0) {
    power.solar_arrays.forEach((arr, i) => {
      const panel = createSolarPanel(arr.area_m2 || solarArea / power.solar_arrays.length);
      const offset = bx/2 + 0.02;
      panel.position.set(
        arr.orientation === 'sun-tracking' ? offset : (i % 2 === 0 ? offset : -offset),
        (i < 2 ? 1 : -1) * by/2,
        0
      );
      if (arr.orientation === 'sun-tracking') panel.rotation.y = Math.PI/2;
      group.add(panel);
    });
  } else if (solarArea > 0) {
    const panel = createSolarPanel(solarArea);
    panel.position.set(bx/2 + 0.02, 0, 0);
    panel.rotation.y = Math.PI/2;
    group.add(panel);
    const panel2 = panel.clone();
    panel2.position.set(-bx/2 - 0.02, 0, 0);
    panel2.rotation.y = -Math.PI/2;
    group.add(panel2);
  }

  const comms = sat.comms || {};
  if (comms.antennas && comms.antennas.length > 0) {
    comms.antennas.forEach((ant, i) => {
      const antenna = createAntenna(ant.type || 'patch', ant.frequency_ghz || 2.4);
      antenna.position.set(0, by/2 + 0.05 + i * 0.05, bz/2 + 0.05);
      group.add(antenna);
    });
  } else if (comms.frequency_ghz) {
    const antenna = createAntenna('patch', comms.frequency_ghz);
    antenna.position.set(0, by/2 + 0.05, bz/2 + 0.05);
    group.add(antenna);
  }

  const thermal = sat.thermal || {};
  if (thermal.radiators && thermal.radiators.length > 0) {
    thermal.radiators.forEach((rad, i) => {
      const radiator = createRadiator(rad.area_m2 || 0.1);
      radiator.position.set(bx/2 + 0.01, -by/2 + (i * 0.1), 0);
      radiator.rotation.y = -Math.PI/2;
      group.add(radiator);
    });
  }

  const payload = sat.payload || {};
  if (payload.instruments && payload.instruments.length > 0) {
    payload.instruments.forEach((inst, i) => {
      const instMesh = createInstrument(inst.type || 'camera');
      instMesh.position.set(0, by/2 + 0.03 + i * 0.06, -bz/2 - 0.05);
      group.add(instMesh);
      addLabel(instMesh, inst.name || 'Instrument', new THREE.Vector3(0, 0.05, 0));
    });
  }

  state.three.scene.add(group);
}

function getMaterial(name) {
  const mats = {
    'aluminum': { color: 0xb0bec5, roughness: 0.3, metalness: 0.8 },
    'titanium': { color: 0x78909c, roughness: 0.4, metalness: 0.9 },
    'carbon-fiber': { color: 0x263238, roughness: 0.6, metalness: 0.2 },
    'steel': { color: 0x90a4ae, roughness: 0.2, metalness: 0.95 }
  };
  const m = mats[name] || mats.aluminum;
  return new THREE.MeshStandardMaterial({ ...m, name });
}

function createSolarPanel(area) {
  const side = Math.sqrt(area);
  const geo = new THREE.BoxGeometry(side, 0.005, side);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a2338,
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide
  });
  const panel = new THREE.Mesh(geo, mat);
  panel.castShadow = true;
  const cellGeo = new THREE.PlaneGeometry(side * 0.95, side * 0.95);
  const cellMat = new THREE.MeshBasicMaterial({ color: 0x0d1a33, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const cells = new THREE.Mesh(cellGeo, cellMat);
  cells.position.z = 0.004;
  panel.add(cells);
  panel.userData = { name: 'Solar Array', type: 'power' };
  return panel;
}

function createAntenna(type, freq) {
  const group = new THREE.Group();
  if (type === 'parabolic') {
    const dishGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 32, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.2, metalness: 0.8, side: THREE.DoubleSide });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = -Math.PI/2;
    group.add(dish);
    const feedGeo = new THREE.ConeGeometry(0.02, 0.06, 8);
    const feed = new THREE.Mesh(feedGeo, new THREE.MeshStandardMaterial({ color: 0x37474f }));
    feed.position.y = 0.1;
    group.add(feed);
  } else if (type === 'helical') {
    const geo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.3, metalness: 0.8 });
    const ant = new THREE.Mesh(geo, mat);
    group.add(ant);
  } else if (type === 'phased-array') {
    const geo = new THREE.BoxGeometry(0.2, 0.01, 0.2);
    const mat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.1, metalness: 0.9 });
    const arr = new THREE.Mesh(geo, mat);
    group.add(arr);
  } else {
    const geo = new THREE.BoxGeometry(0.12, 0.015, 0.12);
    const mat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.3, metalness: 0.8 });
    const patch = new THREE.Mesh(geo, mat);
    group.add(patch);
  }
  group.userData = { name: 'Antenna', type: 'comms' };
  return group;
}

function createRadiator(area) {
  const side = Math.sqrt(area);
  const geo = new THREE.BoxGeometry(side, 0.008, side);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x444444,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide
  });
  const rad = new THREE.Mesh(geo, mat);
  rad.userData = { name: 'Radiator', type: 'thermal' };
  return rad;
}

function createInstrument(type) {
  const group = new THREE.Group();
  let mesh;
  switch (type) {
    case 'camera':
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.2, metalness: 0.9 }));
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.04, 32), new THREE.MeshBasicMaterial({ color: 0x0d47a1, side: THREE.DoubleSide }));
      lens.position.z = 0.061;
      mesh.add(lens);
      break;
    case 'spectrometer':
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.15), new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.4, metalness: 0.6 }));
      break;
    case 'radar':
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 32), new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.3, metalness: 0.7 }));
      break;
    default:
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.1), new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.5, metalness: 0.5 }));
  }
  mesh.castShadow = true;
  group.add(mesh);
  group.userData = { name: 'Instrument', type: 'payload' };
  return group;
}

function addLabel(object, text, offset) {
  const div = document.createElement('div');
  div.className = 'three-label';
  div.textContent = text;
  div.style.cssText = 'font-family:IBM Plex Sans,sans-serif;font-size:11px;color:#e8edf5;background:rgba(10,15,26,0.85);padding:2px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;border:1px solid #233048;';
  const label = new CSS2DObject(div);
  label.position.copy(offset);
  object.add(label);
}

function createStarfield() {
  const geo = new THREE.BufferGeometry();
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 50 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = r * Math.cos(phi);
    const c = Math.random() > 0.5 ? [1, 0.9, 0.8] : [0.8, 0.9, 1];
    colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
    sizes[i] = 0.5 + Math.random() * 1.5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({ size: 1, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

function animate() {
  state.three.animationId = requestAnimationFrame(animate);
  state.three.controls.update();
  state.three.renderer.render(state.three.scene, state.three.camera);
  state.three.labelRenderer.render(state.three.scene, state.three.camera);
}

function onResize() {
  const container = els.threeContainer;
  const width = container.clientWidth;
  const height = container.clientHeight;
  state.three.camera.aspect = width / height;
  state.three.camera.updateProjectionMatrix();
  state.three.renderer.setSize(width, height);
  state.three.labelRenderer.setSize(width, height);
}

els.analyzeBtn.addEventListener('click', analyzeSketch);

els.exportBtn.addEventListener('click', () => {
  if (!state.spec || !state.spec.html) {
    showToast('No design to export', 'warning');
    return;
  }
  const blob = new Blob([state.spec.html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stellarforge-satellite-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Satellite HTML exported', 'success');
});

els.resetViewBtn.addEventListener('click', () => {
  if (state.three.controls && state.three.satelliteGroup) {
    state.three.controls.reset();
    const box = new THREE.Box3().setFromObject(state.three.satelliteGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    state.three.camera.position.set(center.x + maxDim * 1.5, center.y + maxDim, center.z + maxDim * 1.5);
    state.three.controls.target.copy(center);
  }
});

initCanvas();
checkNIMStatus();
setInterval(checkNIMStatus, 30000);