export class ThreeRenderer {
  constructor(containerId, config, satelliteData) {
    this.container = document.getElementById(containerId);
    this.config = config;
    this.satelliteData = satelliteData;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.labelRenderer = null;
    this.animationId = null;
    this.time = 0;
    this.timeScale = config.visualization?.timeScale || 100;
    this.boundMouseMove = null;
    this.boundClick = null;
    this.boundResize = null;

    this.init();
  }

  async init() {
    await this.setupThreeJS();
    this.setupScene();
    this.setupLighting();
    this.createEarth();
    this.createSatellite();
    this.createOrbitVisualization();
    this.setupUI();
    this.animate();
  }

  async setupThreeJS() {
    this.container.innerHTML = '';

    let THREE, OrbitControls, CSS2DRenderer, CSS2DObject;
    try {
      const threeModule = await import('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js');
      THREE = threeModule;
      const controlsModule = await import('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js');
      OrbitControls = controlsModule.OrbitControls;
      const css2dModule = await import('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/renderers/CSS2DRenderer.js');
      CSS2DRenderer = css2dModule.CSS2DRenderer;
      CSS2DObject = css2dModule.CSS2DObject;
    } catch (cdnError) {
      console.warn('[ThreeRenderer] Primary CDN failed, trying fallback:', cdnError.message);
      try {
        const threeModule = await import('https://unpkg.com/three@0.165.0/build/three.module.js');
        THREE = threeModule;
        const controlsModule = await import('https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js');
        OrbitControls = controlsModule.OrbitControls;
        const css2dModule = await import('https://unpkg.com/three@0.165.0/examples/jsm/renderers/CSS2DRenderer.js');
        CSS2DRenderer = css2dModule.CSS2DRenderer;
        CSS2DObject = css2dModule.CSS2DObject;
      } catch (fallbackError) {
        throw new Error('Failed to load Three.js from all CDNs: ' + fallbackError.message);
      }
    }

    this.THREE = THREE;
    this.OrbitControls = OrbitControls;
    this.CSS2DRenderer = CSS2DRenderer;
    this.CSS2DObject = CSS2DObject;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.container.appendChild(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, this.container.clientWidth / this.container.clientHeight, 0.1, 10000);
    this.camera.position.set(5, 3, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500;
  }

  setupScene() {
    this.earthRadius = 6371;
    this.orbitAltitude = this.config.orbit?.altitude_km || 550;
    this.orbitRadius = this.earthRadius + this.orbitAltitude;
    this.scale = 1 / 1000;
    this.orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(this.orbitRadius * 1000, 3) / 3.986e14);

    this.satGroup = new THREE.Group();
    this.scene.add(this.satGroup);

    this.orbitGroup = new THREE.Group();
    this.scene.add(this.orbitGroup);

    this.labels = [];
  }

  setupLighting() {
    const sunLight = new this.THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(100, 50, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);

    const ambientLight = new this.THREE.AmbientLight(0x4fc3f7, 0.3);
    this.scene.add(ambientLight);

    const fillLight = new this.THREE.DirectionalLight(0x4fc3f7, 0.3);
    fillLight.position.set(-50, -20, -50);
    this.scene.add(fillLight);
  }

  createEarth() {
    const earthGeometry = new this.THREE.SphereGeometry(this.earthRadius * this.scale, 64, 64);
    const earthMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x1a3a5c,
      roughness: 0.8,
      metalness: 0.1
    });
    this.earth = new this.THREE.Mesh(earthGeometry, earthMaterial);
    this.scene.add(this.earth);

    const atmosGeometry = new this.THREE.SphereGeometry(this.earthRadius * this.scale * 1.02, 32, 32);
    const atmosMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.08,
      side: this.THREE.BackSide
    });
    this.atmosphere = new this.THREE.Mesh(atmosGeometry, atmosMaterial);
    this.scene.add(this.atmosphere);
  }

  createSatellite() {
    this.satGroup.clear();

    const sat = this.config.satellite;
    if (!sat) return;

    const bus = sat.bus;
    if (bus) {
      const [bx, by, bz] = bus.dimensions || [0.1, 0.1, 0.3];
      const busGeometry = new this.THREE.BoxGeometry(bx * this.scale * 100, by * this.scale * 100, bz * this.scale * 100);
      const busMaterial = new this.THREE.MeshStandardMaterial({
        color: bus.color || 0x78909c,
        metalness: 0.7,
        roughness: 0.3
      });
      this.busMesh = new this.THREE.Mesh(busGeometry, busMaterial);
      this.busMesh.castShadow = true;
      this.busMesh.receiveShadow = true;
      this.satGroup.add(this.busMesh);
    }

    const solarPanels = sat.solarPanels || [];
    solarPanels.forEach((sp, i) => {
      const panelGeometry = new this.THREE.PlaneGeometry(
        Math.sqrt(sp.area || 0.8) * this.scale * 100,
        Math.sqrt(sp.area || 0.8) * this.scale * 100
      );
      const panelMaterial = new this.THREE.MeshStandardMaterial({
        color: 0x1565c0,
        metalness: 0.8,
        roughness: 0.1,
        side: this.THREE.DoubleSide,
        emissive: 0x0d47a1,
        emissiveIntensity: 0.2
      });
      const panel = new this.THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(0, 0, (bus?.dimensions?.[2] || 0.3) * this.scale * 100 / 2 + 0.5);
      panel.rotation.y = Math.PI / 2;
      panel.userData = { type: 'solar', index: i };
      this.satGroup.add(panel);
    });

    const antennas = sat.antennas || [];
    antennas.forEach((ant, i) => {
      const antGeometry = new this.THREE.ConeGeometry(0.05, 0.5, 8);
      const antMaterial = new this.THREE.MeshStandardMaterial({
        color: 0xffd600,
        metalness: 0.9,
        roughness: 0.1
      });
      const antenna = new this.THREE.Mesh(antGeometry, antMaterial);
      antenna.position.set(0, 0.3, 0);
      antenna.rotation.x = -Math.PI / 2;
      antenna.userData = { type: 'antenna', index: i };
      this.satGroup.add(antenna);
    });

    const radiators = sat.radiators || [];
    radiators.forEach((rad, i) => {
      const radGeometry = new this.THREE.PlaneGeometry(0.3, 0.2);
      const radMaterial = new this.THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: this.THREE.DoubleSide,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      });
      const radiator = new this.THREE.Mesh(radGeometry, radMaterial);
      radiator.position.set(0.25, 0, 0);
      radiator.rotation.y = Math.PI / 2;
      radiator.userData = { type: 'radiator', index: i };
      this.satGroup.add(radiator);
    });

    const instruments = sat.instruments || [];
    instruments.forEach((inst, i) => {
      const instGeometry = new this.THREE.CylinderGeometry(0.05, 0.08, 0.15, 8);
      const instMaterial = new this.THREE.MeshStandardMaterial({
        color: 0x263238,
        metalness: 0.6,
        roughness: 0.4
      });
      const instrument = new this.THREE.Mesh(instGeometry, instMaterial);
      instrument.position.set(0, 0, -0.25);
      instrument.userData = { type: 'instrument', index: i, name: inst.name };
      this.satGroup.add(instrument);
    });
  }

  createOrbitVisualization() {
    this.orbitGroup.clear();

    const orbitGeometry = new this.THREE.RingGeometry(
      this.orbitRadius * this.scale - 0.5,
      this.orbitRadius * this.scale + 0.5,
      128
    );
    const orbitMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.15,
      side: this.THREE.DoubleSide
    });
    this.orbitLine = new this.THREE.Mesh(orbitGeometry, orbitMaterial);
    this.orbitLine.rotation.x = -Math.PI / 2;
    this.orbitGroup.add(this.orbitLine);

    const gsGeometry = new this.THREE.SphereGeometry(50, 8, 8);
    const gsMaterial = new this.THREE.MeshBasicMaterial({ color: 0xffd600 });
    this.gsMarker = new this.THREE.Mesh(gsGeometry, gsMaterial);
    this.gsMarker.position.set(this.earthRadius * this.scale, 0, 0);
    this.orbitGroup.add(this.gsMarker);
  }

  createLabels() {
    this.labels.forEach(label => label.element.remove());
    this.labels = [];

    const sat = this.config.satellite;
    if (!sat) return;

    const addLabel = (position, text, type) => {
      const div = document.createElement('div');
      div.className = 'sat-label';
      div.textContent = text;
      div.style.cssText = `
        background: rgba(11, 13, 18, 0.9);
        border: 1px solid var(--accent);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        color: var(--accent);
        white-space: nowrap;
        pointer-events: none;
      `;
      const label = new this.CSS2DObject(div);
      label.position.copy(position);
      this.scene.add(label);
      this.labels.push(label);
    };

    if (this.busMesh) {
      addLabel(new this.THREE.Vector3(0, 1, 0), 'Bus', 'bus');
    }

    const solarPanels = sat.solarPanels || [];
    solarPanels.forEach((sp, i) => {
      addLabel(new this.THREE.Vector3(0, 0, 1), `Solar ${i + 1}`, 'solar');
    });

    const antennas = sat.antennas || [];
    antennas.forEach((ant, i) => {
      addLabel(new this.THREE.Vector3(0, 0.5, 0), `Ant ${i + 1}`, 'antenna');
    });

    const radiators = sat.radiators || [];
    radiators.forEach((rad, i) => {
      addLabel(new this.THREE.Vector3(0.5, 0, 0), `Rad ${i + 1}`, 'radiator');
    });

    const instruments = sat.instruments || [];
    instruments.forEach((inst, i) => {
      addLabel(new this.THREE.Vector3(0, 0, -0.5), inst.name || `Inst ${i + 1}`, 'instrument');
    });
  }

  setupUI() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundClick = this.onClick.bind(this);
    this.boundResize = this.onResize.bind(this);

    this.container.addEventListener('mousemove', this.boundMouseMove);
    this.container.addEventListener('click', this.boundClick);
    window.addEventListener('resize', this.boundResize);
  }

  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    const mouse = new this.THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new this.THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.satGroup.children, true);

    this.container.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';

    if (this.hoveredObject) {
      this.hoveredObject.material.emissiveIntensity = 0;
      this.hoveredObject = null;
    }

    if (intersects.length > 0) {
      this.hoveredObject = intersects[0].object;
      if (this.hoveredObject.material) {
        this.hoveredObject.material.emissiveIntensity = 0.5;
      }
    }
  }

  onClick(event) {
    const rect = this.container.getBoundingClientRect();
    const mouse = new this.THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new this.THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.satGroup.children, true);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData && window.app) {
        window.app.showToast(
          `Component: ${obj.userData.type}`,
          `${obj.userData.type} #${obj.userData.index || 0}`,
          'info'
        );
      }
    }
  }

  onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.time += 0.016 * (this.timeScale / 100);

    const angle = (this.time * 2 * Math.PI / this.orbitalPeriod) * this.timeScale;
    const orbitRadiusScaled = this.orbitRadius * this.scale;

    this.satGroup.position.x = Math.cos(angle) * orbitRadiusScaled;
    this.satGroup.position.z = Math.sin(angle) * orbitRadiusScaled;
    this.satGroup.lookAt(0, 0, 0);

    this.gsMarker.position.x = this.earthRadius * this.scale;
    this.gsMarker.position.y = 0;
    this.gsMarker.position.z = 0;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  updateScene(config, satelliteData) {
    this.config = config;
    this.satelliteData = satelliteData;
    this.timeScale = config.visualization?.timeScale || 100;

    this.orbitAltitude = config.orbit?.altitude_km || 550;
    this.orbitRadius = this.earthRadius + this.orbitAltitude;
    this.orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(this.orbitRadius * 1000, 3) / 3.986e14);

    this.satGroup.clear();
    this.createSatellite();
    this.createLabels();
    this.createOrbitVisualization();
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }

    if (this.labelRenderer) {
      this.labelRenderer.domElement.remove();
    }

    if (this.boundMouseMove) {
      this.container.removeEventListener('mousemove', this.boundMouseMove);
    }
    if (this.boundClick) {
      this.container.removeEventListener('click', this.boundClick);
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
    }
  }
}