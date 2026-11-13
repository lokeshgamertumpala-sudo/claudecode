import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PLANET_DATA = [
    { name: 'Sun', type: 'Star', radius: 6.96, distance: 0, color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 1.5, rotationPeriod: 25.38, orbitalPeriod: 0, info: 'The star at the center of our solar system. Contains 99.86% of the system\'s mass. Surface temperature: 5,500°C. Core temperature: 15 million °C.' },
    { name: 'Mercury', type: 'Terrestrial Planet', radius: 0.24, distance: 10, color: 0xb5b5b5, rotationPeriod: 58.65, orbitalPeriod: 0.24, info: 'Smallest planet, closest to the Sun. Extreme temperature variations: -180°C to 430°C. No atmosphere. Heavily cratered surface.' },
    { name: 'Venus', type: 'Terrestrial Planet', radius: 0.61, distance: 14, color: 0xe6c87a, rotationPeriod: -243.02, orbitalPeriod: 0.62, info: 'Hottest planet (465°C) due to runaway greenhouse effect. Retrograde rotation. Thick CO2 atmosphere. Volcanic surface.' },
    { name: 'Earth', type: 'Terrestrial Planet', radius: 0.64, distance: 18, color: 0x4a90d9, rotationPeriod: 1.0, orbitalPeriod: 1.0, info: 'Only known planet with life. 71% water coverage. Protective magnetic field. One large moon. Temperature range: -89°C to 58°C.' },
    { name: 'Mars', type: 'Terrestrial Planet', radius: 0.34, distance: 23, color: 0xe86c3c, rotationPeriod: 1.03, orbitalPeriod: 1.88, info: 'The Red Planet. Thin CO2 atmosphere. Largest volcano (Olympus Mons). Evidence of ancient water. Two small moons: Phobos & Deimos.' },
    { name: 'Jupiter', type: 'Gas Giant', radius: 7.15, distance: 35, color: 0xc9a876, rotationPeriod: 0.41, orbitalPeriod: 11.86, info: 'Largest planet. Great Red Spot storm (300+ years). 95+ moons. Strong magnetic field. Mostly hydrogen/helium. Faint ring system.' },
    { name: 'Saturn', type: 'Gas Giant', radius: 6.03, distance: 50, color: 0xf4e4bc, rotationPeriod: 0.44, orbitalPeriod: 29.46, info: 'Famous for prominent ring system (ice/rock). 146+ moons. Density less than water. Hexagonal storm at north pole.' },
    { name: 'Uranus', type: 'Ice Giant', radius: 2.56, distance: 65, color: 0x7de3f4, rotationPeriod: -0.72, orbitalPeriod: 84.01, info: 'Rotates on its side (98° tilt). Coldest atmosphere (-224°C). 27 moons. Faint rings. Methane gives blue-green color.' },
    { name: 'Neptune', type: 'Ice Giant', radius: 2.48, distance: 80, color: 0x4b70dd, rotationPeriod: 0.67, orbitalPeriod: 164.8, info: 'Windiest planet (2,100 km/h). Great Dark Spot storms. 16 moons. Faint rings. Triton orbits backwards. Vivid blue from methane.' },
    { name: 'Pluto', type: 'Dwarf Planet', radius: 0.12, distance: 95, color: 0xe8c8a0, rotationPeriod: -6.39, orbitalPeriod: 248.0, info: 'Dwarf planet in Kuiper Belt. Heart-shaped glacier (Tombaugh Regio). 5 moons (Charon largest). Highly elliptical, tilted orbit.' }
];

let scene, camera, renderer, controls;
let sunLight, ambientLight;
let planets = [];
let orbitPaths = [];
let animationId;
let isPaused = false;
let timeScale = 1;
let rotationScale = 1;
let scaleFactor = 1;
let selectedPlanet = null;
let starField;

const container = document.getElementById('canvas-container');
const planetList = document.getElementById('planetList');
const infoPanel = document.getElementById('infoPanel');
const infoTitle = document.getElementById('infoTitle');
const infoContent = document.getElementById('infoContent');
const speedIndicator = document.getElementById('speedIndicator');
const orbitSpeedSlider = document.getElementById('orbitSpeed');
const rotationSpeedSlider = document.getElementById('rotationSpeed');
const scaleSlider = document.getElementById('scaleFactor');
const orbitSpeedVal = document.getElementById('orbitSpeedVal');
const rotationSpeedVal = document.getElementById('rotationSpeedVal');
const scaleVal = document.getElementById('scaleVal');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const infoBtn = document.getElementById('infoBtn');

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.minDistance = 10;
    controls.maxDistance = 300;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    createStarField();
    createSun();
    createPlanets();
    createOrbitPaths();
    setupEventListeners();
    populatePlanetList();

    window.addEventListener('resize', onWindowResize);
    animate();
}

function createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 3000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);

    for (let i = 0; i < starsCount; i++) {
        const radius = 150 + Math.random() * 350;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const colorChoice = Math.random();
        if (colorChoice < 0.4) { colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; }
        else if (colorChoice < 0.7) { colors[i * 3] = 1; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.7; }
        else { colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1; }

        sizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

function createSun() {
    const sunData = PLANET_DATA[0];
    const geometry = new THREE.SphereGeometry(sunData.radius * scaleFactor, 64, 64);

    const material = new THREE.MeshStandardMaterial({
        color: sunData.color,
        emissive: sunData.emissive,
        emissiveIntensity: sunData.emissiveIntensity,
        roughness: 0.8,
        metalness: 0.1
    });

    const sun = new THREE.Mesh(geometry, material);
    sun.castShadow = false;
    sun.receiveShadow = false;
    sun.userData = { ...sunData, angle: 0 };
    scene.add(sun);
    planets.push(sun);

    sunLight = new THREE.PointLight(0xffffee, 3, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 300;
    sun.add(sunLight);

    ambientLight = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambientLight);

    const coronaGeometry = new THREE.SphereGeometry(sunData.radius * 1.15 * scaleFactor, 32, 32);
    const coronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sun.add(corona);
    sun.userData.corona = corona;
}

function createPlanets() {
    for (let i = 1; i < PLANET_DATA.length; i++) {
        const data = PLANET_DATA[i];
        const geometry = new THREE.SphereGeometry(data.radius * scaleFactor, 48, 48);

        let material;
        if (data.type === 'Gas Giant') {
            material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.7,
                metalness: 0.3
            });
        } else if (data.type === 'Ice Giant') {
            material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.5,
                metalness: 0.4
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.9,
                metalness: 0.1
            });
        }

        const planet = new THREE.Mesh(geometry, material);
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.position.x = data.distance * scaleFactor;

        const pivot = new THREE.Object3D();
        pivot.add(planet);
        scene.add(pivot);

        if (data.name === 'Saturn') {
            createRings(pivot, data);
        }

        planets.push({
            mesh: planet,
            pivot: pivot,
            data: { ...data, angle: Math.random() * Math.PI * 2 },
            ring: data.name === 'Saturn' ? pivot.children[1] : null
        });
    }
}

function createRings(parent, data) {
    const ringGeometry = new THREE.RingGeometry(
        data.radius * 1.3 * scaleFactor,
        data.radius * 2.2 * scaleFactor,
        64
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9b896,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.rotation.z = Math.PI / 6;
    parent.add(ring);
}

function createOrbitPaths() {
    for (let i = 1; i < PLANET_DATA.length; i++) {
        const data = PLANET_DATA[i];
        const points = [];
        const segments = 128;
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * data.distance * scaleFactor,
                0,
                Math.sin(angle) * data.distance * scaleFactor
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x446688,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Line(geometry, material);
        orbit.renderOrder = -1;
        scene.add(orbit);
        orbitPaths.push(orbit);
    }
}

function populatePlanetList() {
    planetList.innerHTML = '';
    PLANET_DATA.forEach((data, index) => {
        const btn = document.createElement('button');
        btn.className = 'planet-btn';
        btn.dataset.index = index;
        btn.innerHTML = `
            <span class="planet-color" style="background: #${data.color.toString(16).padStart(6, '0')}"></span>
            <div class="planet-info">
                <div class="planet-name">${data.name}</div>
                <div class="planet-type">${data.type}</div>
            </div>
        `;
        btn.addEventListener('click', () => selectPlanet(index));
        planetList.appendChild(btn);
    });
    updatePlanetListSelection(0);
}

function selectPlanet(index) {
    selectedPlanet = index;
    updatePlanetListSelection(index);
    showPlanetInfo(index);

    if (index > 0) {
        const planetObj = planets[index];
        const target = new THREE.Vector3();
        planetObj.mesh.getWorldPosition(target);
        controls.target.lerp(target, 0.1);
    } else {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }
}

function updatePlanetListSelection(index) {
    document.querySelectorAll('.planet-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function showPlanetInfo(index) {
    const data = PLANET_DATA[index];
    infoTitle.textContent = data.name;

    let facts = '';
    if (index === 0) {
        facts = `
            <div class="fact-row"><span class="fact-label">Type</span><span class="fact-value">${data.type}</span></div>
            <div class="fact-row"><span class="fact-label">Radius</span><span class="fact-value">${data.radius.toLocaleString()} km (×1000)</span></div>
            <div class="fact-row"><span class="fact-label">Rotation Period</span><span class="fact-value">${data.rotationPeriod} Earth days</span></div>
            <div class="fact-row"><span class="fact-label">Surface Temp</span><span class="fact-value">~5,500 °C</span></div>
            <div class="fact-row"><span class="fact-label">Core Temp</span><span class="fact-value">~15,000,000 °C</span></div>
        `;
    } else {
        facts = `
            <div class="fact-row"><span class="fact-label">Type</span><span class="fact-value">${data.type}</span></div>
            <div class="fact-row"><span class="fact-label">Radius</span><span class="fact-value">${(data.radius * 6371).toFixed(0)} km</span></div>
            <div class="fact-row"><span class="fact-label">Distance from Sun</span><span class="fact-value">${(data.distance * 1.5).toFixed(1)} AU (scaled)</span></div>
            <div class="fact-row"><span class="fact-label">Rotation Period</span><span class="fact-value">${Math.abs(data.rotationPeriod).toFixed(2)} Earth days${data.rotationPeriod < 0 ? ' (retrograde)' : ''}</span></div>
            <div class="fact-row"><span class="fact-label">Orbital Period</span><span class="fact-value">${data.orbitalPeriod.toFixed(2)} Earth years</span></div>
        `;
    }

    infoContent.innerHTML = facts + `<div class="description">${data.info}</div>`;
    infoPanel.classList.add('visible');
}

function setupEventListeners() {
    orbitSpeedSlider.addEventListener('input', (e) => {
        timeScale = parseFloat(e.target.value);
        orbitSpeedVal.textContent = timeScale.toFixed(2) + 'x';
        updateSpeedIndicator();
    });

    rotationSpeedSlider.addEventListener('input', (e) => {
        rotationScale = parseFloat(e.target.value);
        rotationSpeedVal.textContent = rotationScale.toFixed(2) + 'x';
    });

    scaleSlider.addEventListener('input', (e) => {
        scaleFactor = parseFloat(e.target.value);
        scaleVal.textContent = scaleFactor.toFixed(2) + 'x';
        updateScale();
    });

    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    resetBtn.addEventListener('click', () => {
        camera.position.set(0, 50, 100);
        controls.target.set(0, 0, 0);
        controls.autoRotate = true;
        timeScale = 1;
        rotationScale = 1;
        scaleFactor = 1;
        orbitSpeedSlider.value = 1;
        rotationSpeedSlider.value = 1;
        scaleSlider.value = 1;
        orbitSpeedVal.textContent = '1.00x';
        rotationSpeedVal.textContent = '1.00x';
        scaleVal.textContent = '1.00x';
        updateScale();
        updateSpeedIndicator();
        selectPlanet(0);
    });

    infoBtn.addEventListener('click', () => {
        infoPanel.classList.toggle('visible');
    });

    container.addEventListener('click', (e) => {
        if (e.target === container || e.target === renderer.domElement) {
            infoPanel.classList.remove('visible');
        }
    });
}

function updateScale() {
    const sun = planets[0];
    const sunData = PLANET_DATA[0];
    sun.mesh.geometry.dispose();
    sun.mesh.geometry = new THREE.SphereGeometry(sunData.radius * scaleFactor, 64, 64);
    if (sun.userData.corona) {
        sun.userData.corona.geometry.dispose();
        sun.userData.corona.geometry = new THREE.SphereGeometry(sunData.radius * 1.15 * scaleFactor, 32, 32);
    }

    for (let i = 1; i < planets.length; i++) {
        const planetObj = planets[i];
        const data = PLANET_DATA[i];
        planetObj.mesh.geometry.dispose();
        planetObj.mesh.geometry = new THREE.SphereGeometry(data.radius * scaleFactor, 48, 48);
        planetObj.mesh.position.x = data.distance * scaleFactor;

        if (planetObj.ring) {
            planetObj.ring.geometry.dispose();
            planetObj.ring.geometry = new THREE.RingGeometry(
                data.radius * 1.3 * scaleFactor,
                data.radius * 2.2 * scaleFactor,
                64
            );
        }

        orbitPaths[i - 1].geometry.dispose();
        const points = [];
        const segments = 128;
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * data.distance * scaleFactor,
                0,
                Math.sin(angle) * data.distance * scaleFactor
            ));
        }
        orbitPaths[i - 1].geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
}

function updateSpeedIndicator() {
    speedIndicator.textContent = `Simulation Speed: ${timeScale.toFixed(2)}x`;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);

    if (!isPaused) {
        const delta = 0.01 * timeScale;

        for (let i = 1; i < planets.length; i++) {
            const planetObj = planets[i];
            const data = planetObj.data;

            data.angle += (delta / Math.max(data.orbitalPeriod, 0.01)) * 2 * Math.PI;
            planetObj.pivot.rotation.y = data.angle;

            const rotationSpeed = (delta / Math.max(Math.abs(data.rotationPeriod), 0.01)) * 2 * Math.PI * rotationScale;
            planetObj.mesh.rotation.y += rotationSpeed * (data.rotationPeriod < 0 ? -1 : 1);
        }

        planets[0].mesh.rotation.y += delta * 0.1 * rotationScale;

        if (planets[0].userData.corona) {
            planets[0].userData.corona.rotation.y += delta * 0.05;
        }
    }

    if (starField) {
        starField.rotation.y += 0.00001;
    }

    controls.update();
    renderer.render(scene, camera);
}

init();

selectPlanet(0);