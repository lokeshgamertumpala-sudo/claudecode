import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { satellite } = req.body;

    if (!satellite) {
      return res.status(400).json({ error: 'No satellite specification provided' });
    }

    // Generate Three.js scene configuration
    const sceneConfig = generateThreeJSConfig(satellite);

    res.json({
      sceneConfig,
      html: generateStandaloneHTML(sceneConfig, satellite),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Generate] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

function generateThreeJSConfig(sat) {
  const bus = sat.bus || {};
  const power = sat.power || {};
  const comms = sat.comms || {};
  const thermal = sat.thermal || {};
  const payload = sat.payload || {};

  const [bx, by, bz] = bus.dimensions_m || [0.1, 0.1, 0.3];

  return {
    satellite: {
      bus: {
        dimensions: [bx, by, bz],
        material: bus.structure_material || 'aluminum',
        color: getMaterialColor(bus.structure_material || 'aluminum')
      },
      solarPanels: (power.solar_panels || []).map((sp, i) => ({
        id: `solar_${i}`,
        type: sp.type || 'deployable',
        area: sp.area_m2 || 0.1,
        efficiency: sp.efficiency || 0.3,
        deployed: sp.type !== 'body-mounted',
        rotation: sp.orientation === 'sun-tracking' ? 'auto' : 'fixed'
      })),
      antennas: (comms.antennas || []).map((ant, i) => ({
        id: `antenna_${i}`,
        type: ant.type || 'patch',
        gain: ant.gain_dbi || 10,
        frequency: ant.frequency_ghz || 2.4,
        pointing: ant.pointing || 'nadir'
      })),
      radiators: (thermal.radiators || []).map((rad, i) => ({
        id: `radiator_${i}`,
        area: rad.area_m2 || 0.05,
        emissivity: rad.emissivity || 0.85,
        location: rad.location || 'external-panel'
      })),
      instruments: (payload.instruments || []).map((inst, i) => ({
        id: `instrument_${i}`,
        name: inst.name || `payload_${i}`,
        type: inst.type || 'camera',
        power: inst.power_w || 5,
        fov: inst.fov_deg || 20,
        aperture: inst.aperture_m || 0.05
      }))
    },
    orbit: sat.orbit || { altitude_km: 550, inclination_deg: 97.4 },
    visualization: {
      showOrbit: true,
      showGroundTrack: true,
      showCommLinks: true,
      showThermalMap: true,
      showPowerFlow: true,
      timeScale: 100
    }
  };
}

function getMaterialColor(material) {
  const colors = {
    aluminum: 0xB0BEC5,
    composite: 0x37474F,
    titanium: 0x78909C,
    'carbon-fiber': 0x1B1B1B
  };
  return colors[material] || 0xB0BEC5;
}

function generateStandaloneHTML(config, satellite) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StellarForge - ${satellite.bus?.type || 'Satellite'} 3D Visualization</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0e1a; color: #e0e6ed; overflow: hidden; }
    #canvas-container { width: 100vw; height: 100vh; position: relative; }
    #ui-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
    .panel { pointer-events: auto; background: rgba(10, 14, 26, 0.95); border: 1px solid #1e2a3a; border-radius: 8px; padding: 16px; backdrop-filter: blur(10px); }
    #title-panel { position: absolute; top: 20px; left: 20px; min-width: 280px; z-index: 10; }
    #title-panel h1 { font-size: 1.4rem; font-weight: 600; color: #4fc3f7; margin-bottom: 4px; }
    #title-panel .subtitle { font-size: 0.85rem; color: #78909c; }
    #control-panel { position: absolute; top: 20px; right: 20px; min-width: 220px; z-index: 10; display: flex; flex-direction: column; gap: 12px; }
    .control-group { display: flex; flex-direction: column; gap: 8px; }
    .control-group label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #78909c; }
    .toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .toggle input { display: none; }
    .toggle-slider { width: 40px; height: 22px; background: #1e2a3a; border-radius: 11px; position: relative; transition: background 0.2s; }
    .toggle-slider::before { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
    .toggle input:checked + .toggle-slider { background: #4fc3f7; }
    .toggle input:checked + .toggle-slider::before { transform: translateX(18px); }
    .toggle span { font-size: 0.85rem; color: #e0e6ed; }
    #info-panel { position: absolute; bottom: 20px; left: 20px; min-width: 300px; max-width: 400px; z-index: 10; display: none; }
    #info-panel.visible { display: block; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e2a3a; font-size: 0.85rem; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #78909c; }
    .info-value { color: #e0e6ed; font-weight: 500; }
    #legend-panel { position: absolute; bottom: 20px; right: 20px; z-index: 10; display: none; }
    #legend-panel.visible { display: block; }
    .legend-item { display: flex; align-items: center; gap: 8px; padding: 4px 8px; font-size: 0.75rem; color: #b0bec5; }
    .legend-color { width: 16px; height: 16px; border-radius: 3px; }
    @media (max-width: 768px) {
      #title-panel, #control-panel, #info-panel, #legend-panel { position: static; margin: 10px; min-width: auto; }
      #ui-overlay { display: flex; flex-direction: column; }
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="ui-overlay">
    <div id="title-panel" class="panel">
      <h1>StellarForge AI</h1>
      <div class="subtitle">${satellite.bus?.type?.toUpperCase() || 'SATELLITE'} • ${satellite.orbit?.altitude_km || 550}km ${satellite.orbit?.type || 'LEO'}</div>
    </div>
    <div id="control-panel" class="panel">
      <div class="control-group">
        <label>Visualization Layers</label>
        <label class="toggle"><input type="checkbox" id="toggle-orbit" checked><span class="toggle-slider"></span><span>Orbit Path</span></label>
        <label class="toggle"><input type="checkbox" id="toggle-ground" checked><span class="toggle-slider"></span><span>Ground Track</span></label>
        <label class="toggle"><input type="checkbox" id="toggle-comms"><span class="toggle-slider"></span><span>Comm Links</span></label>
        <label class="toggle"><input type="checkbox" id="toggle-thermal"><span class="toggle-slider"></span><span>Thermal Map</span></label>
        <label class="toggle"><input type="checkbox" id="toggle-power"><span class="toggle-slider"></span><span>Power Flow</span></label>
      </div>
      <div class="control-group">
        <label>Time Scale: <span id="time-scale-value">100x</span></label>
        <input type="range" id="time-scale" min="1" max="1000" value="100" step="1">
      </div>
      <button id="export-btn" style="padding: 10px; background: #4fc3f7; border: none; border-radius: 4px; color: #0a0e1a; font-weight: 600; cursor: pointer;">Export HTML</button>
    </div>
    <div id="info-panel" class="panel">
      <div class="info-row"><span class="info-label">Bus Type</span><span class="info-value" id="info-bus">-</span></div>
      <div class="info-row"><span class="info-label">Mass</span><span class="info-value" id="info-mass">-</span></div>
      <div class="info-row"><span class="info-label">Solar Area</span><span class="info-value" id="info-solar">-</span></div>
      <div class="info-row"><span class="info-label">Battery</span><span class="info-value" id="info-battery">-</span></div>
      <div class="info-row"><span class="info-label">Orbit</span><span class="info-value" id="info-orbit">-</span></div>
      <div class="info-row"><span class="info-label">Inclination</span><span class="info-value" id="info-inc">-</span></div>
      <div class="info-row"><span class="info-label">Payload Power</span><span class="info-value" id="info-payload">-</span></div>
      <div class="info-row"><span class="info-label">Data Rate</span><span class="info-value" id="info-data">-</span></div>
    </div>
    <div id="legend-panel" class="panel">
      <div class="legend-item"><span class="legend-color" style="background:#b0bec5"></span>Structure</div>
      <div class="legend-item"><span class="legend-color" style="background:#4fc3f7"></span>Solar Panels</div>
      <div class="legend-item"><span class="legend-color" style="background:#ffd54f"></span>Antennas</div>
      <div class="legend-item"><span class="legend-color" style="background:#ef5350"></span>Radiators</div>
      <div class="legend-item"><span class="legend-color" style="background:#66bb6a"></span>Payload</div>
    </div>
  </div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
    }
  }
  </script>
  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

    const CONFIG = ${JSON.stringify(config)};
    const SATELLITE_DATA = ${JSON.stringify(satellite)};

    // ============ THREE.JS SETUP ============
    const container = document.getElementById('canvas-container');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(5, 3, 5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 500;

    // ============ LIGHTING ============
    const sunLight = new THREE.DirectionalLight(0xffffee, 2);
    sunLight.position.set(100, 50, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x223344, 0.5);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0x446688, 0.3);
    fillLight.position.set(-50, -20, -50);
    scene.add(fillLight);

    // ============ EARTH ============
    const earthRadius = 6371;
    const orbitAltitude = CONFIG.orbit.altitude_km || 550;
    const orbitRadius = earthRadius + orbitAltitude;
    const scale = 1 / 1000; // 1 unit = 1000 km

    const earthGeometry = new THREE.SphereGeometry(earthRadius * scale, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a5c,
      roughness: 0.8,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Earth atmosphere glow
    const atmosGeometry = new THREE.SphereGeometry(earthRadius * scale * 1.02, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosphere);

    // ============ SATELLITE GROUP ============
    const satGroup = new THREE.Group();
    satGroup.position.set(0, 0, orbitRadius * scale);
    scene.add(satGroup);

    // Orbit path
    const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius * scale, orbitRadius * scale);
    const orbitPoints = orbitCurve.getPoints(128);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x4fc3f7, opacity: 0.4, transparent: true });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = -Math.PI / 2;
    scene.add(orbitLine);

    // Ground track (simplified)
    const groundTrackGeometry = new THREE.BufferGeometry();
    const groundTrackPoints = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const lat = Math.asin(Math.sin(angle) * Math.sin((CONFIG.orbit.inclination_deg || 97.4) * Math.PI / 180));
      const lon = angle;
      const r = earthRadius * scale;
      groundTrackPoints.push(new THREE.Vector3(
        r * Math.cos(lat) * Math.cos(lon),
        r * Math.sin(lat),
        r * Math.cos(lat) * Math.sin(lon)
      ));
    }
    groundTrackGeometry.setFromPoints(groundTrackPoints);
    const groundTrackMaterial = new THREE.LineBasicMaterial({ color: 0x66bb6a, opacity: 0.3, transparent: true });
    const groundTrackLine = new THREE.Line(groundTrackGeometry, groundTrackMaterial);
    scene.add(groundTrackLine);

    // ============ SATELLITE COMPONENTS ============
    const materials = {
      structure: new THREE.MeshStandardMaterial({ color: CONFIG.satellite.bus.color, roughness: 0.4, metalness: 0.7 }),
      solar: new THREE.MeshStandardMaterial({ color: 0x4fc3f7, roughness: 0.1, metalness: 0.9, emissive: 0x1a3a5c, emissiveIntensity: 0.3 }),
      antenna: new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.3, metalness: 0.8 }),
      radiator: new THREE.MeshStandardMaterial({ color: 0xef5350, roughness: 0.6, metalness: 0.2, emissive: 0x330000, emissiveIntensity: 0.5 }),
      payload: new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.4, metalness: 0.3 })
    };

    // Bus body
    const [bx, by, bz] = CONFIG.satellite.bus.dimensions;
    const busGeo = new THREE.BoxGeometry(bx * 100, by * 100, bz * 100); // Scale up for visibility
    const busMesh = new THREE.Mesh(busGeo, materials.structure);
    busMesh.castShadow = true;
    busMesh.receiveShadow = true;
    busMesh.userData = { type: 'bus', name: 'Satellite Bus' };
    satGroup.add(busMesh);

    // Solar panels
    const solarMeshes = [];
    CONFIG.satellite.solarPanels.forEach((sp, i) => {
      const panelSize = Math.sqrt(sp.area) * 100;
      const panelGeo = new THREE.BoxGeometry(panelSize, 2, panelSize);
      const panel = new THREE.Mesh(panelGeo, materials.solar);
      panel.castShadow = true;

      if (sp.type === 'deployable') {
        panel.position.set(0, 0, (bz * 50) + (i % 2 === 0 ? panelSize/2 + 10 : -panelSize/2 - 10));
        panel.rotation.x = -Math.PI / 2;
      } else {
        panel.position.set((bx * 50) + 5, 0, 0);
        panel.rotation.y = Math.PI / 2;
      }
      panel.userData = { type: 'solar', name: \`Solar Panel \${i+1}\`, area: sp.area, efficiency: sp.efficiency };
      satGroup.add(panel);
      solarMeshes.push(panel);
    });

    // Antennas
    CONFIG.satellite.antennas.forEach((ant, i) => {
      let antMesh;
      if (ant.type === 'dish') {
        const dishGeo = new THREE.ConeGeometry(15, 5, 16);
        antMesh = new THREE.Mesh(dishGeo, materials.antenna);
        antMesh.rotation.x = -Math.PI / 2;
      } else if (ant.type === 'helical') {
        const helixGeo = new THREE.CylinderGeometry(2, 2, 30, 8);
        antMesh = new THREE.Mesh(helixGeo, materials.antenna);
      } else {
        const patchGeo = new THREE.BoxGeometry(12, 1.5, 12);
        antMesh = new THREE.Mesh(patchGeo, materials.antenna);
      }
      antMesh.position.set(0, -(by * 50) - 10, (bz * 50) + 10 + i * 15);
      antMesh.userData = { type: 'antenna', name: \`Antenna \${i+1} (\${ant.type})\`, gain: ant.gain, freq: ant.frequency };
      satGroup.add(antMesh);
    });

    // Radiators
    CONFIG.satellite.radiators.forEach((rad, i) => {
      const radSize = Math.sqrt(rad.area) * 100;
      const radGeo = new THREE.BoxGeometry(radSize, 1, radSize);
      const radMesh = new THREE.Mesh(radGeo, materials.radiator);
      radMesh.position.set(0, (by * 50) + 5, -(bz * 50) - 5 - i * 15);
      radMesh.rotation.x = -Math.PI / 2;
      radMesh.userData = { type: 'radiator', name: \`Radiator \${i+1}\`, area: rad.area, emissivity: rad.emissivity };
      satGroup.add(radMesh);
    });

    // Instruments
    CONFIG.satellite.instruments.forEach((inst, i) => {
      const instGeo = new THREE.CylinderGeometry(inst.aperture * 50, inst.aperture * 50, 20, 16);
      const instMesh = new THREE.Mesh(instGeo, materials.payload);
      instMesh.position.set(0, 0, (bz * 50) + 15 + i * 25);
      instMesh.rotation.x = -Math.PI / 2;
      instMesh.userData = { type: 'instrument', name: inst.name, power: inst.power, fov: inst.fov };
      satGroup.add(instMesh);
    });

    // Communication link visualization
    const commLineMaterial = new THREE.LineBasicMaterial({ color: 0xffd54f, opacity: 0.6, transparent: true });
    const commLineGeometry = new THREE.BufferGeometry();
    const commLine = new THREE.Line(commLineGeometry, commLineMaterial);
    scene.add(commLine);

    // Ground station marker
    const gsGeometry = new THREE.SphereGeometry(50, 8, 8);
    const gsMaterial = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    const gsMarker = new THREE.Mesh(gsGeometry, gsMaterial);
    gsMarker.position.set(orbitRadius * scale, 0, 0);
    scene.add(gsMarker);

    // Labels
    const labels = new Map();
    function createLabel(text, position, object) {
      const div = document.createElement('div');
      div.className = 'label';
      div.style.cssText = 'padding:4px 8px;background:rgba(10,14,26,0.9);border:1px solid #4fc3f7;border-radius:4px;font-size:11px;color:#4fc3f7;white-space:nowrap;pointer-events:none;';
      div.textContent = text;
      const label = new CSS2DObject(div);
      label.position.copy(position);
      object.add(label);
      labels.set(object.uuid, label);
      return label;
    }

    createLabel('Bus', new THREE.Vector3(0, 0, bz * 50 + 30), busMesh);
    solarMeshes.forEach((m, i) => createLabel(\`Solar \${i+1}\`, new THREE.Vector3(0, 0, 30), m));
    satGroup.children.forEach(c => {
      if (c.userData.type === 'antenna') createLabel(c.userData.name, new THREE.Vector3(0, -30, 0), c);
      if (c.userData.type === 'radiator') createLabel(c.userData.name, new THREE.Vector3(0, 30, 0), c);
      if (c.userData.type === 'instrument') createLabel(c.userData.name, new THREE.Vector3(0, 0, 40), c);
    });

    // ============ ANIMATION ============
    let time = 0;
    let timeScale = CONFIG.visualization.timeScale || 100;
    const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(orbitRadius * 1000, 3) / 3.986e14); // seconds
    const angularVelocity = (2 * Math.PI / orbitalPeriod) * timeScale;

    function animate() {
      requestAnimationFrame(animate);

      // Orbital motion
      time += (1/60) * timeScale;
      const angle = time * angularVelocity;
      satGroup.position.x = Math.cos(angle) * orbitRadius * scale;
      satGroup.position.z = Math.sin(angle) * orbitRadius * scale;

      // Point satellite nadir (toward Earth center)
      satGroup.lookAt(0, 0, 0);
      satGroup.rotateX(Math.PI / 2);

      // Solar panel sun tracking
      const sunDir = new THREE.Vector3(100, 50, 100).normalize();
      solarMeshes.forEach(panel => {
        if (panel.userData && CONFIG.satellite.solarPanels[0]?.rotation === 'auto') {
          panel.lookAt(panel.position.clone().add(sunDir));
          panel.rotateX(Math.PI / 2);
        }
      });

      // Communication link to ground station
      if (CONFIG.visualization.showCommLinks) {
        const gsPos = new THREE.Vector3();
        gsMarker.getWorldPosition(gsPos);
        const satPos = new THREE.Vector3();
        busMesh.getWorldPosition(satPos);
        commLineGeometry.setFromPoints([satPos, gsPos]);
        commLine.visible = true;
      } else {
        commLine.visible = false;
      }

      // Ground station position (fixed on Earth, rotates with Earth)
      earth.rotation.y += 0.0001 * timeScale;

      orbitLine.visible = CONFIG.visualization.showOrbit;
      groundTrackLine.visible = CONFIG.visualization.showGroundTrack;

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }

    // ============ UI INTERACTION ============
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onClick(event) {
      raycaster.setFromCamera(mouse, camera);
      const clickableObjects = satGroup.children.filter(c => c.userData.type);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        showInfoPanel(obj.userData);
      }
    }

    function showInfoPanel(data) {
      const panel = document.getElementById('info-panel');
      panel.classList.add('visible');

      document.getElementById('info-bus').textContent = SATELLITE_DATA.bus?.type || '-';
      document.getElementById('info-mass').textContent = SATELLITE_DATA.bus?.mass_kg ? \`\${SATELLITE_DATA.bus.mass_kg} kg\` : '-';
      document.getElementById('info-solar').textContent = CONFIG.satellite.solarPanels.reduce((a, s) => a + s.area, 0).toFixed(2) + ' m²';
      document.getElementById('info-battery').textContent = SATELLITE_DATA.power?.battery?.capacity_wh ? \`\${SATELLITE_DATA.power.battery.capacity_wh} Wh\` : '-';
      document.getElementById('info-orbit').textContent = \`\${SATELLITE_DATA.orbit?.altitude_km || CONFIG.orbit.altitude_km} km\`;
      document.getElementById('info-inc').textContent = \`\${SATELLITE_DATA.orbit?.inclination_deg || CONFIG.orbit.inclination_deg}°\`;
      document.getElementById('info-payload').textContent = CONFIG.satellite.instruments.reduce((a, i) => a + i.power, 0) + ' W';
      document.getElementById('info-data').textContent = CONFIG.satellite.instruments.reduce((a, i) => a + (i.data_rate || 0), 0).toFixed(1) + ' Mbps';
    }

    // Controls
    document.getElementById('toggle-orbit').addEventListener('change', e => CONFIG.visualization.showOrbit = e.target.checked);
    document.getElementById('toggle-ground').addEventListener('change', e => CONFIG.visualization.showGroundTrack = e.target.checked);
    document.getElementById('toggle-comms').addEventListener('change', e => CONFIG.visualization.showCommLinks = e.target.checked);
    document.getElementById('toggle-thermal').addEventListener('change', e => CONFIG.visualization.showThermalMap = e.target.checked);
    document.getElementById('toggle-power').addEventListener('change', e => CONFIG.visualization.showPowerFlow = e.target.checked);
    document.getElementById('time-scale').addEventListener('input', e => {
      timeScale = parseInt(e.target.value);
      document.getElementById('time-scale-value').textContent = timeScale + 'x';
    });

    // Export standalone HTML
    document.getElementById('export-btn').addEventListener('click', () => {
      const exportHtml = generateExportHTML();
      const blob = new Blob([exportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stellarforge-satellite-\${Date.now()}.html';
      a.click();
      URL.revokeObjectURL(url);
    });

    function generateExportHTML() {
      // Returns this same HTML but with current config embedded
      return document.documentElement.outerHTML;
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    animate();
  </script>
</body>
</html>`;
}

export default router;