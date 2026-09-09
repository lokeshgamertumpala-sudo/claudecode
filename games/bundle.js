(() => {
  // games/config/gameConfig.js
  var gameConfig_default = {
    "gameTitle": "Nexus Clash: Infinite Arsenal",
    "version": "1.0.0",
    "description": "A large-scale arcade shooter with strategic gate mechanics, diverse weapons, and epic boss encounters",
    "settings": {
      "maxFps": 60,
      "difficultyScaling": true,
      "progressionSystem": "xpBased",
      "saveSystem": "localStorage",
      "localization": {
        "supportedLanguages": ["en", "hi", "te"],
        "defaultLanguage": "en"
      }
    },
    "worlds": [
      {
        "id": "world_1",
        "name": "FIRST SPARK",
        "theme": "Neon Genesis",
        "description": "The beginning - learn basic mechanics in a digital frontier",
        "levelRange": [1, 8],
        "unlockRequirement": 0,
        "colorScheme": "#00BFA6",
        "music": "synthwave_01",
        "background": "digital_grid",
        "introduces": ["basic_movement", "add_gates", "multiply_gates", "basic_enemies"]
      },
      {
        "id": "world_2",
        "name": "CRYSTAL RUN",
        "theme": "Prismatic Frontier",
        "description": "Crystal caves with reflective surfaces and light-based mechanics",
        "levelRange": [9, 16],
        "unlockRequirement": "complete_world_1",
        "colorScheme": "#00FFFF",
        "music": "chiptune_02",
        "background": "crystal_caverns",
        "introduces": ["reflective_obstacles", "split_gates", "laser_grids", "shield_enemies"]
      },
      {
        "id": "world_3",
        "name": "DESERT MACHINE",
        "theme": "Industrial Wasteland",
        "description": "Gear-driven machinery in a sandy expanse",
        "levelRange": [17, 24],
        "unlockRequirement": "complete_world_2",
        "colorScheme": "#FF6B35",
        "music": "industrial_03",
        "background": "gear_wasteland",
        "introduces": ["moving_conveyors", "crusher_zones", "gravity_gates", "heavy_enemies"]
      },
      {
        "id": "world_4",
        "name": "FROZEN CIRCUIT",
        "theme": "Glacial Electronics",
        "description": "Ice-covered circuits with freeze mechanics",
        "levelRange": [25, 32],
        "unlockRequirement": "complete_world_3",
        "colorScheme": "#4CC9F0",
        "music": "ambient_04",
        "background": "frozen_circuit_board",
        "introduces": ["freeze_mechanics", "shield_gates", "slippery_surfaces", "ice_enemies"]
      },
      {
        "id": "world_5",
        "name": "VOLCANIC ENGINE",
        "theme": "Molten Core",
        "description": "Lava-filled chambers with heat and explosion mechanics",
        "levelRange": [33, 40],
        "unlockRequirement": "complete_world_4",
        "colorScheme": "#FF4500",
        "music": "metal_05",
        "background": "lava_chambers",
        "introduces": ["heat_damage", "explosion_gates", "moving_platforms", "fire_enemies"]
      },
      {
        "id": "world_6",
        "name": "SKY FORTRESS",
        "theme": "Aerial Citadel",
        "description": "Floating islands with wind and electricity mechanics",
        "levelRange": [41, 48],
        "unlockRequirement": "complete_world_5",
        "colorScheme": "#8A2BE2",
        "music": "orchestral_06",
        "background": "floating_islands",
        "introduces": ["wind_mechanics", "chaos_gates", "electrical_fields", "flying_enemies"]
      },
      {
        "id": "world_7",
        "name": "QUANTUM CITY",
        "theme": "Reality Fracture",
        "description": "Glitching metropolis with time and space manipulation",
        "levelRange": [49, 56],
        "unlockRequirement": "complete_world_6",
        "colorScheme": "#FF00FF",
        "music": "electronic_07",
        "background": "glitch_city",
        "introduces": ["time_dilation", "phase_gates", "reality_glitches", "phase_enemies"]
      },
      {
        "id": "world_8",
        "name": "ORBITAL CORE",
        "theme": "Starship Heart",
        "description": "The final challenge - a living starship with gravity wells",
        "levelRange": [57, 64],
        "unlockRequirement": "complete_world_7",
        "colorScheme": "#FFFFFF",
        "music": "orchestral_08",
        "background": "orbital_core",
        "introduces": ["gravity_wells", "black_hole_gate", "final_boss_mechanics", "elite_enemies"]
      }
    ],
    "difficultyCurves": {
      "enemyHealth": { "base": 10, "perLevel": 1.1 },
      "enemyDamage": { "base": 5, "perLevel": 1.05 },
      "enemySpeed": { "base": 2, "perLevel": 1.02 },
      "gateFrequency": { "base": 3e-3, "perLevel": 1e-4 },
      "projectileSpeed": { "base": 0.12, "perLevel": 2e-3 },
      "rewardMultiplier": { "base": 1, "perLevel": 0.01 }
    }
  };

  // games/enemies/enemyTypes.js
  var enemyTypes_default = {
    "basic": {
      "health": 1,
      "speed": 100,
      "damage": 1,
      "scoreValue": 10,
      "color": "#ff4444",
      "radius": 12
    },
    "fast": {
      "health": 1,
      "speed": 150,
      "damage": 1,
      "scoreValue": 15,
      "color": "#ff44ff",
      "radius": 10
    },
    "heavy": {
      "health": 3,
      "speed": 70,
      "damage": 2,
      "scoreValue": 25,
      "color": "#ff8844",
      "radius": 16
    },
    "shield": {
      "health": 2,
      "speed": 90,
      "damage": 1,
      "scoreValue": 20,
      "color": "#4444ff",
      "radius": 14,
      "shield": true
    },
    "fastEnemy": {
      "health": 1,
      "speed": 200,
      "damage": 1,
      "scoreValue": 20,
      "color": "#ffff44",
      "radius": 8
    }
  };

  // games/weapons/weaponRoster.js
  var weaponRoster_default = {
    "pulseCannon": {
      "damage": 25,
      "cooldown": 800,
      "range": 300,
      "area": 20,
      "energyCost": 10,
      "color": "#ff6b6b",
      "particles": 5
    },
    "gravityBurst": {
      "damage": 15,
      "cooldown": 1200,
      "range": 200,
      "area": 80,
      "energyCost": 15,
      "color": "#9370db",
      "particles": 8
    },
    "plasmaArc": {
      "damage": 20,
      "cooldown": 1e3,
      "range": 250,
      "area": 15,
      "energyCost": 12,
      "color": "#00ffff",
      "particles": 3
    },
    "shockwave": {
      "damage": 10,
      "cooldown": 1500,
      "range": 100,
      "area": 100,
      "energyCost": 20,
      "color": "#ffa500",
      "particles": 12
    },
    "energyBeam": {
      "dam": 8,
      "cooldown": 600,
      "range": 400,
      "area": 10,
      "energyCost": 5,
      "color": "#ffff00",
      "particles": 3,
      "beamWidth": 4
    },
    "meteorDrop": {
      "damage": 40,
      "cooldown": 2e3,
      "range": 500,
      "area": 60,
      "energyCost": 25,
      "color": "#8b4513",
      "particles": 15,
      "dropDelay": 300
    }
  };

  // games/js/core/ConfigManager.js
  var ConfigManager = class {
    constructor() {
      this.configs = {};
      this.loadDefaultConfigs();
      this.configs.gameConfig = gameConfig_default;
      this.configs.enemyTypes = enemyTypes_default;
      this.configs.weaponRoster = weaponRoster_default;
    }
    loadDefaultConfigs() {
      this.configs.game = {
        targetFPS: 60,
        maxUnits: 1e3,
        unitRadius: 12,
        enemyUnitRadius: 12,
        gateSize: 60,
        cannonPositionY: 0.85,
        // Percentage of screen height
        cannonFireDelay: 250,
        // ms
        maxCrowdSize: 500,
        startingCrowd: 15,
        levelGoalMultiplier: 10,
        // goal = startingCrowd * level * multiplier
        waveIntervalBase: 5e3,
        // ms between waves
        waveIntervalReductionPerLevel: 100,
        // ms reduction per level
        minWaveInterval: 1500
        // minimum ms between waves
      };
      this.configs.physics = {
        gravity: 0,
        // No gravity in this top-down game
        friction: 0.98,
        separationForce: 0.5,
        collisionDistance: 25,
        maxSpeed: 300,
        // pixels per second
        acceleration: 800,
        // pixels per second^2
        pushForce: 150,
        knockbackForce: 200
      };
      this.configs.units = {
        player: {
          health: 1,
          speed: 120,
          damage: 0,
          scoreValue: 10,
          color: "#4a90e2",
          radius: 12
        },
        fast: {
          health: 1,
          speed: 180,
          damage: 0,
          scoreValue: 15,
          color: "#00ffff",
          radius: 10
        },
        heavy: {
          health: 3,
          speed: 80,
          damage: 0,
          scoreValue: 25,
          color: "#ff6b6b",
          radius: 16
        },
        shield: {
          health: 2,
          speed: 100,
          damage: 0,
          scoreValue: 20,
          color: "#ffffff",
          radius: 14,
          shield: true
        },
        ranged: {
          health: 1,
          speed: 100,
          damage: 1,
          scoreValue: 15,
          color: "#ffd700",
          radius: 12,
          range: 150,
          fireRate: 1e3
        }
      };
      this.configs.enemyUnits = {
        basic: {
          health: 1,
          speed: 100,
          damage: 1,
          scoreValue: 10,
          color: "#ff4444",
          radius: 12
        },
        fast: {
          health: 1,
          speed: 150,
          damage: 1,
          scoreValue: 15,
          color: "#ff44ff",
          radius: 10
        },
        heavy: {
          health: 3,
          speed: 70,
          damage: 2,
          scoreValue: 25,
          color: "#ff8844",
          radius: 16
        },
        shield: {
          health: 2,
          speed: 90,
          damage: 1,
          scoreValue: 20,
          color: "#4444ff",
          radius: 14,
          shield: true
        },
        fastEnemy: {
          health: 1,
          speed: 200,
          damage: 1,
          scoreValue: 20,
          color: "#ffff44",
          radius: 8
        }
      };
      this.configs.gates = {
        add: { value: 5, color: "#00ff88", symbol: "+" },
        mult: { value: 2, color: "#00ffff", symbol: "\xD7" },
        sub: { value: 3, color: "#ff6b6b", symbol: "-" },
        speed: { value: 1.5, color: "#ffd700", symbol: "\u26A1" },
        // Speed multiplier
        split: { value: 2, color: "#ff00ff", symbol: "\u2195" },
        // Splits crowd
        magnet: { value: 100, color: "#8a2be2", symbol: "\u{1F9F2}" },
        // Attraction radius
        shield: { value: 5, color: "#ffffff", symbol: "\u{1F6E1}\uFE0F" },
        // Temporary shield
        random: { value: 0, color: "#ff8c00", symbol: "?" },
        // Random effect
        risk_reward: { value: 0, color: "#8b0000", symbol: "\u26A0\uFE0F" }
        // High risk/reward
      };
      this.configs.weapons = {
        pulseCannon: {
          damage: 25,
          cooldown: 800,
          range: 300,
          area: 20,
          energyCost: 10,
          color: "#ff6b6b",
          particles: 5
        },
        gravityBurst: {
          damage: 15,
          cooldown: 1200,
          range: 200,
          area: 80,
          energyCost: 15,
          color: "#9370db",
          particles: 8
        },
        plasmaArc: {
          damage: 20,
          cooldown: 1e3,
          range: 250,
          area: 15,
          energyCost: 12,
          color: "#00ffff",
          particles: 3
        },
        shockwave: {
          damage: 10,
          cooldown: 1500,
          range: 100,
          area: 100,
          energyCost: 20,
          color: "#ffa500",
          particles: 12
        }
      };
      this.configs.levels = {
        startingLevel: 1,
        levelsPerWorld: 10,
        worldDifficultyMultiplier: 1.5,
        gatesPerLevel: { min: 4, max: 8 },
        enemySpawnRateBase: 0.02,
        // per frame chance
        enemySpawnRateIncrease: 1e-3
        // per level increase
      };
      this.configs.progression = {
        coinsPerUnit: 1,
        coinsPerEnemy: 5,
        levelCompleteBonus: 100,
        upgradeCostMultiplier: 1.5,
        xpPerUnit: 2,
        xpPerEnemy: 10,
        xpPerLevel: 50,
        levelsPerUpgrade: 3
      };
      this.configs.ui = {
        hideInstructionsDelay: 5e3,
        messageDuration: 2e3,
        gatePulseDuration: 2e3,
        crowdColorThresholds: [
          { threshold: 0.8, color: "#00ff00" },
          { threshold: 0.5, color: "#ffff00" },
          { threshold: 0.2, color: "#ff8800" },
          { threshold: 0, color: "#ff0000" }
        ]
      };
      this.configs.audio = {
        masterVolume: 0.7,
        sfxVolume: 0.8,
        musicVolume: 0.5,
        enabled: true
      };
    }
    getConfig(category, key = null) {
      if (key === null) {
        return this.configs[category] || {};
      }
      return this.configs[category] && this.configs[category][key] !== void 0 ? this.configs[category][key] : null;
    }
    setConfig(category, key, value) {
      if (!this.configs[category]) {
        this.configs[category] = {};
      }
      this.configs[category][key] = value;
    }
    getAllConfigs() {
      return JSON.parse(JSON.stringify(this.configs));
    }
  };

  // games/js/core/GameState.js
  var GameState = class {
    constructor() {
      this.states = {
        BOOT: "boot",
        LOADING: "loading",
        MAIN_MENU: "main_menu",
        LEVEL_SELECT: "level_select",
        PRE_LEVEL: "pre_level",
        PLAYING: "playing",
        PAUSED: "paused",
        LEVEL_COMPLETE: "level_complete",
        LEVEL_FAILED: "level_failed",
        UPGRADE: "upgrade",
        SETTINGS: "settings"
      };
      this.currentState = this.states.BOOT;
      this.previousState = null;
      this.stateChangeCallbacks = /* @__PURE__ */ new Map();
      this.isTransitioning = false;
      this.lastStateChangeTime = 0;
      this.minStateChangeInterval = 100;
    }
    /**
     * Change to a new state
     * @param {string} newState - The state to transition to
     * @returns {boolean} - True if state changed, false if blocked
     */
    changeState(newState) {
      const now = Date.now();
      if (now - this.lastStateChangeTime < this.minStateChangeInterval) {
        return false;
      }
      if (this.currentState === newState) {
        return false;
      }
      if (!this.isValidTransition(this.currentState, newState)) {
        console.warn(`Invalid state transition from ${this.currentState} to ${newState}`);
        return false;
      }
      this.previousState = this.currentState;
      this.currentState = newState;
      this.lastStateChangeTime = now;
      this.isTransitioning = true;
      this.notifyStateChange(newState, this.previousState);
      setTimeout(() => {
        this.isTransitioning = false;
      }, 50);
      return true;
    }
    /**
     * Check if a state transition is valid
     * @param {string} fromState - Current state
     * @param {string} toState - Target state
     * @returns {boolean} - True if transition is valid
     */
    isValidTransition(fromState, toState) {
      const validTransitions = {
        [this.states.BOOT]: [this.states.LOADING],
        [this.states.LOADING]: [this.states.MAIN_MENU, this.states.SETTINGS],
        [this.states.MAIN_MENU]: [this.states.LEVEL_SELECT, this.states.SETTINGS],
        [this.states.LEVEL_SELECT]: [this.states.PRE_LEVEL, this.states.MAIN_MENU],
        [this.states.PRE_LEVEL]: [this.states.PLAYING, this.states.LEVEL_SELECT],
        [this.states.PLAYING]: [
          this.states.PAUSED,
          this.states.LEVEL_COMPLETE,
          this.states.LEVEL_FAILED,
          this.states.SETTINGS
        ],
        [this.states.PAUSED]: [this.states.PLAYING, this.states.SETTINGS, this.states.MAIN_MENU],
        [this.states.LEVEL_COMPLETE]: [this.states.UPGRADE, this.states.LEVEL_SELECT, this.states.MAIN_MENU],
        [this.states.LEVEL_FAILED]: [this.states.LEVEL_SELECT, this.states.MAIN_MENU],
        [this.states.UPGRADE]: [this.states.LEVEL_SELECT, this.states.MAIN_MENU],
        [this.states.SETTINGS]: [
          this.states.MAIN_MENU,
          this.states.PLAYING,
          this.states.PAUSED,
          this.states.LEVEL_SELECT
        ]
      };
      const validFromState = validTransitions[fromState];
      return validFromState && validFromState.includes(toState);
    }
    /**
     * Get current state
     * @returns {string} Current state
     */
    getCurrentState() {
      return this.currentState;
    }
    /**
     * Get previous state
     * @returns {string|null} Previous state
     */
    getPreviousState() {
      return this.previousState;
    }
    /**
     * Check if game is in a specific state
     * @param {string} state - State to check
     * @returns {boolean} True if in that state
     */
    isState(state) {
      return this.currentState === state;
    }
    /**
     * Register a callback for state changes
     * @param {string} state - State to listen for (null for all states)
     * @param {Function} callback - Function to call when state changes
     * @returns {Function} Unsubscribe function
     */
    onStateChange(state, callback) {
      if (!this.stateChangeCallbacks.has(state)) {
        this.stateChangeCallbacks.set(state, /* @__PURE__ */ new Set());
      }
      this.stateChangeCallbacks.get(state).add(callback);
      return () => {
        if (this.stateChangeCallbacks.has(state)) {
          this.stateChangeCallbacks.get(state).delete(callback);
          if (this.stateChangeCallbacks.get(state).size === 0) {
            this.stateChangeCallbacks.delete(state);
          }
        }
      };
    }
    /**
     * Notify all listeners of state change
     * @param {string} newState - New state
     * @param {string} oldState - Previous state
     */
    notifyStateChange(newState, oldState) {
      if (this.stateChangeCallbacks.has(newState)) {
        this.stateChangeCallbacks.get(newState).forEach((callback) => {
          try {
            callback(newState, oldState);
          } catch (error) {
            console.error(`Error in state change callback for ${newState}:`, error);
          }
        });
      }
      if (this.stateChangeCallbacks.has(null)) {
        this.stateChangeCallbacks.get(null).forEach((callback) => {
          try {
            callback(newState, oldState);
          } catch (error) {
            console.error(`Error in all-state change callback:`, error);
          }
        });
      }
    }
    /**
     * Clear all state change listeners
     */
    clearListeners() {
      this.stateChangeCallbacks.clear();
    }
    /**
     * Get state machine statistics
     * @returns {object} State machine stats
     */
    getStats() {
      return {
        currentState: this.currentState,
        previousState: this.previousState,
        isTransitioning: this.isTransitioning,
        lastStateChangeTime: this.lastStateChangeTime,
        stateChangeInterval: Date.now() - this.lastStateChangeTime
      };
    }
  };

  // games/js/input/InputManager.js
  var InputManager = class {
    constructor(canvas2, config) {
      this.canvas = canvas2;
      this.config = config;
      this.mouseX = 0;
      this.mouseY = 0;
      this.isPointerDown = false;
      this.pointerDownX = 0;
      this.pointerDownY = 0;
      this.lastTapTime = 0;
      this.activeTouches = /* @__PURE__ */ new Map();
      this.keys = {};
      this.wasKeysPressed = {};
      this.onPointerDown = null;
      this.onPointerUp = null;
      this.onPointerMove = null;
      this.onTap = null;
      this.tapCooldown = 200;
      this.init();
    }
    /**
     * Initialize input listeners
     */
    init() {
      this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
      this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
      this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
      this.canvas.addEventListener("mouseleave", this.onMouseLeave.bind(this));
      this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this), { passive: false });
      this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this), { passive: false });
      this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this), { passive: false });
      this.canvas.addEventListener("touchcancel", this.onTouchCancel.bind(this), { passive: false });
      document.addEventListener("keydown", this.onKeyDown.bind(this));
      document.addEventListener("keyup", this.onKeyUp.bind(this));
      this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    /**
     * Handle mouse down
     */
    onMouseDown(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.mouseX = x;
      this.mouseY = y;
      this.isPointerDown = true;
      this.pointerDownX = x;
      this.pointerDownY = y;
      if (this.onPointerDown) {
        this.onPointerDown(x, y);
      }
      const now = Date.now();
      if (now - this.lastTapTime > this.tapCooldown) {
        if (this.isTap(x, y)) {
          this.lastTapTime = now;
          if (this.onTap) {
            this.onTap(x, y);
          }
        }
      }
    }
    /**
     * Handle mouse up
     */
    onMouseUp(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.mouseX = x;
      this.mouseY = y;
      this.isPointerDown = false;
      if (this.onPointerUp) {
        this.onPointerUp(x, y);
      }
    }
    /**
     * Handle mouse move
     */
    onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.mouseX = x;
      this.mouseY = y;
      if (this.onPointerMove) {
        this.onPointerMove(x, y);
      }
    }
    /**
     * Handle mouse leaving canvas
     */
    onMouseLeave() {
      this.isPointerDown = false;
    }
    /**
     * Handle touch start
     */
    onTouchStart(e) {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      Array.from(e.changedTouches).forEach((touch) => {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.activeTouches.set(touch.identifier, { x, y });
        this.mouseX = x;
        this.mouseY = y;
      });
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect2 = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect2.left;
        const y = touch.clientY - rect2.top;
        this.mouseX = x;
        this.mouseY = y;
        this.isPointerDown = true;
        this.pointerDownX = x;
        this.pointerDownY = y;
        if (this.onPointerDown) {
          this.onPointerDown(x, y);
        }
        const now = Date.now();
        if (now - this.lastTapTime > this.tapCooldown) {
          if (this.isTap(x, y)) {
            this.lastTapTime = now;
            if (this.onTap) {
              this.onTap(x, y);
            }
          }
        }
      }
    }
    /**
     * Handle touch move
     */
    onTouchMove(e) {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      Array.from(e.changedTouches).forEach((touch) => {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.activeTouches.set(touch.identifier, { x, y });
      });
      let latestTouch = null;
      let latestTime = 0;
      this.activeTouches.forEach((pos, id) => {
      });
      if (this.activeTouches.size > 0) {
        const lastTouch = this.activeTouches.values().next().value;
        if (lastTouch) {
          this.mouseX = lastTouch.x;
          this.mouseY = lastTouch.y;
        }
      }
      if (this.onPointerMove) {
        this.onPointerMove(this.mouseX, this.mouseY);
      }
    }
    /**
     * Handle touch end
     */
    onTouchEnd(e) {
      const rect = this.canvas.getBoundingClientRect();
      Array.from(e.changedTouches).forEach((touch) => {
        this.activeTouches.delete(touch.identifier);
      });
      if (this.activeTouches.size === 0) {
        const touch = e.changedTouches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.mouseX = x;
        this.mouseY = y;
        this.isPointerDown = false;
        if (this.onPointerUp) {
          this.onPointerUp(x, y);
        }
      }
    }
    /**
     * Handle touch cancel
     */
    onTouchCancel(e) {
      this.activeTouches.clear();
      this.isPointerDown = false;
    }
    /**
     * Handle key down
     */
    onKeyDown(e) {
      this.keys[e.key] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (this.wasKeysPressed[e.key] !== true) {
        this.wasKeysPressed[e.key] = true;
      }
    }
    /**
     * Handle key up
     */
    onKeyUp(e) {
      this.keys[e.key] = false;
      this.wasKeysPressed[e.key] = false;
    }
    /**
     * Check if position is a tap (click without significant movement)
     */
    isTap(x, y) {
      if (this.isPointerDown) return false;
      const minMove = 10;
      const dx = x - this.pointerDownX;
      const dy = y - this.pointerDownY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < minMove;
    }
    /**
     * Get normalized position (0-1) for responsive UI
     */
    getNormalizedPosition(x, y) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: x / rect.width,
        y: y / rect.height
      };
    }
    /**
     * Convert normalized position to world coordinates
     */
    getWorldPosition(normalX, normalY) {
      return {
        x: normalX * this.canvas.width,
        y: normalY * this.canvas.height
      };
    }
    /**
     * Update input state (called each frame)
     */
    update(deltaTime) {
    }
    /**
     * Check if key is currently pressed
     */
    isKeyPressed(key) {
      return this.keys[key] === true;
    }
    /**
     * Check if key was just pressed (transition from up to down)
     */
    wasKeyPressed(key) {
      return this.wasKeysPressed[key] === true;
    }
    /**
     * Check if any key is pressed
     */
    isAnyKeyPressed() {
      return Object.values(this.keys).some((k) => k);
    }
    /**
     * Get all current touches
     */
    getActiveTouches() {
      return Array.from(this.activeTouches.values());
    }
    /**
     * Get current pointer position
     */
    getPointerPosition() {
      return { x: this.mouseX, y: this.mouseY };
    }
    /**
     * Check if pointer is currently down
     */
    isPointerDown() {
      return this.isPointerDown;
    }
    /**
     * Set callback for pointer down
     */
    setOnPointerDown(callback) {
      this.onPointerDown = callback;
    }
    /**
     * Set callback for pointer up
     */
    setOnPointerUp(callback) {
      this.onPointerUp = callback;
    }
    /**
     * Set callback for pointer move
     */
    setOnPointerMove(callback) {
      this.onPointerMove = callback;
    }
    /**
     * Set callback for tap
     */
    setOnTap(callback) {
      this.onTap = callback;
    }
    /**
     * Clean up resources
     */
    dispose() {
      this.canvas.removeEventListener("mousedown", this.onMouseDown.bind(this));
      this.canvas.removeEventListener("mouseup", this.onMouseUp.bind(this));
      this.canvas.removeEventListener("mousemove", this.onMouseMove.bind(this));
      this.canvas.removeEventListener("mouseleave", this.onMouseLeave.bind(this));
      this.canvas.removeEventListener("touchstart", this.onTouchStart.bind(this));
      this.canvas.removeEventListener("touchmove", this.onTouchMove.bind(this));
      this.canvas.removeEventListener("touchend", this.onTouchEnd.bind(this));
      this.canvas.removeEventListener("touchcancel", this.onTouchCancel.bind(this));
      document.removeEventListener("keydown", this.onKeyDown.bind(this));
      document.removeEventListener("keyup", this.onKeyUp.bind(this));
      this.activeTouches.clear();
    }
    /**
     * Get input statistics for debugging
     */
    getStats() {
      return {
        mouseX: this.mouseX,
        mouseY: this.mouseY,
        isPointerDown: this.isPointerDown,
        activeTouches: this.activeTouches.size,
        keysPressed: Object.keys(this.keys).filter((k) => this.keys[k]).length
      };
    }
  };

  // games/js/particle/ParticleSystem.js
  var ParticleSystem = class {
    constructor(config) {
      this.config = config;
      this.particles = [];
      this.emitters = [];
      this.particleId = 0;
      this.maxParticles = 200;
      this.enablePhysics = true;
      this.particleTypes = this.initParticleTypes();
    }
    /**
     * Initialize predefined particle types
     */
    initParticleTypes() {
      return {
        // Explosion particles
        explosion: {
          life: 800,
          size: { min: 2, max: 6 },
          color: ["#ff4500", "#ffa500", "#ffff00", "#ffffff"],
          speed: { min: 20, max: 80 },
          decay: 0.95,
          gravity: 0.1,
          rotation: { min: 0, max: Math.PI * 2 },
          rotationSpeed: { min: -0.1, max: 0.1 }
        },
        // Spark particles
        spark: {
          life: 400,
          size: { min: 1, max: 3 },
          color: ["#ffff00", "#ff0", "#fff"],
          speed: { min: 50, max: 150 },
          decay: 0.92,
          gravity: 0.05,
          rotation: { min: 0, max: Math.PI * 2 },
          rotationSpeed: { min: -0.2, max: 0.2 }
        },
        // Smoke particles
        smoke: {
          life: 1200,
          size: { min: 3, max: 10 },
          color: ["#666666", "#888888", "#aaaaaa"],
          speed: { min: 5, max: 15 },
          decay: 0.98,
          gravity: -0.02,
          // Slight rise
          rotation: { min: 0, max: Math.PI * 2 },
          rotationSpeed: { min: -0.02, max: 0.02 }
        },
        // Energy particles
        energy: {
          life: 600,
          size: { min: 1, max: 4 },
          color: ["#00ffff", "#00ff00", "#ffff00"],
          speed: { min: 10, max: 30 },
          decay: 0.96,
          gravity: 0,
          rotation: { min: 0, max: Math.PI * 2 },
          rotationSpeed: { min: -0.05, max: 0.05 },
          pulse: true
        },
        // Blood particles
        blood: {
          life: 500,
          size: { min: 1, max: 3 },
          color: ["#ff0000", "#8b0000", "#660000"],
          speed: { min: 5, max: 20 },
          decay: 0.9,
          gravity: 0.2,
          rotation: { min: 0, max: Math.PI * 2 },
          rotationSpeed: { min: -0.1, max: 0.1 }
        },
        // Gold particles (for rewards)
        gold: {
          life: 1e3,
          size: { min: 2, max: 5 },
          color: ["#ffd700", "#ffff00", "#ffea00"],
          speed: { min: 5, max: 15 },
          decay: 0.97,
          gravity: 0.05,
          rotation: { min: 0, max: Math.PI * 2 },
          rotationSpeed: { min: -0.02, max: 0.02 },
          pulse: true,
          bounce: 0.8
        }
      };
    }
    /**
     * Create a new particle
     */
    createParticle(type, x, y, options = {}) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const particleType = this.particleTypes[type] || this.particleTypes.spark;
      const particle = {
        id: this.particleId++,
        type,
        x,
        y,
        vx: options.vx || 0,
        vy: options.vy || 0,
        life: options.life || particleType.life,
        maxLife: options.life || particleType.life,
        size: options.size || particleType.size.min + Math.random() * (particleType.size.max - particleType.size.min),
        color: options.color || particleType.color[Math.floor(Math.random() * particleType.color.length)],
        rotation: options.rotation || particleType.rotation.min + Math.random() * (particleType.rotation.max - particleType.rotation.min),
        rotationSpeed: options.rotationSpeed || particleType.rotationSpeed.min + Math.random() * (particleType.rotationSpeed.max - particleType.rotationSpeed.min),
        decay: options.decay || particleType.decay,
        gravity: options.gravity || particleType.gravity,
        speed: particleType.speed,
        active: true,
        // Custom properties
        pulse: options.pulse || particleType.pulse || false,
        bounce: options.bounce || particleType.bounce || 0,
        trail: options.trail || false,
        trailLength: options.trailLength || 5,
        trailPoints: []
      };
      if (options.vx === void 0 && options.vy === void 0) {
        const angle = Math.random() * Math.PI * 2;
        const speedMin = typeof particleType.speed === "number" ? particleType.speed : particleType.speed.min + Math.random() * (particleType.speed.max - particleType.speed.min);
        const speed = options.speed || speedMin;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
      }
      this.particles.push(particle);
      return particle;
    }
    /**
     * Create a burst of particles
     */
    createBurst(type, x, y, count, options = {}) {
      const particles = [];
      const spread = options.spread || Math.PI * 2;
      const speed = options.speed || (typeof this.particleTypes[type].speed === "number" ? this.particleTypes[type].speed : this.particleTypes[type].speed.min);
      for (let i = 0; i < count; i++) {
        const angle = i / count * spread - spread / 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const particleOptions = {
          ...options,
          vx,
          vy
        };
        particles.push(this.createParticle(type, x, y, particleOptions));
      }
      return particles;
    }
    /**
     * Create a particle trail
     */
    createTrail(type, x, y, length, options = {}) {
      const particles = [];
      const spacing = options.spacing || 2;
      for (let i = 0; i < length; i++) {
        const offsetX = -options.vx * spacing * i;
        const offsetY = -options.vy * spacing * i;
        const particleOptions = {
          ...options,
          life: options.life * (1 - i / length),
          // Fade out along trail
          size: options.size * (1 - i / length * 0.5)
          // Shrink along trail
        };
        particles.push(this.createParticle(type, x + offsetX, y + offsetY, particleOptions));
      }
      return particles;
    }
    /**
     * Update all particles
     */
    update(deltaTime) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        if (!p.active) continue;
        p.life -= deltaTime * 1e3;
        if (p.life <= 0) {
          p.active = false;
          if (Math.random() < 0.1) {
            this.particles.splice(i, 1);
          }
          continue;
        }
        if (this.enablePhysics) {
          p.vy += p.gravity * deltaTime * 60;
          p.vx *= p.decay;
          p.vy *= p.decay;
          if (p.bounce > 0 && p.y > this.config.getConfig("game", "canvasHeight") - 50) {
            p.vy = -p.vy * p.bounce;
            p.y = this.config.getConfig("game", "canvasHeight") - 50;
          }
        }
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.rotation += p.rotationSpeed * deltaTime;
        if (p.pulse) {
          const pulse = 0.5 + 0.5 * Math.sin(p.life / p.maxLife * Math.PI * 4);
          p.size *= pulse;
        }
        if (p.trail) {
          p.trailPoints.push({ x: p.x, y: p.y });
          if (p.trailPoints.length > p.trailLength) {
            p.trailPoints.shift();
          }
        }
      }
      this.particles = this.particles.filter((p) => p.active);
    }
    /**
     * Render all particles
     */
    render(ctx) {
      for (const p of this.particles) {
        if (!p.active) continue;
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.trail && p.trailPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trailPoints[0].x, p.trailPoints[0].y);
          for (let i = 1; i < p.trailPoints.length; i++) {
            ctx.lineTo(p.trailPoints[i].x, p.trailPoints[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        if (Array.isArray(p.color)) {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          for (let i = 0; i < p.color.length; i++) {
            gradient.addColorStop(i / (p.color.length - 1), p.color[i]);
          }
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = p.color;
        }
        ctx.fill();
        if (p.type === "energy" || p.type === "gold") {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }
    /**
     * Create an emitter that continuously emits particles
     */
    createEmitter(type, x, y, rate, options = {}) {
      const emitter = {
        type,
        x,
        y,
        rate,
        // particles per second
        lastEmit: 0,
        options,
        active: true
      };
      this.emitters.push(emitter);
      return emitter;
    }
    /**
     * Update emitters
     */
    updateEmitters(deltaTime) {
      const now = Date.now();
      for (let i = this.emitters.length - 1; i >= 0; i--) {
        const e = this.emitters[i];
        if (!e.active) continue;
        const timeSinceLastEmit = now - e.lastEmit;
        const particlesToEmit = e.rate * timeSinceLastEmit / 1e3;
        if (particlesToEmit >= 1) {
          const emitCount = Math.floor(particlesToEmit);
          for (let j = 0; j < emitCount; j++) {
            const offsetX = (Math.random() - 0.5) * 5;
            const offsetY = (Math.random() - 0.5) * 5;
            this.createParticle(e.type, e.x + offsetX, e.y + offsetY, e.options);
          }
          e.lastEmit = now - timeSinceLastEmit % (1e3 / e.rate);
        }
      }
      this.emitters = this.emitters.filter((e) => e.active);
    }
    /**
     * Clear all particles
     */
    clear() {
      this.particles = [];
      this.emitters = [];
    }
    /**
     * Get particle count
     */
    getParticleCount() {
      return this.particles.length;
    }
    /**
     * Set max particles (for quality adjustment)
     */
    setMaxParticles(max) {
      this.maxParticles = max;
      if (this.particles.length > max) {
        this.particles = this.particles.slice(0, max);
      }
    }
  };

  // games/js/rendering/Renderer.js
  var Renderer = class {
    constructor(canvas2, ctx, config) {
      this.canvas = canvas2;
      this.ctx = ctx;
      this.config = config;
      this.showDebug = false;
      this.floatingMessages = [];
      this.screenShake = { intensity: 0, duration: 0, offsetX: 0, offsetY: 0 };
      this.vignetteIntensity = 0.2;
      this.assets = {};
      this.gradientCache = /* @__PURE__ */ new Map();
      this.patternCache = /* @__PURE__ */ new Map();
      this.particleSystem = new ParticleSystem(config);
      this.quality = "HIGH";
      this.setQualityLimits();
    }
    /**
     * Set quality limits based on performance tier
     */
    setQualityLimits() {
      switch (this.quality) {
        case "LOW":
          this.maxParticles = 50;
          this.maxFloatingMessages = 5;
          this.enableScreenShake = false;
          this.enableVignette = false;
          this.enableGlow = false;
          this.enableParticleTrails = false;
          this.particleSystem.setMaxParticles(50);
          break;
        case "MEDIUM":
          this.maxParticles = 100;
          this.maxFloatingMessages = 10;
          this.enableScreenShake = true;
          this.enableVignette = true;
          this.enableGlow = true;
          this.enableParticleTrails = false;
          this.particleSystem.setMaxParticles(100);
          break;
        case "HIGH":
          this.maxParticles = 200;
          this.maxFloatingMessages = 15;
          this.enableScreenShake = true;
          this.enableVignette = true;
          this.enableGlow = true;
          this.enableParticleTrails = true;
          this.particleSystem.setMaxParticles(200);
          break;
        case "ULTRA":
          this.maxParticles = 400;
          this.maxFloatingMessages = 20;
          this.enableScreenShake = true;
          this.enableVignette = true;
          this.enableGlow = true;
          this.enableParticleTrails = true;
          this.enableMotionBlur = true;
          this.particleSystem.setMaxParticles(400);
          break;
        default:
          this.maxParticles = 200;
          this.maxFloatingMessages = 15;
          this.enableScreenShake = true;
          this.enableVignette = true;
          this.enableGlow = true;
          this.enableParticleTrails = true;
          this.particleSystem.setMaxParticles(200);
      }
    }
    /**
     * Update effects and animations
     */
    update(deltaTime) {
      this.updateEffects(deltaTime);
      this.updateScreenShake(deltaTime);
      this.particleSystem.update(deltaTime);
    }
    /**
     * Render the entire game world
     */
    renderGameWorld(entities, gates, weaponEffects, levelData) {
      if (this.enableScreenShake && this.screenShake.intensity > 0) {
        this.ctx.save();
        this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawBackground();
      this.drawLevelEnvironment(levelData);
      this.drawGates(gates);
      this.drawWeaponEffects(weaponEffects);
      this.drawEntities(entities);
      if (entities) {
        if (entities.enemyUnits) {
          entities.enemyUnits.forEach((entity) => this.drawEntity(entity));
        }
        if (entities.playerUnits) {
          entities.playerUnits.forEach((entity) => this.drawEntity(entity));
        }
        if (entities.projectiles) {
          entities.projectiles.forEach((projectile) => this.drawProjectile(projectile));
        }
      }
      this.particleSystem.render(this.ctx);
      this.drawFloatingMessages();
      if (this.enableVignette) {
        this.drawVignette();
      }
      if (this.enableScreenShake && this.screenShake.intensity > 0) {
        this.ctx.restore();
      }
    }
    /**
     * Render the game background
     */
    drawBackground() {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, "#0a192f");
      gradient.addColorStop(0.5, "#112240");
      gradient.addColorStop(1, "#0a192f");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawBackgroundGrid();
      this.drawAnimatedBackground();
    }
    /**
     * Draw background grid pattern
     */
    drawBackgroundGrid() {
      this.ctx.strokeStyle = "rgba(255,255,255,0.03)";
      this.ctx.lineWidth = 1;
      for (let y = 0; y < this.canvas.height; y += 50) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
      }
      for (let x = 0; x < this.canvas.width; x += 50) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
      }
      if (this.quality !== "LOW") {
        this.drawAnimatedGridLines();
      }
    }
    /**
     * Draw animated background elements
     */
    drawAnimatedBackground() {
      const time = Date.now() * 1e-3;
      this.ctx.fillStyle = "rgba(255,255,255,0.02)";
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 0.3 + i) * 100 + this.canvas.width / 2) % this.canvas.width;
        const y = (Math.cos(time * 0.2 + i * 0.7) * 80 + this.canvas.height / 2) % this.canvas.height;
        const size = 2 + Math.sin(time * 0.5 + i) * 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    /**
     * Draw animated grid lines
     */
    drawAnimatedGridLines() {
      this.ctx.strokeStyle = "rgba(0,255,255,0.1)";
      this.ctx.lineWidth = 1;
      const time = Date.now() * 5e-4;
      const offset = Math.sin(time) * 10;
      for (let y = 0; y < this.canvas.height; y += 100) {
        const yOffset = y + Math.sin(time * 0.3 + y * 0.01) * 5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, yOffset);
        this.ctx.lineTo(this.canvas.width, yOffset);
        this.ctx.stroke();
      }
      for (let x = 0; x < this.canvas.width; x += 100) {
        const xOffset = x + Math.cos(time * 0.3 + x * 0.01) * 5;
        this.ctx.beginPath();
        this.ctx.moveTo(xOffset, 0);
        this.ctx.lineTo(xOffset, this.canvas.height);
        this.ctx.stroke();
      }
    }
    /**
     * Draw level environment (placeholder for Session 3)
     */
    drawLevelEnvironment(levelData) {
      if (levelData && levelData.obstacles) {
        levelData.obstacles.forEach((obstacle) => {
          this.ctx.fillStyle = obstacle.color || "#555";
          this.ctx.beginPath();
          this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius || 20, 0, Math.PI * 2);
          this.ctx.fill();
          if (this.enableGlow && obstacle.glow !== false) {
            this.ctx.save();
            this.ctx.shadowColor = obstacle.color || "#555";
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = obstacle.color || "#555";
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, obstacle.radius || 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
          }
        });
      }
      if (levelData && levelData.theme) {
        this.drawEnvironmentalEffects(levelData.theme);
      }
    }
    /**
     * Draw environmental effects based on theme
     */
    drawEnvironmentalEffects(theme) {
      const time = Date.now() * 1e-3;
      switch (theme) {
        case "Neon Genesis":
          this.ctx.fillStyle = "rgba(0,255,166,0.05)";
          for (let i = 0; i < 30; i++) {
            const x = Math.random() * this.canvas.width;
            const y = (Date.now() * 0.2 + i * 20) % this.canvas.height;
            const len = 10 + Math.sin(time + i) * 5;
            this.ctx.fillRect(x, y, 2, len);
          }
          break;
        case "Prismatic Frontier":
          this.ctx.strokeStyle = "rgba(0,255,255,0.1)";
          this.ctx.lineWidth = 1;
          for (let i = 0; i < 10; i++) {
            const x = Math.sin(time * 0.5 + i) * 100 + this.canvas.width / 2;
            const y = Math.cos(time * 0.3 + i) * 100 + this.canvas.height / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20 + Math.sin(time * 0.7 + i) * 10, 0, Math.PI * 2);
            this.ctx.stroke();
          }
          break;
        case "Industrial Wasteland":
          this.ctx.fillStyle = "rgba(139,69,19,0.1)";
          for (let i = 0; i < 15; i++) {
            const x = (Math.sin(time * 0.4 + i) * 50 + this.canvas.width / 2) % this.canvas.width;
            const y = (Math.cos(time * 0.3 + i * 0.7) * 30 + this.canvas.height / 4) % this.canvas.height;
            const size = 3 + Math.sin(time * 0.6 + i) * 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
          }
          break;
        default:
          break;
      }
    }
    /**
     * Draw all gates
     */
    drawGates(gates) {
      if (!gates) return;
      gates.forEach((gate) => {
        this.drawGate(gate);
      });
    }
    /**
     * Draw a single gate
     */
    drawGate(gate) {
      this.ctx.save();
      this.ctx.translate(gate.x, gate.y);
      this.ctx.shadowColor = "rgba(0,0,0,0.5)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, gate.width / 2, 0, Math.PI * 2);
      let gradient;
      switch (gate.type) {
        case "add":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#00ff88");
          gradient.addColorStop(1, "#00cc6a");
          break;
        case "mult":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#00ffff");
          gradient.addColorStop(1, "#00cccc");
          break;
        case "sub":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#ff6b6b");
          gradient.addColorStop(1, "#ff5252");
          break;
        case "speed":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#ffd700");
          gradient.addColorStop(1, "#ffb800");
          break;
        case "split":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#ff00ff");
          gradient.addColorStop(1, "#cc00cc");
          break;
        case "magnet":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#8a2be2");
          gradient.addColorStop(1, "#6a1cb2");
          break;
        case "shield":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#ffffff");
          gradient.addColorStop(1, "#e0e0e0");
          break;
        case "random":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#ff8c00");
          gradient.addColorStop(1, "#cc7000");
          break;
        case "risk_reward":
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#8b0000");
          gradient.addColorStop(1, "#6b0000");
          break;
        default:
          gradient = this.ctx.createLinearGradient(-gate.width / 2, -gate.height / 2, gate.width / 2, gate.height / 2);
          gradient.addColorStop(0, "#666");
          gradient.addColorStop(1, "#444");
      }
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.shadowColor = "transparent";
      this.ctx.strokeStyle = "rgba(255,255,255,0.7)";
      this.ctx.lineWidth = 2;
      if (gate.active && gate.animationProgress) {
        const pulseIntensity = 0.3 * Math.sin(gate.animationProgress * Math.PI * 2);
        this.ctx.strokeStyle = `rgba(255,255,255,${0.7 + pulseIntensity})`;
        this.ctx.lineWidth = 2 + pulseIntensity * 2;
      }
      this.ctx.stroke();
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = "bold 18px Arial";
      this.ctx.fillText(gate.value, 0, -6);
      this.ctx.font = "bold 20px Arial";
      let symbol;
      switch (gate.type) {
        case "add":
          symbol = "+";
          break;
        case "mult":
          symbol = "\xD7";
          break;
        case "sub":
          symbol = "-";
          break;
        case "speed":
          symbol = "\u26A1";
          break;
        case "split":
          symbol = "\u2195";
          break;
        case "magnet":
          symbol = "\u{1F9F2}";
          break;
        case "shield":
          symbol = "\u{1F6E1}\uFE0F";
          break;
        case "random":
          symbol = "?";
          break;
        case "risk_reward":
          symbol = "\u26A0\uFE0F";
          break;
        default:
          symbol = gate.type.charAt(0).toUpperCase();
          break;
      }
      this.ctx.fillText(symbol, 0, 10);
      if (gate.active && gate.triggerParticles) {
        this.drawGateActivationParticles(gate);
      }
      this.ctx.restore();
    }
    /**
     * Draw gate activation particles
     */
    drawGateActivationParticles(gate) {
      const particleCount = Math.min(gate.triggerParticles.length, 20);
      for (let i = 0; i < particleCount; i++) {
        const p = gate.triggerParticles[i];
        if (!p.active) continue;
        this.ctx.save();
        this.ctx.globalAlpha = p.life / p.maxLife;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(
          gate.x + p.offsetX,
          gate.y + p.offsetY,
          p.size,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
      }
    }
    /**
     * Draw all entities
     */
    drawEntities(entities) {
      if (!entities) return;
      if (entities.playerUnits) {
        entities.playerUnits.forEach((unit) => this.drawEntity(unit));
      }
      if (entities.enemyUnits) {
        entities.enemyUnits.forEach((unit) => this.drawEntity(unit));
      }
    }
    /**
     * Draw a single entity (unit or enemy)
     */
    drawEntity(entity) {
      if (!entity || !entity.active) return;
      this.ctx.save();
      this.ctx.translate(entity.x, entity.y);
      this.ctx.rotate(entity.rotation || 0);
      this.ctx.shadowColor = "rgba(0,0,0,0.3)";
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
      let color = entity.color;
      if (entity.flashTimer && entity.flashTimer > 0) {
        color = "#ffffff";
      }
      if (entity.isShielded) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, entity.radius + 8 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
        const shieldGradient = this.ctx.createRadialGradient(0, 0, entity.radius, 0, 0, entity.radius + 12);
        shieldGradient.addColorStop(0, "rgba(255,255,255,0.4)");
        shieldGradient.addColorStop(1, "rgba(255,255,255,0)");
        this.ctx.fillStyle = shieldGradient;
        this.ctx.fill();
        this.ctx.restore();
      }
      if (entity.glow && this.enableGlow) {
        this.ctx.save();
        this.ctx.shadowColor = entity.color;
        this.ctx.shadowBlur = entity.glow * 2;
        this.ctx.fillStyle = entity.color;
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
      }
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      if (entity.health < entity.maxHealth) {
        this.drawHealthBar(entity);
      }
      if (entity.type === "ranged" || entity.isRanged) {
        this.drawRangeIndicator(entity);
      }
      if (entity.isAttacking) {
        this.drawAttackIndicator(entity);
      }
      this.ctx.restore();
      if (entity.flashTimer) {
        entity.flashTimer -= 16;
      }
    }
    /**
     * Draw health bar above entity
     */
    drawHealthBar(entity) {
      const barWidth = entity.radius * 2;
      const barHeight = 4;
      const barX = -entity.radius;
      const barY = -entity.radius - 8;
      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
      this.ctx.fillRect(barX, barY, barWidth, barHeight);
      const healthPercentage = entity.health / entity.maxHealth;
      let healthColor = "#00ff00";
      if (healthPercentage < 0.5) healthColor = "#ffff00";
      if (healthPercentage < 0.25) healthColor = "#ff0000";
      const gradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercentage, barY);
      gradient.addColorStop(0, healthColor);
      gradient.addColorStop(1, this.lightenColor(healthColor, 0.3));
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
      this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(barX, barY, barWidth, barHeight);
      if (entity.radius > 15) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 10px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(`${Math.round(healthPercentage * 100)}%`, 0, barY + barHeight / 2);
      }
    }
    /**
     * Draw range indicator for ranged units
     */
    drawRangeIndicator(entity) {
      if (!entity.range) return;
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(255,255,0,0.3)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, entity.range, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
      if (this.quality !== "LOW") {
        this.ctx.save();
        this.ctx.strokeStyle = "rgba(255,255,0,0.5)";
        this.ctx.lineWidth = 2;
        const pulseRadius = entity.range + Math.sin(Date.now() * 5e-3) * 5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
    /**
     * Draw attack indicator
     */
    drawAttackIndicator(entity) {
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(255,0,0,0.5)";
      this.ctx.lineWidth = 2;
      const startAngle = -Math.PI / 4;
      const endAngle = Math.PI / 4;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, entity.radius + 5, startAngle, endAngle);
      this.ctx.stroke();
      if (Math.random() < 0.3) {
        this.addParticleEffect(
          Math.cos(0) * (entity.radius + 8),
          Math.sin(0) * (entity.radius + 8),
          "#ff0000",
          3 + Math.random() * 2,
          300 + Math.random() * 200
        );
      }
      this.ctx.restore();
    }
    /**
     * Draw projectile
     */
    drawProjectile(projectile) {
      if (!projectile || !projectile.active) return;
      this.ctx.save();
      this.ctx.translate(projectile.x, projectile.y);
      if (this.enableMotionBlur && Math.abs(projectile.vx) > 5 || Math.abs(projectile.vy) > 5) {
        this.drawMotionBlurTrail(projectile);
      }
      this.ctx.shadowColor = "#ffff00";
      this.ctx.shadowBlur = projectile.glow || 6;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, projectile.width / 2, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, projectile.width / 2);
      gradient.addColorStop(0, "#ffff00");
      gradient.addColorStop(1, "#ffaa00");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      if (this.quality === "ULTRA" && Math.random() < 0.2) {
        this.addParticleEffect(
          -Math.cos(Math.atan2(projectile.vy, projectile.vx)) * 5,
          -Math.sin(Math.atan2(projectile.vy, projectile.vx)) * 5,
          "#ffff00",
          2,
          150
        );
      }
      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }
    /**
     * Draw motion blur trail for fast projectiles
     */
    drawMotionBlurTrail(projectile) {
      const segments = 3;
      const maxLength = 15;
      for (let i = 0; i < segments; i++) {
        const progress = (i + 1) / segments;
        const length = maxLength * progress;
        const alpha = 0.3 * (1 - progress);
        const offsetX = -(projectile.vx / Math.max(0.1, Math.abs(projectile.vx) + Math.abs(projectile.vy))) * length * progress;
        const offsetY = -(projectile.vy / Math.max(0.1, Math.abs(projectile.vx) + Math.abs(projectile.vy))) * length * progress;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = "#ffff00";
        this.ctx.beginPath();
        this.ctx.arc(
          projectile.x + offsetX,
          projectile.y + offsetY,
          projectile.width / 2,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
      }
    }
    /**
     * Draw weapon effects
     */
    drawWeaponEffects(effects) {
      if (!effects) return;
      effects.forEach((effect) => {
        switch (effect.type) {
          case "explosion":
            this.drawExplosion(effect);
            break;
          case "pulse":
            this.drawPulse(effect);
            break;
          case "wave":
            this.drawWave(effect);
            break;
          case "beam":
            this.drawBeam(effect);
            break;
          case "particle_burst":
            this.drawParticleBurst(effect);
            break;
          case "ring":
            this.drawRingEffect(effect);
            break;
          case "cone":
            this.drawConeEffect(effect);
            break;
          default:
            this.drawGenericEffect(effect);
            break;
        }
      });
    }
    /**
     * Draw explosion effect
     */
    drawExplosion(effect) {
      this.ctx.save();
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
      gradient.addColorStop(0, "#ff4500");
      gradient.addColorStop(0.5, "#ffa500");
      gradient.addColorStop(0.8, "#ffff00");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius * 1.5, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(255,165,0,0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      if (this.enableParticleTrails && Math.random() < 0.5) {
        const particleCount = Math.min(5 + Math.random() * 10, 20);
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 8;
          const life = 300 + Math.random() * 400;
          this.addParticleEffect(
            effect.x,
            effect.y,
            "#ffa500",
            2 + Math.random() * 3,
            life,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
          );
        }
      }
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw pulse effect
     */
    drawPulse(effect) {
      this.ctx.save();
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
      gradient.addColorStop(0, effect.color || "#00ffff");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2);
      const innerGradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius * 0.7);
      innerGradient.addColorStop(0, effect.color || "#00ffff");
      innerGradient.addColorStop(1, "rgba(0,0,0,0.3)");
      this.ctx.fillStyle = innerGradient;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw wave effect
     */
    drawWave(effect) {
      this.ctx.save();
      this.ctx.strokeStyle = effect.color || "#00ffff";
      this.ctx.lineWidth = effect.width || 3;
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      if (this.quality !== "LOW") {
        for (let i = 1; i <= 2; i++) {
          const waveRadius = effect.radius * (1 + i * 0.3);
          const waveAlpha = effect.life / effect.maxLife * (1 - i * 0.3);
          if (waveAlpha > 0) {
            this.ctx.save();
            this.ctx.strokeStyle = effect.color || "#00ffff";
            this.ctx.lineWidth = Math.max(1, effect.width * 0.5);
            this.ctx.globalAlpha = waveAlpha;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, waveRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
          }
        }
      }
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw beam effect
     */
    drawBeam(effect) {
      this.ctx.save();
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.beginPath();
      this.ctx.moveTo(effect.startX, effect.startY);
      this.ctx.lineTo(effect.endX, effect.endY);
      this.ctx.strokeStyle = effect.color || "#ff00ff";
      this.ctx.lineWidth = effect.width || 4;
      this.ctx.stroke();
      this.ctx.shadowColor = effect.color || "#ff00ff";
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(effect.startX, effect.startY);
      this.ctx.lineTo(effect.endX, effect.endY);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
      if (this.enableParticleTrails) {
        const steps = Math.max(3, Math.floor(effect.width / 2));
        for (let i = 0; i <= steps; i++) {
          const progress = i / steps;
          const x = effect.startX + (effect.endX - effect.startX) * progress;
          const y = effect.startY + (effect.endY - effect.startY) * progress;
          if (Math.random() < 0.3) {
            this.addParticleEffect(
              x,
              y,
              effect.color || "#ff00ff",
              2,
              200,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 2
            );
          }
        }
      }
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw particle burst effect
     */
    drawParticleBurst(effect) {
      if (effect.particles) {
        effect.particles.forEach((particle) => {
          if (!particle.active) return;
          this.ctx.save();
          this.ctx.globalAlpha = particle.life / particle.maxLife;
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
          this.ctx.globalAlpha = 1;
          this.ctx.restore();
        });
      }
    }
    /**
     * Draw ring effect
     */
    drawRingEffect(effect) {
      this.ctx.save();
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.strokeStyle = effect.color || "#ffffff";
      this.ctx.lineWidth = effect.width || 3;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.save();
      this.ctx.shadowColor = effect.color || "#ffffff";
      this.ctx.shadowBlur = effect.blur || 10;
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw cone effect
     */
    drawConeEffect(effect) {
      this.ctx.save();
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.fillStyle = effect.color || "#ff0000";
      this.ctx.beginPath();
      this.ctx.moveTo(effect.x, effect.y);
      this.ctx.lineTo(effect.x + Math.cos(effect.startAngle) * effect.radius, effect.y + Math.sin(effect.startAngle) * effect.radius);
      this.ctx.arc(effect.x, effect.y, effect.radius, effect.startAngle, effect.endAngle, effect.clockwise || false);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw generic effect
     */
    drawGenericEffect(effect) {
      this.ctx.save();
      this.ctx.globalAlpha = effect.life / effect.maxLife;
      this.ctx.fillStyle = effect.color || "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
      this.ctx.restore();
    }
    /**
     * Draw particle effects
     */
    drawParticleEffects() {
    }
    /**
     * Draw floating messages
     */
    drawFloatingMessages() {
      this.floatingMessages.forEach((msg, index) => {
        if (!msg.active) return;
        this.ctx.save();
        this.ctx.globalAlpha = msg.life / msg.maxLife;
        this.ctx.fillStyle = msg.color || "#ffffff";
        this.ctx.font = msg.font || "bold 16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(msg.text, msg.x, msg.y - msg.offset);
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
      });
    }
    /**
     * Draw vignette effect
     */
    drawVignette() {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(0,0,0,${this.vignetteIntensity})`;
      const gradient = this.ctx.createRadialGradient(
        this.canvas.width / 2,
        this.canvas.height / 2,
        0,
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.max(this.canvas.width, this.canvas.height) / 2
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,1)");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    /**
     * Add particle effect - now delegates to particle system
     */
    addParticleEffect(x, y, color, size, life, vx = 0, vy = 0) {
      let type = "spark";
      if (color === "#ffa500" || color === "#ff4500") type = "explosion";
      else if (color === "#666666" || color === "#888888") type = "smoke";
      else if (color === "#00ffff" || color === "#00ff00") type = "energy";
      else if (color === "#ffd700") type = "gold";
      else if (color === "#ff0000") type = "blood";
      this.particleSystem.createParticle(type, x, y, {
        size,
        life,
        vx,
        vy,
        color
      });
    }
    /**
     * Add floating message
     */
    addFloatingMessage(text, x, y, color, life) {
      if (this.floatingMessages.length >= this.maxFloatingMessages) {
        this.floatingMessages.shift();
      }
      this.floatingMessages.push({
        text,
        x,
        y,
        color,
        life,
        maxLife: life,
        offset: 0,
        active: true
      });
    }
    /**
     * Trigger screen shake
     */
    triggerScreenShake(intensity, duration) {
      this.screenShake.intensity = intensity;
      this.screenShake.duration = duration;
      this.screenShake.startTime = Date.now();
    }
    /**
     * Update screen shake
     */
    updateScreenShake(deltaTime) {
      if (this.screenShake.duration > 0) {
        const elapsed = Date.now() - this.screenShake.startTime;
        const progress = Math.min(elapsed / (this.screenShake.duration * 1e3), 1);
        const easeOut = 1 - Math.pow(progress - 1, 2);
        this.screenShake.intensity = this.screenShake.duration > 0 ? this.screenShake.duration * easeOut : 0;
        const angle = Math.random() * Math.PI * 2;
        const offset = this.screenShake.intensity * (1 - progress);
        this.screenShake.offsetX = Math.cos(angle) * offset;
        this.screenShake.offsetY = Math.sin(angle) * offset;
        if (elapsed >= this.screenShake.duration * 1e3) {
          this.screenShake.intensity = 0;
          this.screenShake.duration = 0;
        }
      }
    }
    /**
     * Update effects (called each frame)
     */
    updateEffects(deltaTime) {
      for (let i = this.floatingMessages.length - 1; i >= 0; i--) {
        const msg = this.floatingMessages[i];
        if (!msg.active) continue;
        msg.life -= deltaTime * 1e3;
        if (msg.life <= 0) {
          msg.active = false;
          if (Math.random() < 0.1) {
            this.floatingMessages.splice(i, 1);
          }
        } else {
          msg.offset += deltaTime * 20;
          msg.y -= deltaTime * 10;
          if (Math.random() < 0.2) {
            msg.x += (Math.random() - 0.5) * 3;
          }
        }
      }
      if (Date.now() % 1e3 < 16) {
        this.floatingMessages = this.floatingMessages.filter((m) => m.active);
      }
    }
    /**
     * Render HUD elements
     */
    renderHUD(hudData) {
      if (!hudData) return;
      if (hudData.crowdCount !== void 0 && hudData.goalCount !== void 0) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 18px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Crowd: ${hudData.crowdCount} / ${hudData.goalCount}`, 10, 25);
        const progress = hudData.crowdCount / hudData.goalCount;
        let color = "#ff0000";
        if (progress > 0.8) color = "#00ff00";
        else if (progress > 0.5) color = "#ffff00";
        else if (progress > 0.2) color = "#ff8800";
        this.ctx.fillStyle = color;
        this.ctx.font = "bold 22px Arial";
        this.ctx.fillText(hudData.crowdCount, 80, 25);
        if (this.enableGlow && progress > 0.5) {
          this.ctx.save();
          this.ctx.shadowColor = color;
          this.ctx.shadowBlur = 8;
          this.ctx.fillText(hudData.crowdCount, 80, 25);
          this.ctx.restore();
        }
      }
      if (hudData.score !== void 0) {
        this.ctx.fillStyle = "#ffd700";
        this.ctx.font = "bold 18px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Score: ${hudData.score}`, 10, 50);
        if (hudData.score > 1e3 && this.enableGlow) {
          this.ctx.save();
          this.ctx.shadowColor = "#ffd700";
          this.ctx.shadowBlur = 12 + Math.sin(Date.now() * 5e-3) * 4;
          this.ctx.fillText(`Score: ${hudData.score}`, 10, 50);
          this.ctx.restore();
        }
      }
      if (hudData.waveCount !== void 0) {
        this.ctx.fillStyle = "#00ffff";
        this.ctx.font = "bold 18px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Wave: ${hudData.waveCount}`, 10, 75);
        this.ctx.save();
        this.ctx.shadowColor = "#00ffff";
        this.ctx.shadowBlur = 6 + Math.sin(Date.now() * 3e-3) * 3;
        this.ctx.fillText(`Wave: ${hudData.waveCount}`, 10, 75);
        this.ctx.restore();
      }
      if (hudData.levelNumber !== void 0) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 18px Arial";
        this.ctx.textAlign = "right";
        this.ctx.fillText(`Level: ${hudData.levelNumber}`, this.canvas.width - 10, 25);
        if (hudData.levelProgress !== void 0) {
          const barWidth = 100;
          const barHeight = 4;
          const barX = this.canvas.width - 10 - barWidth;
          const barY = 20;
          this.ctx.fillStyle = "rgba(0,0,0,0.5)";
          this.ctx.fillRect(barX, barY, barWidth, barHeight);
          this.ctx.fillStyle = "#00ffff";
          this.ctx.fillRect(barX, barY, barWidth * hudData.levelProgress, barHeight);
          this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
      }
      if (hudData.coins !== void 0) {
        this.ctx.fillStyle = "#ffd700";
        this.ctx.font = "bold 18px Arial";
        this.ctx.textAlign = "right";
        this.ctx.fillText(`Coins: ${hudData.coins}`, this.canvas.width - 10, 50);
        if (this.enableGlow && hudData.coins > 0) {
          this.ctx.save();
          this.ctx.shadowColor = "#ffd700";
          this.ctx.shadowBlur = 6;
          this.ctx.fillText(`Coins: ${hudData.coins}`, this.canvas.width - 10, 50);
          this.ctx.restore();
        }
      }
      if (this.showDebug && hudData.fps !== void 0) {
        this.ctx.fillStyle = "#00ff00";
        this.ctx.font = "14px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`FPS: ${hudData.fps}`, 10, this.canvas.height - 20);
        if (hudData.currentState) {
          this.ctx.fillText(`State: ${hudData.currentState}`, 10, this.canvas.height - 5);
        }
        if (hudData.entityCount !== void 0) {
          this.ctx.fillText(`Entities: ${hudData.entityCount}`, 10, this.canvas.height - 35);
        }
        if (hudData.particleCount !== void 0) {
          this.ctx.fillText(`Particles: ${hudData.particleCount}`, 10, this.canvas.height - 50);
        }
      }
    }
    /**
     * Handle canvas resize
     */
    onResize(width, height) {
      this.gradientCache.clear();
      this.patternCache.clear();
    }
    /**
     * Toggle debug drawing
     */
    toggleDebug() {
      this.showDebug = !this.showDebug;
    }
    /**
     * Clear all effects
     */
    clearEffects() {
      this.floatingMessages = [];
    }
    /**
     * Dispose of renderer resources
     */
    dispose() {
      this.clearEffects();
      this.gradientCache.clear();
      this.patternCache.clear();
      this.particleSystem.clear();
      this.assets = {};
    }
    /**
     * Get renderer statistics for debugging
     */
    getStats() {
      return {
        particleEffects: this.particleSystem.getParticleCount(),
        floatingMessages: this.floatingMessages.length,
        showDebug: this.showDebug,
        gradientCacheSize: this.gradientCache.size,
        patternCacheSize: this.patternCache.size,
        quality: this.quality,
        screenShakeIntensity: this.screenShake.intensity
      };
    }
    /**
     * Utility: Convert hex color to rgb string
     */
    hexToRgb(hex) {
      hex = hex.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
    /**
     * Utility: Lighten a color by a factor (0-1)
     */
    lightenColor(color, factor) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const newR = Math.min(255, r + (255 - r) * factor);
      const newG = Math.min(255, g + (255 - g) * factor);
      const newB = Math.min(255, b + (255 - b) * factor);
      return `#${Math.round(newR).toString(16).padStart(2, "0")}${Math.round(newG).toString(16).padStart(2, "0")}${Math.round(newB).toString(16).padStart(2, "0")}`;
    }
    /**
     * Utility: Darken a color by a factor (0-1)
     */
    darkenColor(color, factor) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const newR = Math.max(0, r - r * factor);
      const newG = Math.max(0, g - g * factor);
      const newB = Math.max(0, b - b * factor);
      return `#${Math.round(newR).toString(16).padStart(2, "0")}${Math.round(newG).toString(16).padStart(2, "0")}${Math.round(newB).toString(16).padStart(2, "0")}`;
    }
  };

  // games/js/physics/PhysicsEngine.js
  var PhysicsEngine = class {
    constructor(config) {
      this.config = config;
      this.gravity = config.getConfig("physics", "gravity") || 0;
      this.friction = config.getConfig("physics", "friction") || 0.98;
      this.separationForce = config.getConfig("physics", "separationForce") || 0.5;
      this.maxSpeed = config.getConfig("physics", "maxSpeed") || 300;
      this.acceleration = config.getConfig("physics", "acceleration") || 800;
      this.knockbackForce = config.getConfig("physics", "knockbackForce") || 200;
      this.spatialGrid = null;
      this.gridSize = 100;
      this.enableSpatialPartitioning = true;
    }
    /**
     * Apply physics to an entity
     * Combines movement, velocity, and forces
     */
    applyPhysics(entity, deltaTime) {
      if (!entity || !entity.active) return;
      entity.vy += this.gravity * deltaTime;
      entity.vx *= this.friction;
      entity.vy *= this.friction;
      const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
      if (speed > this.maxSpeed) {
        entity.vx = entity.vx / speed * this.maxSpeed;
        entity.vy = entity.vy / speed * this.maxSpeed;
      }
    }
    /**
     * Check collision between two entities using AABB/circle collision
     */
    checkCollision(entityA, entityB) {
      if (!entityA.active || !entityB.active) return false;
      const dx = entityA.x - entityB.x;
      const dy = entityA.y - entityB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radiusA = entityA.radius || 12;
      const radiusB = entityB.radius || 12;
      return distance < radiusA + radiusB;
    }
    /**
     * Check collision using AABB (Axis-Aligned Bounding Box)
     */
    checkAABBCollision(entityA, entityB) {
      if (!entityA.active || !entityB.active) return false;
      const radiusA = entityA.radius || 12;
      const radiusB = entityB.radius || 12;
      return Math.abs(entityA.x - entityB.x) < radiusA + radiusB && Math.abs(entityA.y - entityB.y) < radiusA + radiusB;
    }
    /**
     * Apply separation force between entities to prevent overlap
     */
    applySeparation(entities, minDistance = 25) {
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const entityA = entities[i];
          const entityB = entities[j];
          if (!entityA.active || !entityB.active) continue;
          const dx = entityA.x - entityB.x;
          const dy = entityA.y - entityB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < minDistance) {
            const separation = minDistance - distance;
            const separationX = dx / distance * (separation / 2) * this.separationForce;
            const separationY = dy / distance * (separation / 2) * this.separationForce;
            entityA.x += separationX;
            entityA.y += separationY;
            entityB.x -= separationX;
            entityB.y -= separationY;
          }
        }
      }
    }
    /**
     * Apply knockback to an entity from a point
     */
    applyKnockback(entity, fromX, fromY, force = this.knockbackForce) {
      const dx = entity.x - fromX;
      const dy = entity.y - fromY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        entity.vx += dx / distance * force;
        entity.vy += dy / distance * force;
      }
    }
    /**
     * Apply force to an entity
     */
    applyForce(entity, fx, fy) {
      entity.vx += fx;
      entity.vy += fy;
    }
    /**
     * Generate repulsion force from a point (e.g., gate explosion)
     */
    generateRepulsion(x, y, radius, force) {
      return { x, y, radius, force };
    }
    /**
     * Update spatial grid for optimization
     */
    updateSpatialGrid(entities, canvasWidth, canvasHeight) {
      if (!this.enableSpatialPartitioning) return;
      const gridWidth = Math.ceil(canvasWidth / this.gridSize);
      const gridHeight = Math.ceil(canvasHeight / this.gridSize);
      this.spatialGrid = [];
      for (let i = 0; i < gridWidth; i++) {
        this.spatialGrid[i] = [];
        for (let j = 0; j < gridHeight; j++) {
          this.spatialGrid[i][j] = [];
        }
      }
      for (const entity of entities) {
        if (!entity.active) continue;
        const gridX = Math.floor(entity.x / this.gridSize);
        const gridY = Math.floor(entity.y / this.gridSize);
        if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
          this.spatialGrid[gridX][gridY].push(entity);
        }
      }
    }
    /**
     * Get nearby entities using spatial grid
     */
    getNearbyEntities(entity, radius = 100) {
      if (!this.spatialGrid || !this.enableSpatialPartitioning) {
        return [];
      }
      const results = /* @__PURE__ */ new Set();
      const gridRadius = Math.ceil(radius / this.gridSize);
      const gridX = Math.floor(entity.x / this.gridSize);
      const gridY = Math.floor(entity.y / this.gridSize);
      for (let dx = -gridRadius; dx <= gridRadius; dx++) {
        for (let dy = -gridRadius; dy <= gridRadius; dy++) {
          const checkX = gridX + dx;
          const checkY = gridY + dy;
          if (checkX >= 0 && checkX < this.spatialGrid.length && checkY >= 0 && checkY < this.spatialGrid[checkX].length) {
            for (const neighbor of this.spatialGrid[checkX][checkY]) {
              results.add(neighbor);
            }
          }
        }
      }
      return Array.from(results).filter((e) => e !== entity);
    }
    /**
     * Handle projectile movement
     */
    updateProjectile(projectile, deltaTime) {
      if (!projectile.active) return;
      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;
      if (projectile.drag) {
        projectile.vx *= projectile.drag;
        projectile.vy *= projectile.drag;
        if (projectile.lifetime > 0 && projectile.lifetime <= 0) {
          projectile.active = false;
        }
      }
    }
    /**
     * Simple collision response for entities
     */
    resolveCollision(entityA, entityB) {
      if (!this.checkCollision(entityA, entityB)) return;
      const dx = entityA.x - entityB.x;
      const dy = entityA.y - entityB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) return;
      const nx = dx / distance;
      const ny = dy / distance;
      const minDist = entityA.radius + entityB.radius;
      const penetration = minDist - distance;
      const pushA = nx * (penetration / 2 + 1);
      const pushB = -nx * (penetration / 2 + 1);
      entityA.x += pushA;
      entityB.x += pushB;
      const dotA = entityA.vx * nx + entityA.vy * ny;
      const dotB = entityB.vx * nx + entityB.vy * ny;
      if (dotA > 0) {
        entityA.vx -= dotA * 0.3;
        entityA.vy -= dotA * 0.3;
      }
      if (dotB < 0) {
        entityB.vx -= dotB * 0.3;
        entityB.vy -= dotB * 0.3;
      }
    }
    /**
     * Test if point is inside entity
     */
    isPointInEntity(x, y, entity) {
      const dx = x - entity.x;
      const dy = y - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < entity.radius;
    }
    /**
     * Get distance between two entities
     */
    getDistance(entityA, entityB) {
      const dx = entityA.x - entityB.x;
      const dy = entityA.y - entityB.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Calculate speed of entity
     */
    getSpeed(entity) {
      return Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
    }
    /**
     * Set maximum speed for entity
     */
    setMaxSpeed(entity, maxSpeed) {
      const speed = this.getSpeed(entity);
      if (speed > maxSpeed) {
        entity.vx = entity.vx / speed * maxSpeed;
        entity.vy = entity.vy / speed * maxSpeed;
      }
    }
    /**
     * Update method called each frame
     */
    update(deltaTime) {
    }
    /**
     * Dispose of physics engine resources
     */
    dispose() {
      this.spatialGrid = null;
    }
    /**
     * Get physics statistics for debugging
     */
    getStats() {
      return {
        gravity: this.gravity,
        friction: this.friction,
        separationForce: this.separationForce,
        maxSpeed: this.maxSpeed,
        enableSpatialPartitioning: this.enableSpatialPartitioning,
        hasSpatialGrid: this.spatialGrid !== null
      };
    }
  };

  // games/js/entities/EntityManager.js
  var EntityManager = class {
    constructor(configManager, physicsEngine) {
      this.config = configManager;
      this.physicsEngine = physicsEngine;
      this.units = [];
      this.enemies = [];
      this.projectiles = [];
      this.effects = [];
      this.nextUnitId = 1;
      this.nextEnemyId = 1;
      this.nextProjectileId = 1;
      this.nextEffectId = 1;
      this.canvasWidth = 800;
      this.canvasHeight = 600;
      this.totalEntities = 0;
      this.weaponSystem = null;
      this.gateSystem = null;
      this.spawningSystem = null;
      this.renderer = null;
    }
    /**
     * Set linked systems for interactions
     */
    setSystems(systems) {
      this.weaponSystem = systems.weaponSystem || null;
      this.gateSystem = systems.gateSystem || null;
      this.spawningSystem = systems.spawningSystem || null;
    }
    /**
     * Set reference to renderer for creating advanced effects
     */
    setRenderer(renderer) {
      this.renderer = renderer;
    }
    /**
     * Update all entities
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
      for (const unit of this.units.filter((u) => u.active)) {
        unit.update(deltaTime);
      }
      for (const enemy of this.enemies.filter((e) => e.active)) {
        enemy.update(deltaTime);
      }
      for (const projectile of this.projectiles.filter((p) => p.active)) {
        projectile.x += projectile.vx * deltaTime;
        projectile.y += projectile.vy * deltaTime;
        if (projectile.lifetime !== void 0) {
          projectile.lifetime -= deltaTime * 1e3;
          if (projectile.lifetime <= 0) {
            projectile.active = false;
          }
        }
        if (projectile.x < -30 || projectile.x > this.canvasWidth + 30 || projectile.y < -30 || projectile.y > this.canvasHeight + 30) {
          projectile.active = false;
        }
        if (this.gateSystem) {
          const gate = this.gateSystem.checkGateHit(projectile.x, projectile.y);
          if (gate) {
            projectile.active = false;
            if (gate.type === "add") {
            }
            this.addEffect({
              type: "impact",
              x: gate.x + gate.width / 2,
              y: gate.y + gate.height / 2,
              size: 20,
              active: true
            });
            break;
          }
        }
        for (const enemy of this.enemies.filter((e) => e.active)) {
          if (this.checkEntityCollision(projectile, enemy)) {
            if (enemy.takeDamage(projectile.damage || 10) || enemy.isShielded) {
              projectile.active = false;
              this.addEffect({
                type: "impact",
                x: enemy.x,
                y: enemy.y,
                size: 15,
                color: "#ff6b6b",
                active: true
              });
            }
            break;
          }
        }
      }
      for (const effect of this.effects.filter((e) => e.active)) {
        if (effect.lifetime !== void 0) {
          effect.lifetime -= deltaTime * 1e3;
          if (effect.lifetime <= 0) {
            effect.active = false;
          }
        }
      }
      this.cleanup();
    }
    /**
     * Check collision between two entities
     */
    checkEntityCollision(entityA, entityB) {
      const dx = entityA.x - entityB.x;
      const dy = entityA.y - entityB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = (entityA.radius || 10) + (entityB.radius || 10);
      return distance < minDist;
    }
    /**
     * Clean up inactive entities
     */
    cleanup() {
      this.units = this.units.filter((u) => u.active);
      this.enemies = this.enemies.filter((e) => e.active);
      this.projectiles = this.projectiles.filter((p) => p.active);
      this.effects = this.effects.filter((e) => e.active);
    }
    /**
     * Create a player unit
     */
    createUnit(type = "player", x = null, y = null) {
      const startX = x !== null ? x : this.canvasWidth / 2;
      const startY = y !== null ? y : this.canvasHeight * 0.85;
      const unitConfig = this.config.getConfig("units", type) || this.config.getConfig("units", "player");
      const unit = {
        id: this.nextUnitId++,
        type,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        radius: unitConfig.radius || 12,
        color: unitConfig.color || "#4a90e2",
        active: true,
        health: unitConfig.health || 1,
        maxHealth: unitConfig.health || 1,
        speed: unitConfig.speed || 120,
        isShielded: false,
        shieldTimer: 0,
        flashTimer: 0,
        rotation: 0,
        isMoving: false,
        targetX: null,
        targetY: null,
        update: function(dt) {
          if (!this.active) return;
          if (this.flashTimer > 0) {
            this.flashTimer -= dt * 1e3;
          }
          if (this.shieldTimer > 0) {
            this.shieldTimer -= dt * 1e3;
            if (this.shieldTimer <= 0) {
              this.shieldTimer = 0;
              this.isShielded = false;
            }
          }
          if (this.isMoving && this.targetX !== void 0 && this.targetY !== void 0) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 1) {
              this.vx = dx / dist * this.speed;
              this.vy = dy / dist * this.speed;
              this.x += this.vx * dt;
              this.y += this.vy * dt;
            } else {
              this.vx = 0;
              this.vy = 0;
              this.isMoving = false;
            }
          } else {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.x = Math.max(this.radius, Math.min(this.canvasWidth - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(this.canvasHeight - this.radius, this.y));
          }
          if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.rotation = Math.atan2(this.vy, this.vx);
          } else {
            if (this.rotation > 0) this.rotation -= dt * 2;
            if (this.rotation < 0) this.rotation += dt * 2;
          }
        },
        moveTo: function(x2, y2) {
          this.targetX = x2;
          this.targetY = y2;
          this.isMoving = true;
        },
        stop: function() {
          this.isMoving = false;
          this.targetX = void 0;
          this.targetY = void 0;
          this.vx = 0;
          this.vy = 0;
        },
        takeDamage: function(amount) {
          if (this.isShielded) {
            this.flashTimer = 300;
            if (this.renderer) {
              this.renderer.addParticleEffect(
                this.x + (Math.random() - 0.5) * this.radius,
                this.y + (Math.random() - 0.5) * this.radius,
                "#00ffff",
                2 + Math.random() * 2,
                200 + Math.random() * 200,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
              );
            }
            return false;
          }
          this.health -= amount;
          if (this.health <= 0) {
            this.active = false;
          }
          this.flashTimer = 300;
          if (this.renderer) {
            this.renderer.addParticleEffect(
              this.x + (Math.random() - 0.5) * this.radius,
              this.y + (Math.random() - 0.5) * this.radius,
              "#ff6b6b",
              3 + Math.random() * 2,
              300 + Math.random() * 300,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3
            );
          }
          return true;
        },
        activateShield: function(duration = 2e3) {
          this.isShielded = true;
          this.shieldTimer = duration;
          this.flashTimer = 100;
          if (this.renderer) {
            this.renderer.addParticleEffect(
              this.x,
              this.y,
              "#00ffff",
              5,
              400,
              0,
              -2
            );
          }
        },
        isAlive: function() {
          return this.health > 0 && this.active;
        },
        getRenderData: function() {
          return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            isShielded: this.isShielded,
            health: this.health,
            maxHealth: this.maxHealth,
            animationFrame: Date.now() * 0.1
            // Simple animation
          };
        },
        clone: function() {
          const clone = {
            ...this,
            id: this.nextUnitId++,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy
          };
          return clone;
        }
      };
      this.units.push(unit);
      this.totalEntities++;
      return unit;
    }
    /**
     * Create an enemy
     */
    createEnemy(type = "basic", x = null, y = null) {
      const startX = x !== null ? x : Math.random() * this.canvasWidth;
      const startY = y !== null ? y : -50;
      const enemyConfigs = this.config.getConfig("enemyUnits");
      const typeConfig = enemyConfigs[type] || enemyConfigs.basic;
      const enemy = {
        id: this.nextEnemyId++,
        type: `enemy_${type}`,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        radius: typeConfig.radius || 12,
        color: typeConfig.color || "#ff4444",
        active: true,
        health: typeConfig.health || 1,
        maxHealth: typeConfig.health || 1,
        speed: typeConfig.speed || 100,
        damage: typeConfig.damage || 1,
        scoreValue: typeConfig.scoreValue || 10,
        isShielded: typeConfig.shield || false,
        shieldTimer: 0,
        flashTimer: 0,
        rotation: 0,
        isRanged: typeConfig.range !== void 0,
        range: typeConfig.range || 0,
        fireRate: typeConfig.fireRate || 1e3,
        lastFireTime: 0,
        update: function(dt) {
          if (!this.active) return;
          if (this.flashTimer > 0) {
            this.flashTimer -= dt * 1e3;
          }
          if (this.shieldTimer > 0) {
            this.shieldTimer -= dt * 1e3;
            if (this.shieldTimer <= 0) {
              this.shieldTimer = 0;
              this.isShielded = false;
            }
          }
          const targetX = this.canvasWidth / 2;
          const targetY = this.canvasHeight * 0.85;
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            this.vx = dx / dist * this.speed;
            this.vy = dy / dist * this.speed;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
          } else {
            const angle = Date.now() * 1e-3 + this.x * 0.1;
            this.vx = Math.cos(angle) * 20;
            this.vy = Math.sin(angle) * 20;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
          }
          if (this.isRanged && this.lastFireTime > 0) {
            this.lastFireTime -= dt * 1e3;
          }
          if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.rotation = Math.atan2(this.vy, this.vx);
          } else {
            if (this.rotation > 0) this.rotation -= dt * 2;
            if (this.rotation < 0) this.rotation += dt * 2;
          }
        },
        canFire: function() {
          return this.isRanged && this.lastFireTime <= 0;
        },
        fire: function() {
          if (this.canFire()) {
            this.lastFireTime = this.fireRate;
            return true;
          }
          return false;
        },
        takeDamage: function(amount) {
          if (this.isShielded) {
            this.flashTimer = 300;
            if (this.renderer) {
              this.renderer.addParticleEffect(
                this.x + (Math.random() - 0.5) * this.radius,
                this.y + (Math.random() - 0.5) * this.radius,
                "#00ffff",
                2 + Math.random() * 2,
                200 + Math.random() * 200,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
              );
            }
            return false;
          }
          this.health -= amount;
          if (this.health <= 0) {
            this.active = false;
            if (this.renderer) {
              for (let i = 0; i < 8; i++) {
                const angle = i / 8 * Math.PI * 2;
                const speed = 2 + Math.random() * 3;
                this.renderer.addParticleEffect(
                  this.x + Math.cos(angle) * this.radius,
                  this.y + Math.sin(angle) * this.radius,
                  "#ff0000",
                  2 + Math.random() * 2,
                  400 + Math.random() * 200,
                  Math.cos(angle) * speed,
                  Math.sin(angle) * speed
                );
              }
              for (let i = 0; i < 3; i++) {
                const angle = i / 3 * Math.PI * 2;
                const speed = 1 + Math.random() * 2;
                this.renderer.addParticleEffect(
                  this.x + Math.cos(angle) * this.radius * 0.5,
                  this.y + Math.sin(angle) * this.radius * 0.5,
                  "#8b0000",
                  3 + Math.random() * 2,
                  500 + Math.random() * 300,
                  Math.cos(angle) * speed,
                  Math.sin(angle) * speed
                );
              }
            }
          } else {
            this.flashTimer = 300;
          }
          return true;
        },
        activateShield: function(duration = 2e3) {
          this.isShielded = true;
          this.shieldTimer = duration;
          this.flashTimer = 100;
          if (this.renderer) {
            this.renderer.addParticleEffect(
              this.x,
              this.y,
              "#00ffff",
              5,
              400,
              0,
              -2
            );
          }
        },
        isAlive: function() {
          return (this.health > 0 || this.isShielded) && this.active;
        },
        getRenderData: function() {
          return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color,
            isShielded: this.isShielded,
            health: this.health,
            maxHealth: this.maxHealth,
            type: this.type,
            isRanged: this.isRanged,
            animationFrame: Date.now() * 0.1
            // Simple animation
          };
        },
        clone: function() {
          const clone = {
            ...this,
            id: this.nextEnemyId++,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy
          };
          return clone;
        }
      };
      this.enemies.push(enemy);
      this.totalEntities++;
      return enemy;
    }
    /**
     * Create a projectile
     */
    createProjectile(projectileData) {
      const radius = projectileData.radius || 5;
      const projectile = {
        id: this.nextProjectileId++,
        type: projectileData.type || "bullet",
        x: projectileData.x,
        y: projectileData.y,
        vx: projectileData.vx || 0,
        vy: projectileData.vy || 0,
        radius,
        width: radius * 2,
        // For drawing
        color: projectileData.color || "#ffd700",
        damage: projectileData.damage || 10,
        lifetime: projectileData.lifetime || 1e3,
        active: true,
        glow: projectileData.glow || 6
        // For projectile glow effect
      };
      this.projectiles.push(projectile);
      this.totalEntities++;
      return projectile;
    }
    /**
     * Add a visual effect
     */
    addEffect(effectData) {
      const effect = {
        id: this.nextEffectId++,
        type: effectData.type || "generic",
        x: effectData.x,
        y: effectData.y,
        size: effectData.size || 10,
        color: effectData.color || "#ffffff",
        lifetime: effectData.lifetime || 500,
        active: true,
        vx: effectData.vx || 0,
        vy: effectData.vy || 0,
        alpha: effectData.alpha || 1
      };
      this.effects.push(effect);
      return effect;
    }
    /**
     * Get all active entities in the format expected by renderer
     */
    getAllEntities() {
      return {
        playerUnits: this.units.filter((u) => u.active),
        enemyUnits: this.enemies.filter((e) => e.active),
        projectiles: this.projectiles.filter((p) => p.active)
      };
    }
    /**
     * Get player units count
     */
    getPlayerUnitCount() {
      return this.units.filter((u) => u.active).length;
    }
    /**
     * Get enemy count
     */
    getEnemyCount() {
      return this.enemies.filter((e) => e.active).length;
    }
    /**
     * Get projectile count
     */
    getProjectileCount() {
      return this.projectiles.filter((p) => p.active).length;
    }
    /**
     * Get total entity count
     */
    getEntityCount() {
      return this.units.length + this.enemies.length + this.projectiles.length + this.effects.length;
    }
    /**
     * Set canvas dimensions
     */
    setCanvasSize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
      for (const unit of this.units) {
        unit.canvasWidth = width;
        unit.canvasHeight = height;
      }
      for (const enemy of this.enemies) {
        enemy.canvasWidth = width;
        enemy.canvasHeight = height;
      }
      for (const projectile of this.projectiles) {
        projectile.canvasWidth = width;
        projectile.canvasHeight = height;
      }
      for (const effect of this.effects) {
        effect.canvasWidth = width;
        effect.canvasHeight = height;
      }
    }
    /**
     * Get canvas width
     */
    getCanvasWidth() {
      return this.canvasWidth;
    }
    /**
     * Get canvas height
     */
    getCanvasHeight() {
      return this.canvasHeight;
    }
    /**
     * Reset the entity manager
     */
    reset() {
      this.units = [];
      this.enemies = [];
      this.projectiles = [];
      this.effects = [];
      this.nextUnitId = 1;
      this.nextEnemyId = 1;
      this.nextProjectileId = 1;
      this.nextEffectId = 1;
      this.totalEntities = 0;
    }
    /**
     * Clean up
     */
    dispose() {
      this.units = [];
      this.enemies = [];
      this.projectiles = [];
      this.effects = [];
    }
  };

  // games/js/gameplay/GateSystem.js
  var GateSystem = class {
    constructor(config) {
      this.config = config;
      this.gates = [];
      this.nextGateId = 1;
      this.gateTypes = this.getGateTypes();
      this.pulseEffects = [];
    }
    /**
     * Get gate type configurations
     */
    getGateTypes() {
      const gateConfig = this.config.getConfig("gates");
      return gateConfig || {
        add: { value: 5, color: "#00ff88", symbol: "+" },
        mult: { value: 2, color: "#00ffff", symbol: "\xD7" },
        sub: { value: 3, color: "#ff6b6b", symbol: "-" },
        speed: { value: 1.5, color: "#ffd700", symbol: "\u26A1" },
        split: { value: 2, color: "#ff00ff", symbol: "\u2195" },
        magnet: { value: 100, color: "#8a2be2", symbol: "\u{1F9F2}" },
        shield: { value: 5, color: "#ffffff", symbol: "\u{1F6E1}\uFE0F" },
        random: { value: 0, color: "#ff8c00", symbol: "?" },
        risk_reward: { value: 0, color: "#8b0000", symbol: "\u26A0\uFE0F" }
      };
    }
    /**
     * Create a new gate
     */
    createGate(type, x, y, valueOverride = null) {
      const gateType = this.gateTypes[type] || this.gateTypes.add;
      const value = valueOverride !== null ? valueOverride : gateType.value;
      const gate = {
        id: this.nextGateId++,
        type,
        value,
        x,
        y,
        width: this.config.getConfig("game", "gateSize") || 60,
        height: this.config.getConfig("game", "gateSize") || 60,
        color: gateType.color,
        symbol: gateType.symbol,
        active: true,
        pulseTimer: 0,
        maxPulseTime: 2e3,
        // 2 second pulse cycle
        hitCooldown: 0
        // Prevent multiple hits in quick succession
      };
      this.gates.push(gate);
      return gate;
    }
    /**
     * Remove a gate
     */
    removeGate(gateId) {
      const index = this.gates.findIndex((g) => g.id === gateId);
      if (index !== -1) {
        this.gates.splice(index, 1);
        return true;
      }
      return false;
    }
    /**
     * Get all active gates
     */
    getAllGates() {
      return this.gates.filter((gate) => gate.active);
    }
    /**
     * Check if a position hits a gate
     */
    checkGateHit(x, y) {
      for (const gate of this.gates) {
        if (!gate.active) continue;
        if (gate.hitCooldown > 0) continue;
        const dx = x - (gate.x + gate.width / 2);
        const dy = y - (gate.y + gate.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < gate.width / 2) {
          gate.hitCooldown = 300;
          return gate;
        }
      }
      return null;
    }
    /**
     * Apply gate effect to crowd count
     */
    applyGateEffect(gate, currentCount) {
      if (!gate || !gate.active) return currentCount;
      let newCount = currentCount;
      switch (gate.type) {
        case "add":
          newCount = Math.min(
            this.config.getConfig("game", "maxCrowdSize") || 500,
            currentCount + gate.value
          );
          break;
        case "mult":
          newCount = Math.min(
            this.config.getConfig("game", "maxCrowdSize") || 500,
            Math.floor(currentCount * gate.value)
          );
          break;
        case "sub":
          newCount = Math.max(0, currentCount - gate.value);
          break;
        case "speed":
          newCount = currentCount;
          break;
        case "split":
          newCount = Math.min(
            this.config.getConfig("game", "maxCrowdSize") || 500,
            currentCount * 2
          );
          break;
        case "magnet":
          newCount = currentCount;
          break;
        case "shield":
          newCount = currentCount;
          break;
        case "random":
          const randomType = Math.random();
          if (randomType < 0.3) {
            newCount = Math.max(0, currentCount - Math.floor(gate.value * 2));
          } else if (randomType < 0.6) {
            newCount = Math.min(
              this.config.getConfig("game", "maxCrowdSize") || 500,
              currentCount + Math.floor(gate.value / 2)
            );
          } else {
            if (Math.random() < 0.5) {
              newCount = Math.min(
                this.config.getConfig("game", "maxCrowdSize") || 500,
                currentCount * gate.value
              );
            } else {
              newCount = Math.min(
                this.config.getConfig("game", "maxCrowdSize") || 500,
                currentCount * 3
              );
            }
          }
          break;
        case "risk_reward":
          if (Math.random() < 0.4) {
            newCount = Math.max(0, currentCount - Math.floor(gate.value * 3));
          } else {
            newCount = Math.min(
              this.config.getConfig("game", "maxCrowdSize") || 500,
              Math.floor(currentCount * (gate.value * 4))
            );
          }
          break;
        default:
          newCount = currentCount;
          break;
      }
      return newCount;
    }
    /**
     * Update gate system (called each frame)
     */
    update(deltaTime) {
      for (const gate of this.gates) {
        if (gate.hitCooldown > 0) {
          gate.hitCooldown -= deltaTime * 1e3;
          if (gate.hitCooldown < 0) gate.hitCooldown = 0;
        }
        gate.pulseTimer += deltaTime * 1e3;
        if (gate.pulseTimer >= gate.maxPulseTime) {
          gate.pulseTimer = 0;
        }
      }
      this.spawnRandomGate(deltaTime);
      this.gates = this.gates.filter((gate) => gate.active);
    }
    /**
     * Spawn a random gate occasionally
     */
    spawnRandomGate(deltaTime) {
      const spawnChance = this.config.getConfig("game", "gateSpawnChance") || 2e-3;
      if (Math.random() < spawnChance) {
        const gateTypes = Object.keys(this.gateTypes);
        const randomType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
        const gateConfig = this.gateTypes[randomType];
        let value = gateConfig.value;
        if (gateConfig.value instanceof Array) {
          value = gateConfig.value[0] + Math.random() * (gateConfig.value[1] - gateConfig.value[0]);
        } else if (typeof gateConfig.value === "number") {
          const variation = 0.2;
          value = gateConfig.value * (1 - variation + Math.random() * (2 * variation));
        }
        const canvasWidth = this.config.getConfig("game", "canvasWidth") || 800;
        const canvasHeight = this.config.getConfig("game", "canvasHeight") || 600;
        const margin = 50;
        const x = margin + Math.random() * (canvasWidth - 2 * margin);
        const y = margin + Math.random() * (canvasHeight - 2 * margin);
        this.createGate(randomType, x, y, value);
      }
    }
    /**
     * Clear all gates
     */
    clearAll() {
      this.gates = [];
      this.nextGateId = 1;
    }
    /**
     * Add visual pulse effect when gate is hit
     */
    addPulseEffect(x, y, color, size) {
      this.pulseEffects.push({
        x,
        y,
        color,
        size,
        life: 1e3,
        // 1 second
        maxLife: 1e3,
        active: true
      });
    }
    /**
     * Update visual effects
     */
    updateEffects(deltaTime) {
      for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
        const effect = this.pulseEffects[i];
        if (!effect.active) continue;
        effect.life -= deltaTime * 1e3;
        if (effect.life <= 0) {
          effect.active = false;
          if (Math.random() < 0.2) {
            this.pulseEffects.splice(i, 1);
          }
        }
      }
    }
    /**
     * Get gate statistics for debugging
     */
    getStats() {
      return {
        totalGates: this.gates.length,
        activeGates: this.gates.filter((g) => g.active).length,
        nextGateId: this.nextGateId,
        gateTypes: Object.keys(this.gateTypes)
      };
    }
    /**
     * Dispose of gate system resources
     */
    dispose() {
      this.gates = [];
      this.pulseEffects = [];
    }
  };

  // games/js/gameplay/SpawningSystem.js
  var SpawningSystem = class {
    constructor(config, entityManager) {
      this.config = config;
      this.entityManager = entityManager;
      this.spawnPoints = [];
      this.enemySpawnPoints = [];
      this.playerSpawnPoint = null;
      this.lastEnemySpawn = 0;
      this.enemySpawnInterval = this.config.getConfig("game", "waveIntervalBase") || 5e3;
      this.baseEnemySpawnRate = this.config.getConfig("levels", "enemySpawnRateBase") || 0.02;
      this.enemySpawnRateIncrease = this.config.getConfig("levels", "enemySpawnRateIncrease") || 1e-3;
      this.currentWave = 0;
      this.unitsInWave = 0;
      this.maxUnitsPerWave = 0;
      this.waveActive = false;
      this.waveTimer = 0;
      this.burstQueue = [];
      this.specialSpawnChance = 0.05;
      this.initSpawnPoints();
    }
    /**
     * Initialize spawn points based on level configuration
     */
    initSpawnPoints() {
      const canvasWidth = this.config.getConfig("game", "canvasWidth") || 800;
      const canvasHeight = this.config.getConfig("game", "canvasHeight") || 600;
      this.playerSpawnPoint = {
        x: canvasWidth / 2,
        y: canvasHeight * 0.85,
        radius: 20
      };
      this.enemySpawnPoints = [
        // Top center
        { x: canvasWidth / 2, y: -50, radius: 30 },
        // Top left
        { x: -50, y: canvasHeight / 4, radius: 30 },
        // Top right
        { x: canvasWidth + 50, y: canvasHeight / 4, radius: 30 },
        // Left center
        { x: -50, y: canvasHeight / 2, radius: 30 },
        // Right center
        { x: canvasWidth + 50, y: canvasHeight / 2, radius: 30 }
      ];
      this.spawnPoints = [
        { x: canvasWidth / 2, y: canvasHeight / 2, radius: 50 },
        // Center
        { x: canvasWidth / 4, y: canvasHeight / 3, radius: 30 },
        // Left
        { x: 3 * canvasWidth / 4, y: canvasHeight / 3, radius: 30 },
        // Right
        { x: canvasWidth / 2, y: 2 * canvasHeight / 3, radius: 30 }
        // Bottom center
      ];
    }
    /**
     * Spawn initial player units (starting crowd)
     */
    spawnInitialUnits(count = null) {
      const spawnCount = count || this.config.getConfig("game", "startingCrowd") || 15;
      const unitTypes = ["player", "fast", "shield"];
      for (let i = 0; i < spawnCount; i++) {
        const typeIndex = i % unitTypes.length;
        const type = unitTypes[typeIndex];
        const spawnX = this.playerSpawnPoint.x + (Math.random() - 0.5) * 40;
        const spawnY = this.playerSpawnPoint.y + (Math.random() - 0.5) * 20;
        const unit = this.entityManager.createUnit(type, spawnX, spawnY);
        this.entityManager.addPlayerUnit(unit);
      }
    }
    /**
     * Spawn a wave of enemies
     */
    spawnEnemyWave(waveNumber, levelDifficulty = 1) {
      this.currentWave = waveNumber;
      this.waveActive = true;
      const baseUnits = 5 + Math.floor(waveNumber * 0.5);
      const difficultyMultiplier = 1 + (levelDifficulty - 1) * 0.3;
      this.maxUnitsPerWave = Math.floor(baseUnits * difficultyMultiplier);
      this.unitsInWave = 0;
      const waveIntervalReduction = Math.min(
        this.config.getConfig("levels", "waveIntervalReductionPerLevel") || 100,
        waveNumber * 10
      );
      this.enemySpawnInterval = Math.max(
        this.config.getConfig("game", "minWaveInterval") || 1500,
        this.config.getConfig("game", "waveIntervalBase") || 5e3 - waveIntervalReduction
      );
      this.lastEnemySpawn = Date.now();
    }
    /**
     * Update spawning system (called each frame)
     */
    update(deltaTime) {
      const now = Date.now();
      if (this.waveActive) {
        const timeSinceLastSpawn = now - this.lastEnemySpawn;
        const adjustedSpawnRate = this.getAdjustedSpawnRate();
        if (timeSinceLastSpawn > 1e3 / adjustedSpawnRate && this.unitsInWave < this.maxUnitsPerWave) {
          this.spawnEnemy();
          this.lastEnemySpawn = now;
          this.unitsInWave++;
        }
        if (this.unitsInWave >= this.maxUnitsPerWave) {
          if (timeSinceLastSpawn > 2e3) {
            this.waveActive = false;
          }
        }
      }
      this.processBurstQueue(deltaTime);
    }
    /**
     * Get adjusted spawn rate based on level and wave difficulty
     */
    getAdjustedSpawnRate() {
      let rate = this.baseEnemySpawnRate;
      rate += this.currentWave * this.enemySpawnRateIncrease;
      const levelDifficulty = 1;
      rate *= levelDifficulty;
      const maxRate = this.config.getConfig("game", "maxEnemySpawnRate") || 0.1;
      return Math.min(rate, maxRate);
    }
    /**
     * Spawn a single enemy
     */
    spawnEnemy() {
      const spawnPoint = this.enemySpawnPoints[Math.floor(Math.random() * this.enemySpawnPoints.length)];
      const spawnX = spawnPoint.x + (Math.random() - 0.5) * spawnPoint.radius * 2;
      const spawnY = spawnPoint.y + (Math.random() - 0.5) * spawnPoint.radius * 2;
      const enemyType = this.determineEnemyType();
      const enemy = this.entityManager.createEnemy(enemyType, spawnX, spawnY);
      this.entityManager.addEnemyUnit(enemy);
      return enemy;
    }
    /**
     * Determine enemy type based on wave number and random chance
     */
    determineEnemyType() {
      const wave = this.currentWave;
      const rand = Math.random();
      if (wave < 3) {
        if (rand < 0.8) return "basic";
        if (rand < 0.95) return "fast";
        return "shield";
      } else if (wave < 8) {
        if (rand < 0.5) return "basic";
        if (rand < 0.7) return "fast";
        if (rand < 0.85) return "shield";
        if (rand < 0.95) return "heavy";
        return "fastEnemy";
      } else {
        if (rand < 0.3) return "basic";
        if (rand < 0.5) return "fast";
        if (rand < 0.65) return "shield";
        if (rand < 0.8) return "heavy";
        if (rand < 0.9) return "fastEnemy";
        if (rand < 0.95) return "ranged";
        return "heavy";
      }
    }
    /**
     * Spawn a burst of units (for power-ups or special effects)
     */
    spawnBurst(count, type = "player", x = null, y = null) {
      for (let i = 0; i < count; i++) {
        const spawnX = x !== null ? x : (this.playerSpawnPoint ? this.playerSpawnPoint.x : 400) + (Math.random() - 0.5) * 100;
        const spawnY = y !== null ? y : (this.playerSpawnPoint ? this.playerSpawnPoint.y : 300) + (Math.random() - 0.5) * 100;
        const unit = this.entityManager.createUnit(type, spawnX, spawnY);
        if (type.startsWith("enemy") || type.includes("Enemy")) {
          this.entityManager.addEnemyUnit(unit);
        } else {
          this.entityManager.addPlayerUnit(unit);
        }
      }
    }
    /**
     * Spawn special units (power-ups, bosses, etc.)
     */
    spawnSpecialUnit(x = null, y = null) {
      if (Math.random() > this.specialSpawnChance) return null;
      const specialTypes = ["heavy", "shield", "fastEnemy", "ranged"];
      const type = specialTypes[Math.floor(Math.random() * specialTypes.length)];
      const spawnX = x !== null ? x : (this.playerSpawnPoint ? this.playerSpawnPoint.x : 400) + (Math.random() - 0.5) * 200;
      const spawnY = y !== null ? y : (this.playerSpawnPoint ? this.playerSpawnPoint.y : 300) + (Math.random() - 0.5) * 200;
      const unit = this.entityManager.createUnit(type, spawnX, spawnY);
      if (type.startsWith("enemy") || type.includes("Enemy")) {
        this.entityManager.addEnemyUnit(unit);
      } else {
        this.entityManager.addPlayerUnit(unit);
      }
      return unit;
    }
    /**
     * Add to burst queue (for delayed spawning)
     */
    addToBurstQueue(count, type, delay = 0, x = null, y = null) {
      this.burstQueue.push({
        count,
        type,
        delay,
        timer: delay,
        x,
        y,
        timestamp: Date.now()
      });
    }
    /**
     * Process burst queue
     */
    processBurstQueue(deltaTime) {
      for (let i = this.burstQueue.length - 1; i >= 0; i--) {
        const burst = this.burstQueue[i];
        if (!burst) continue;
        burst.timer -= deltaTime * 1e3;
        if (burst.timer <= 0) {
          this.spawnBurst(burst.count, burst.type, null, burst.x, burst.y);
          this.burstQueue.splice(i, 1);
        }
      }
    }
    /**
     * Get current wave information
     */
    getCurrentWave() {
      return this.currentWave;
    }
    /**
     * Check if wave is active
     */
    isWaveActive() {
      return this.waveActive;
    }
    /**
     * Get units spawned in current wave
     */
    getUnitsInWave() {
      return this.unitsInWave;
    }
    /**
     * Get maximum units for current wave
     */
    getMaxUnitsPerWave() {
      return this.maxUnitsPerWave;
    }
    /**
     * Reset spawning system (for new level)
     */
    reset() {
      this.waveActive = false;
      this.waveTimer = 0;
      this.currentWave = 0;
      this.unitsInWave = 0;
      this.maxUnitsPerWave = 0;
      this.lastEnemySpawn = 0;
      this.enemySpawnInterval = this.config.getConfig("game", "waveIntervalBase") || 5e3;
      this.burstQueue = [];
    }
    /**
     * Clear all spawned entities
     */
    clearAll() {
      this.reset();
    }
    /**
     * Get spawning statistics for debugging
     */
    getStats() {
      return {
        currentWave: this.currentWave,
        waveActive: this.waveActive,
        unitsInWave: this.unitsInWave,
        maxUnitsPerWave: this.maxUnitsPerWave,
        enemySpawnInterval: this.enemySpawnInterval,
        burstQueueLength: this.burstQueue.length,
        lastSpawn: Date.now() - this.lastEnemySpawn
      };
    }
    /**
     * Dispose of spawning system resources
     */
    dispose() {
      this.spawnPoints = [];
      this.enemySpawnPoints = [];
      this.playerSpawnPoint = null;
      this.burstQueue = [];
    }
  };

  // games/js/gameplay/WeaponSystem.js
  var WeaponSystem = class {
    constructor(config, entityManager, physicsEngine) {
      this.config = config;
      this.entityManager = entityManager;
      this.physicsEngine = physicsEngine;
      this.weaponTypes = this.getWeaponTypes();
      this.activeWeapons = /* @__PURE__ */ new Map();
      this.weaponCooldowns = /* @__PURE__ */ new Map();
      this.weaponEffects = [];
      this.energySystem = {
        maxEnergy: 100,
        currentEnergy: 100,
        energyRegenRate: 10,
        // per second
        lastRegenTime: Date.now()
      };
    }
    /**
     * Get weapon type configurations
     */
    getWeaponTypes() {
      const weaponConfig = this.config.getConfig("weapons");
      return weaponConfig || {
        pulseCannon: {
          damage: 25,
          cooldown: 800,
          range: 300,
          area: 20,
          energyCost: 10,
          color: "#ff6b6b",
          particles: 5
        },
        gravityBurst: {
          damage: 15,
          cooldown: 1200,
          range: 200,
          area: 80,
          energyCost: 15,
          color: "#9370db",
          particles: 8
        },
        plasmaArc: {
          damage: 20,
          cooldown: 1e3,
          range: 250,
          area: 15,
          energyCost: 12,
          color: "#00ffff",
          particles: 3
        },
        shockwave: {
          damage: 10,
          cooldown: 1500,
          range: 100,
          area: 100,
          energyCost: 20,
          color: "#ffa500",
          particles: 12
        },
        energyBeam: {
          damage: 8,
          cooldown: 600,
          range: 400,
          area: 10,
          energyCost: 5,
          color: "#ffff00",
          particles: 3,
          beamWidth: 4
        },
        meteorDrop: {
          damage: 40,
          cooldown: 2e3,
          range: 500,
          area: 60,
          energyCost: 25,
          color: "#8b4513",
          particles: 15,
          dropDelay: 300
        }
      };
    }
    /**
     * Fire a weapon
     * @param {string} weaponType - Type of weapon to fire
     * @param {number} playerId - ID of player firing
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @returns {boolean} - True if weapon fired successfully
     */
    fireWeapon(weaponType, playerId, targetX, targetY) {
      const weaponConfig = this.weaponTypes[weaponType];
      if (!weaponConfig) {
        console.warn(`Unknown weapon type: ${weaponType}`);
        return false;
      }
      const cooldownKey = `${playerId}-${weaponType}`;
      const currentTime = Date.now();
      if (this.weaponCooldowns.has(cooldownKey)) {
        const lastFired = this.weaponCooldowns.get(cooldownKey);
        if (currentTime - lastFired < weaponConfig.cooldown) {
          return false;
        }
      }
      if (!this.hasSufficientEnergy(weaponConfig.energyCost)) {
        return false;
      }
      this.consumeEnergy(weaponConfig.energyCost);
      this.weaponCooldowns.set(cooldownKey, currentTime);
      const effect = this.createWeaponEffect(weaponType, targetX, targetY, weaponConfig);
      if (effect) {
        this.weaponEffects.push(effect);
      }
      this.applyWeaponEffect(weaponType, targetX, targetY, weaponConfig);
      return true;
    }
    /**
     * Check if player has sufficient energy for weapon
     */
    hasSufficientEnergy(cost) {
      this.regenerateEnergy();
      return this.energySystem.currentEnergy >= cost;
    }
    /**
     * Consume energy for weapon firing
     */
    consumeEnergy(amount) {
      this.energySystem.currentEnergy = Math.max(0, this.energySystem.currentEnergy - amount);
    }
    /**
     * Regenerate energy over time
     */
    regenerateEnergy() {
      const now = Date.now();
      const elapsed = (now - this.energySystem.lastRegenTime) / 1e3;
      if (elapsed >= 0.1) {
        const regenAmount = this.energySystem.energyRegenRate * elapsed;
        this.energySystem.currentEnergy = Math.min(
          this.energySystem.maxEnergy,
          this.energySystem.currentEnergy + regenAmount
        );
        this.energySystem.lastRegenTime = now;
      }
    }
    /**
     * Create weapon effect based on type
     */
    createWeaponEffect(weaponType, targetX, targetY, config) {
      const baseEffect = {
        x: targetX,
        y: targetY,
        weaponType,
        color: config.color,
        life: 1e3,
        // 1 second default
        maxLife: 1e3,
        active: true
      };
      switch (weaponType) {
        case "pulseCannon":
          return {
            ...baseEffect,
            type: "pulse",
            radius: config.area,
            particles: config.particles
          };
        case "gravityBurst":
          return {
            ...baseEffect,
            type: "wave",
            radius: config.area,
            intensity: config.damage
          };
        case "plasmaArc":
          return {
            ...baseEffect,
            type: "beam",
            startX: this.entityManager ? this.entityManager.getPlayerSpawnPoint().x : 400,
            startY: this.entityManager ? this.entityManager.getPlayerSpawnPoint().y : 300,
            endX: targetX,
            endY: targetY,
            width: config.area
          };
        case "shockwave":
          return {
            ...baseEffect,
            type: "wave",
            radius: config.area,
            intensity: config.damage * 2
          };
        case "energyBeam":
          return {
            ...baseEffect,
            type: "beam",
            startX: this.entityManager ? this.entityManager.getPlayerSpawnPoint().x : 400,
            startY: this.entityManager ? this.entityManager.getPlayerSpawnPoint().y : 300,
            endX: targetX,
            endY: targetY,
            width: config.beamWidth || 4
          };
        case "meteorDrop":
          return {
            ...baseEffect,
            type: "meteor",
            startX: targetX,
            startY: targetY - 200,
            // Start above target
            endX: targetX,
            endY: targetY,
            delay: config.dropDelay,
            radius: config.area
          };
        default:
          return {
            ...baseEffect,
            type: "generic",
            radius: config.area
          };
      }
    }
    /**
     * Apply weapon effect to entities in area
     */
    applyWeaponEffect(weaponType, targetX, targetY, config) {
      const entitiesInRange = this.getEntitiesInRange(targetX, targetY, config.range);
      switch (weaponType) {
        case "pulseCannon":
          this.applyDamageToEntities(entitiesInRange, config.damage, config.area);
          this.applyKnockbackToEntities(entitiesInRange, targetX, targetY, 100);
          break;
        case "gravityBurst":
          this.applyDamageToEntities(entitiesInRange, config.damage, config.area);
          this.applyPullToEntities(entitiesInRange, targetX, targetY, config.area, 150);
          break;
        case "plasmaArc":
          this.applyBeamDamage(targetX, targetY, config);
          break;
        case "shockwave":
          this.applyDamageToEntities(entitiesInRange, config.damage, config.area);
          this.applyKnockbackToEntities(entitiesInRange, targetX, targetY, config.area * 2, 200);
          break;
        case "energyBeam":
          this.applyBeamDamage(targetX, targetY, config);
          break;
        case "meteorDrop":
          setTimeout(() => {
            this.applyDamageToEntities(
              this.getEntitiesInRange(targetX, targetY, config.area),
              config.damage,
              config.area
            );
          }, config.dropDelay);
          break;
        default:
          this.applyDamageToEntities(entitiesInRange, config.damage || 10, config.area || 50);
          break;
      }
    }
    /**
     * Get entities within range of a point
     */
    getEntitiesInRange(x, y, range) {
      const entitiesInRange = [];
      const playerUnits = this.entityManager.getPlayerUnits();
      for (const unit of playerUnits) {
        const distance = this.physicsEngine.getDistance(
          { x: unit.x, y: unit.y, radius: unit.radius },
          { x, y, radius: 0 }
        );
        if (distance < range + unit.radius) {
          entitiesInRange.push({ entity: unit, type: "player", distance });
        }
      }
      const enemyUnits = this.entityManager.getEnemyUnits();
      for (const unit of enemyUnits) {
        const distance = this.physicsEngine.getDistance(
          { x: unit.x, y: unit.y, radius: unit.radius },
          { x, y, radius: 0 }
        );
        if (distance < range + unit.radius) {
          entitiesInRange.push({ entity: unit, type: "enemy", distance });
        }
      }
      return entitiesInRange;
    }
    /**
     * Apply damage to entities in range
     */
    applyDamageToEntities(entitiesInRange, damage, range) {
      for (const { entity, type, distance } of entitiesInRange) {
        const distanceFactor = 1 - Math.min(distance / range, 1);
        const finalDamage = damage * (0.5 + distanceFactor * 0.5);
        if (type === "enemy") {
          const wasDamaged = entity.takeDamage(finalDamage);
          if (wasDamaged && !entity.isAlive()) {
          }
        }
      }
    }
    /**
     * Apply knockback to entities from a point
     */
    applyKnockbackToEntities(entitiesInRange, sourceX, sourceY, range, force) {
      for (const { entity, type } of entitiesInRange) {
        if (type === "enemy") {
          this.physicsEngine.applyKnockback(entity, sourceX, sourceY, force);
        }
      }
    }
    /**
     * Apply pull force to entities toward a point
     */
    applyPullToEntities(entitiesInRange, targetX, targetY, range, force) {
      for (const { entity, type } of entitiesInRange) {
        if (type === "enemy") {
          this.physicsEngine.applyForce(
            entity,
            (targetX - entity.x) * force * 0.01,
            (targetY - entity.y) * force * 0.01
          );
        }
      }
    }
    /**
     * Apply beam damage (line-based)
     */
    applyBeamDamage(startX, startY, config) {
      const beamWidth = config.area * 2;
      const playerUnits = this.entityManager.getPlayerUnits();
      const enemyUnits = this.entityManager.getEnemyUnits();
      for (const unit of playerUnits) {
      }
      for (const unit of enemyUnits) {
        const dx = unit.x - startX;
        const dy = unit.y - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < beamWidth) {
          const distanceFactor = 1 - Math.min(distance / beamWidth, 1);
          const finalDamage = config.damage * (0.7 + distanceFactor * 0.3);
          unit.takeDamage(finalDamage);
        }
      }
    }
    /**
     * Update weapon system (called each frame)
     */
    update(deltaTime) {
      for (const [key, timestamp] of this.weaponCooldowns.entries()) {
        const age = Date.now() - timestamp;
        if (age > 1e4) {
          this.weaponCooldowns.delete(key);
        }
      }
      this.updateWeaponEffects(deltaTime);
      this.regenerateEnergy();
    }
    /**
     * Update weapon effects (particles, visual effects, etc.)
     */
    updateWeaponEffects(deltaTime) {
      for (let i = this.weaponEffects.length - 1; i >= 0; i--) {
        const effect = this.weaponEffects[i];
        if (!effect.active) continue;
        effect.life -= deltaTime * 1e3;
        if (effect.life <= 0) {
          effect.active = false;
          if (Math.random() < 0.2) {
            this.weaponEffects.splice(i, 1);
          }
        }
      }
    }
    /**
     * Get current energy level
     */
    getEnergy() {
      return {
        current: this.energySystem.currentEnergy,
        max: this.energySystem.maxEnergy,
        percentage: this.energySystem.currentEnergy / this.energySystem.maxEnergy
      };
    }
    /**
     * Get weapon statistics for debugging
     */
    getStats() {
      return {
        weaponTypes: Object.keys(this.weaponTypes),
        activeCooldowns: this.weaponCooldowns.size,
        energy: this.getEnergy(),
        activeEffects: this.weaponEffects.filter((e) => e.active).length
      };
    }
    /**
     * Dispose of weapon system resources
     */
    dispose() {
      this.weaponCooldowns.clear();
      this.weaponEffects = [];
      this.activeWeapons.clear();
    }
  };

  // games/js/levels/LevelManager.js
  var LevelManager = class {
    constructor(config) {
      this.config = config;
      this.currentLevel = 1;
      this.currentWave = 0;
      this.totalWavesPerLevel = this.config.getConfig("levels", "wavesPerLevel") || 3;
      this.wavesCompleted = 0;
      this.levelData = {};
      this.waveData = {};
      this.levelStartTime = 0;
      this.levelElapsedTime = 0;
      this.unlockedLevels = /* @__PURE__ */ new Set([1]);
      this.loadLevelConfigurations();
    }
    /**
     * Load level configurations (could be from external files)
     */
    loadLevelConfigurations() {
      this.levelTemplates = this.generateLevelTemplates();
    }
    /**
     * Generate level templates for procedural generation
     */
    generateLevelTemplates() {
      const templates = {};
      for (let level = 1; level <= 50; level++) {
        templates[level] = this.generateLevelTemplate(level);
      }
      return templates;
    }
    /**
     * Generate a level template based on level number
     */
    generateLevelTemplate(levelNumber) {
      const difficultyMultiplier = 1 + (levelNumber - 1) * 0.15;
      const world = Math.floor((levelNumber - 1) / 10);
      const worldDifficulty = 1 + world * 0.5;
      return {
        level: levelNumber,
        world: world + 1,
        difficulty: difficultyMultiplier * worldDifficulty,
        goalMultiplier: this.config.getConfig("game", "levelGoalMultiplier") || 10,
        gatesPerLevel: {
          min: Math.floor(this.config.getConfig("levels", "gatesPerLevel", "min") || 4),
          max: Math.floor(this.config.getConfig("levels", "gatesPerLevel", "max") || 8)
        },
        enemySpawnRate: this.config.getConfig("levels", "enemySpawnRateBase") || 0.02,
        enemyTypes: this.getEnemyTypesForLevel(levelNumber),
        specialRules: this.getSpecialRulesForLevel(levelNumber),
        backgroundTheme: this.getBackgroundThemeForLevel(levelNumber),
        musicTrack: this.getMusicTrackForLevel(levelNumber)
      };
    }
    /**
     * Get enemy types available for a specific level
     */
    getEnemyTypesForLevel(levelNumber) {
      const baseTypes = ["basic"];
      if (levelNumber >= 3) baseTypes.push("fast");
      if (levelNumber >= 5) baseTypes.push("shield");
      if (levelNumber >= 8) baseTypes.push("heavy");
      if (levelNumber >= 12) baseTypes.push("fastEnemy");
      if (levelNumber >= 15) baseTypes.push("ranged");
      return baseTypes;
    }
    /**
     * Get special rules for a specific level
     */
    getSpecialRulesForLevel(levelNumber) {
      const rules = [];
      if (levelNumber % 5 === 0) {
        rules.push("double_gates");
      }
      if (levelNumber % 7 === 0) {
        rules.push("fast_enemies");
      }
      if (levelNumber >= 20 && levelNumber % 10 === 0) {
        rules.push("boss_level");
      }
      if (levelNumber >= 30) {
        rules.push("mixed_paths");
      }
      return rules;
    }
    /**
     * Get background theme for a specific level
     */
    getBackgroundThemeForLevel(levelNumber) {
      const themes = ["space", "forest", "desert", "ice", "cyber", "magic", "ruins", "ocean"];
      const themeIndex = Math.floor((levelNumber - 1) / 5) % themes.length;
      return themes[themeIndex];
    }
    /**
     * Get music track for a specific level
     */
    getMusicTrackForLevel(levelNumber) {
      const tracks = ["track1", "track2", "track3", "track4", "track5"];
      const trackIndex = (levelNumber - 1) % tracks.length;
      return tracks[trackIndex];
    }
    /**
     * Start a new level
     */
    startLevel(levelNumber) {
      if (!this.isLevelUnlocked(levelNumber)) {
        console.warn(`Level ${levelNumber} is not unlocked`);
        return false;
      }
      this.currentLevel = levelNumber;
      this.currentWave = 0;
      this.wavesCompleted = 0;
      this.levelStartTime = Date.now();
      this.levelElapsedTime = 0;
      this.levelData = this.getLevelData(levelNumber);
      this.waveData = {};
      return true;
    }
    /**
     * Get data for the current level
     */
    getLevelData(levelNumber = null) {
      const level = levelNumber !== null ? levelNumber : this.currentLevel;
      return this.levelTemplates[level] || this.generateLevelTemplate(level);
    }
    /**
     * Get current level number
     */
    getCurrentLevel() {
      return this.currentLevel;
    }
    /**
     * Get current wave number
     */
    getCurrentWave() {
      return this.currentWave;
    }
    /**
     * Get goal for current level (crowd size needed to win)
     */
    getCurrentLevelGoal() {
      const levelData = this.getLevelData();
      const baseGoal = this.config.getConfig("game", "startingCrowd") || 15;
      const goalMultiplier = levelData.goalMultiplier || 10;
      const difficulty = levelData.difficulty || 1;
      return Math.floor(baseGoal * goalMultiplier * difficulty);
    }
    /**
     * Complete current wave
     */
    completeWave() {
      this.wavesCompleted++;
      this.currentWave++;
      if (this.wavesCompleted >= this.totalWavesPerLevel) {
        return this.completeLevel();
      }
      this.prepareNextWave();
      return false;
    }
    /**
     * Prepare for next wave
     */
    prepareNextWave() {
      this.waveData = {
        waveNumber: this.currentWave,
        difficultyModifier: 1 + (this.currentWave - 1) * 0.1,
        // 10% increase per wave
        enemySpawnRateIncrease: (this.currentWave - 1) * 5e-3,
        gateCountModifier: 1 + (this.currentWave - 1) * 0.05
      };
    }
    /**
     * Complete the current level
     */
    completeLevel() {
      this.levelElapsedTime = Date.now() - this.levelStartTime;
      const nextLevel = this.currentLevel + 1;
      this.unlockLevel(nextLevel);
      const rewards = this.calculateLevelRewards();
      this.wavesCompleted = 0;
      this.currentWave = 0;
      return {
        completed: true,
        level: this.currentLevel,
        time: this.levelElapsedTime,
        rewards
      };
    }
    /**
     * Fail the current level
     */
    failLevel() {
      this.levelElapsedTime = Date.now() - this.levelStartTime;
      return {
        failed: true,
        level: this.currentLevel,
        time: this.levelElapsedTime
      };
    }
    /**
     * Check if a level is unlocked
     */
    isLevelUnlocked(levelNumber) {
      return this.unlockedLevels.has(levelNumber);
    }
    /**
     * Unlock a level
     */
    unlockLevel(levelNumber) {
      if (levelNumber > 0) {
        this.unlockedLevels.add(levelNumber);
      }
    }
    /**
     * Calculate rewards for completing a level
     */
    calculateLevelRewards() {
      const levelData = this.getLevelData();
      const baseCoins = this.config.getConfig("progression", "coinsPerUnit") || 1;
      const baseXP = this.config.getConfig("progression", "xpPerUnit") || 2;
      const levelBonus = this.config.getConfig("progression", "levelCompleteBonus") || 100;
      const timeBonus = Math.max(0, 300 - this.levelElapsedTime / 1e3);
      const difficultyBonus = (levelData.difficulty || 1) * 50;
      return {
        coins: Math.floor(baseCoins * 50 + timeBonus + difficultyBonus),
        xp: Math.floor(baseXP * 50 + timeBonus + difficultyBonus),
        bonusCoins: Math.floor(timeBonus),
        bonusXp: Math.floor(timeBonus),
        levelBonus
      };
    }
    /**
     * Get level completion rewards
     */
    getLevelCompletionRewards() {
      return this.calculateLevelRewards();
    }
    /**
     * Update level manager (called each frame)
     */
    update(deltaTime) {
      if (this.levelStartTime > 0) {
        this.levelElapsedTime += deltaTime * 1e3;
      }
    }
    /**
     * Get level statistics for debugging
     */
    getStats() {
      return {
        currentLevel: this.currentLevel,
        currentWave: this.currentWave,
        wavesCompleted: this.wavesCompleted,
        totalWavesPerLevel: this.totalWavesPerLevel,
        levelGoal: this.getCurrentLevelGoal(),
        unlockedLevels: Array.from(this.unlockedLevels).sort((a, b) => a - b),
        levelData: this.getLevelData(),
        levelElapsedTime: this.levelElapsedTime
      };
    }
    /**
     * Reset level manager
     */
    reset() {
      this.currentLevel = 1;
      this.currentWave = 0;
      this.wavesCompleted = 0;
      this.levelStartTime = 0;
      this.levelElapsedTime = 0;
      this.unlockedLevels = /* @__PURE__ */ new Set([1]);
      this.levelData = {};
      this.waveData = {};
    }
    /**
     * Dispose of level manager resources
     */
    dispose() {
      this.levelTemplates = {};
      this.unlockedLevels.clear();
      this.levelData = {};
      this.waveData = {};
    }
  };

  // games/js/progression/ProgressionSystem.js
  var ProgressionSystem = class {
    constructor(config, saveManager) {
      this.config = config;
      this.saveManager = saveManager;
      this.xp = 0;
      this.coins = 0;
    }
    update(deltaTime) {
    }
    addRewards(rewards) {
      if (rewards.coins) this.coins += rewards.coins;
    }
    getScore() {
      return this.xp;
    }
    getCoins() {
      return this.coins;
    }
    dispose() {
    }
  };

  // games/js/saveData/SaveManager.js
  var SaveManager = class {
    constructor(config) {
      this.config = config;
      this.saveKey = "crowdCommandSave";
      this.version = "1.0";
      this.autoSaveInterval = 3e4;
      this.lastAutoSave = 0;
      this.saveData = {
        version: this.version,
        timestamp: 0,
        progress: {
          currentLevel: 1,
          unlockedLevels: [1],
          completedLevels: [],
          highestLevelCompleted: 0
        },
        currency: {
          coins: 0,
          totalCoinsEarned: 0
        },
        progression: {
          xp: 0,
          level: 1,
          skillPoints: 0,
          upgrades: {}
        },
        settings: {
          musicVolume: 0.7,
          sfxVolume: 0.8,
          masterVolume: 0.7,
          vibrationEnabled: true,
          showTutorial: true
        },
        statistics: {
          totalPlaytime: 0,
          totalEnemiesDefeated: 0,
          totalUnitsLost: 0,
          totalShotsFired: 0,
          accuracy: 0,
          bestStreak: 0,
          favoriteWeapon: "pulseCannon"
        }
      };
      this.storageAvailable = this.checkStorageAvailability();
      this.load();
    }
    /**
     * Check if localStorage is available
     */
    checkStorageAvailability() {
      try {
        const test = "__storage_test__";
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
    /**
     * Save game progress
     */
    save() {
      if (!this.storageAvailable) {
        console.warn("Storage not available, cannot save game");
        return false;
      }
      try {
        this.saveData.timestamp = Date.now();
        if (this.saveData.timestamp > 0) {
          const lastTimestamp = this.saveData.timestamp || this.saveData.timestamp;
          const sessionLength = Date.now() - lastTimestamp;
          this.saveData.statistics.totalPlaytime += sessionLength;
        }
        localStorage.setItem(this.saveKey, JSON.stringify(this.saveData));
        this.lastAutoSave = Date.now();
        return true;
      } catch (error) {
        console.error("Failed to save game:", error);
        return false;
      }
    }
    /**
     * Load game progress
     */
    load() {
      if (!this.storageAvailable) {
        console.warn("Storage not available, starting fresh game");
        return this.getDefaultSaveData();
      }
      try {
        const savedData = localStorage.getItem(this.saveKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (this.isVersionCompatible(parsedData.version)) {
            this.saveData = this.migrateSaveData(parsedData);
            return true;
          } else {
            console.warn("Save data version incompatible, starting fresh");
            this.saveData = this.migrateSaveData(parsedData);
            return true;
          }
        } else {
          console.log("No save data found, starting fresh game");
          return this.getDefaultSaveData();
        }
      } catch (error) {
        console.error("Failed to load game save:", error);
        this.saveData = this.getDefaultSaveData();
        return false;
      }
    }
    loadProgress() {
      return this.load();
    }
    saveProgress() {
      return this.save();
    }
    /**
     * Check if save data version is compatible
     */
    isVersionCompatible(saveVersion) {
      return saveVersion === this.version || saveVersion.startsWith("1.") && this.version.startsWith("1.");
    }
    /**
     * Migrate save data from older versions
     */
    migrateSaveData(oldData) {
      const migrated = { ...this.getDefaultSaveData() };
      if (oldData.progress) {
        migrated.progress = { ...migrated.progress, ...oldData.progress };
      }
      if (oldData.currency) {
        migrated.currency = { ...migrated.currency, ...oldData.currency };
      }
      if (oldData.progression) {
        migrated.progression = { ...migrated.progression, ...oldData.progression };
      }
      if (oldData.settings) {
        migrated.settings = { ...migrated.settings, ...oldData.settings };
      }
      if (oldData.statistics) {
        migrated.statistics = { ...migrated.statistics, ...oldData.statistics };
      }
      migrated.version = this.version;
      migrated.timestamp = Date.now();
      return migrated;
    }
    /**
     * Get default save data structure
     */
    getDefaultSaveData() {
      return {
        version: this.version,
        timestamp: Date.now(),
        progress: {
          currentLevel: 1,
          unlockedLevels: [1],
          completedLevels: [],
          highestLevelCompleted: 0
        },
        currency: {
          coins: 0,
          totalCoinsEarned: 0
        },
        progression: {
          xp: 0,
          level: 1,
          skillPoints: 0,
          upgrades: {}
        },
        settings: {
          musicVolume: 0.7,
          sfxVolume: 0.8,
          masterVolume: 0.7,
          vibrationEnabled: true,
          showTutorial: true
        },
        statistics: {
          totalPlaytime: 0,
          totalEnemiesDefeated: 0,
          totalUnitsLost: 0,
          totalShotsFired: 0,
          accuracy: 0,
          bestStreak: 0,
          favoriteWeapon: "pulseCannon"
        }
      };
    }
    /**
     * Update progress data
     */
    updateProgress(updates) {
      this.saveData.progress = { ...this.saveData.progress, ...updates };
    }
    /**
     * Update currency data
     */
    updateCurrency(updates) {
      this.saveData.currency = { ...this.saveData.currency, ...updates };
      if (updates.coins !== void 0 && updates.coins > this.saveData.currency.coins) {
        const coinsEarned = updates.coins - this.saveData.currency.coins;
        this.saveData.currency.totalCoinsEarned += coinsEarned;
      }
    }
    /**
     * Update progression data
     */
    updateProgression(updates) {
      this.saveData.progression = { ...this.saveData.progression, ...updates };
    }
    /**
     * Update settings data
     */
    updateSettings(updates) {
      this.saveData.settings = { ...this.saveData.settings, ...updates };
    }
    /**
     * Update statistics data
     */
    updateStatistics(updates) {
      this.saveData.statistics = { ...this.saveData.statistics, ...updates };
    }
    /**
     * Get current save data (copy)
     */
    getSaveData() {
      return JSON.parse(JSON.stringify(this.saveData));
    }
    /**
     * Get specific save data section
     */
    getSection(section) {
      return this.saveData[section] || null;
    }
    /**
     * Reset save data (for testing or new game)
     */
    reset() {
      this.saveData = this.getDefaultSaveData();
      this.save();
    }
    /**
     * Auto-save check (call each frame or second)
     */
    autoSaveCheck() {
      const now = Date.now();
      if (now - this.lastAutoSave > this.autoSaveInterval) {
        this.save();
      }
    }
    /**
     * Get save statistics for debugging
     */
    getStats() {
      return {
        storageAvailable: this.storageAvailable,
        saveKey: this.saveKey,
        version: this.version,
        lastSave: this.lastAutoSave,
        hasSaveData: !!localStorage.getItem(this.saveKey),
        saveDataSize: localStorage.getItem(this.saveKey)?.length || 0
      };
    }
    /**
     * Dispose of save manager resources
     */
    dispose() {
    }
  };

  // games/js/core/Game.js
  var Game = class {
    constructor(canvasElement, uiElements) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext("2d");
      this.uiElements = uiElements || {};
      this.config = new ConfigManager();
      this.state = new GameState();
      this.inputManager = null;
      this.renderer = null;
      this.physicsEngine = null;
      this.entityManager = null;
      this.gateSystem = null;
      this.spawningSystem = null;
      this.weaponSystem = null;
      this.levelManager = null;
      this.progressionSystem = null;
      this.saveManager = null;
      this.lastTime = 0;
      this.deltaTime = 0;
      this.fps = 0;
      this.framesThisSecond = 0;
      this.lastFpsUpdate = 0;
      this.gameLoop = this.gameLoop.bind(this);
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.init();
    }
    /**
     * Initialize all game systems
     */
    async init() {
      try {
        this.state.changeState(this.state.states.BOOT);
        await this.loadConfig();
        await this.initSystems();
        this.setupEventListeners();
        this.resize();
        await this.loadGameData();
        this.state.changeState(this.state.states.MAIN_MENU);
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        console.log("Game initialized successfully");
      } catch (error) {
        console.error("Failed to initialize game:", error);
        this.showError("Failed to initialize game: " + error.message);
      }
    }
    /**
     * Load configuration (could be from file in future)
     */
    async loadConfig() {
      return Promise.resolve();
    }
    /**
     * Initialize all game systems
     */
    async initSystems() {
      this.state.changeState(this.state.states.LOADING);
      this.inputManager = new InputManager(this.canvas, this.config);
      this.renderer = new Renderer(this.canvas, this.ctx, this.config);
      this.physicsEngine = new PhysicsEngine(this.config);
      this.entityManager = new EntityManager(this.config, this.physicsEngine);
      this.gateSystem = new GateSystem(this.config);
      this.spawningSystem = new SpawningSystem(this.config, this.entityManager);
      this.weaponSystem = new WeaponSystem(this.config, this.entityManager, this.physicsEngine);
      this.levelManager = new LevelManager(this.config);
      this.progressionSystem = new ProgressionSystem(this.config, this.saveManager);
      this.saveManager = new SaveManager(this.config);
      this.entityManager.setSystems({
        weaponSystem: this.weaponSystem,
        gateSystem: this.gateSystem,
        spawningSystem: this.spawningSystem
      });
      this.entityManager.setRenderer(this.renderer);
      this.state.changeState(this.state.states.MAIN_MENU);
    }
    /**
     * Set up global event listeners
     */
    setupEventListeners() {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("resize", this.handleResize);
      document.addEventListener("keydown", (e) => {
        if (e.key === "F12" && e.shiftKey && e.altKey) {
          this.toggleDebug();
        }
      });
    }
    /**
     * Set up UI menu event listeners
     */
    setupMenuHandlers() {
      const btnPlay = document.getElementById("btn-play");
      const btnLevels = document.getElementById("btn-levels");
      const btnSettings = document.getElementById("btn-settings");
      if (btnPlay) {
        btnPlay.addEventListener("click", () => {
          if (this.state.isState(this.state.states.MAIN_MENU)) {
            this.state.changeState(this.state.states.LEVEL_SELECT);
          }
        });
      }
      if (btnLevels) {
        btnLevels.addEventListener("click", () => {
          if (this.state.isState(this.state.states.MAIN_MENU)) {
            this.state.changeState(this.state.states.LEVEL_SELECT);
          }
        });
      }
      if (btnSettings) {
        btnSettings.addEventListener("click", () => {
          if (this.state.isState(this.state.states.MAIN_MENU)) {
            this.state.changeState(this.state.states.SETTINGS);
          }
        });
      }
      const restartBtn = document.getElementById("restart-btn");
      if (restartBtn) {
        restartBtn.addEventListener("click", () => {
          if (this.state.isState(this.state.states.LEVEL_FAILED) || this.state.isState(this.state.states.LEVEL_COMPLETE)) {
            this.state.changeState(this.state.states.MAIN_MENU);
          }
        });
      }
    }
    /**
     * Handle visibility change (pause/resume)
     */
    handleVisibilityChange() {
      if (document.hidden) {
        if (this.state.isState(this.state.states.PLAYING)) {
          this.state.changeState(this.state.states.PAUSED);
        }
      } else {
        if (this.state.isState(this.state.states.PAUSED)) {
          this.state.changeState(this.state.states.PLAYING);
        }
      }
    }
    /**
     * Handle window resize
     */
    handleResize() {
      this.resize();
    }
    /**
     * Resize the game canvas
     */
    resize() {
      const container = this.canvas.parentElement;
      if (!container) return;
      const aspectRatio = 16 / 9;
      let width = container.clientWidth;
      let height = container.clientHeight;
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
      this.canvas.width = width;
      this.canvas.height = height;
      if (this.renderer) {
        this.renderer.onResize(width, height);
      }
    }
    /**
     * Main game loop
     */
    gameLoop(timestamp) {
      if (this.lastTime !== 0) {
        this.deltaTime = (timestamp - this.lastTime) / 1e3;
        this.deltaTime = Math.min(this.deltaTime, 0.1);
      } else {
        this.deltaTime = 1 / 60;
      }
      this.lastTime = timestamp;
      this.framesThisSecond++;
      if (timestamp - this.lastFpsUpdate >= 1e3) {
        this.fps = this.framesThisSecond;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = timestamp;
      }
      this.update();
      this.render();
      requestAnimationFrame(this.gameLoop);
    }
    /**
     * Update all game systems
     */
    update() {
      if (this.state.isState(this.state.states.BOOT) || this.state.isState(this.state.states.LOADING) || this.state.isState(this.state.states.MAIN_MENU) || this.state.isState(this.state.states.LEVEL_SELECT) || this.state.isState(this.state.states.SETTINGS) || this.state.isState(this.state.states.UPGRADE)) {
        if (this.inputManager) this.inputManager.update(this.deltaTime);
        if (this.renderer) this.renderer.updateUI(this.deltaTime);
        return;
      }
      if (this.inputManager) {
        this.inputManager.update(this.deltaTime);
      }
      if (this.state.isState(this.state.states.PRE_LEVEL)) {
        this.updatePreLevel();
      } else if (this.state.isState(this.state.states.PLAYING)) {
        this.updatePlaying();
      } else if (this.state.isState(this.state.states.PAUSED)) {
        if (this.inputManager) this.inputManager.update(this.deltaTime);
        if (this.renderer) this.renderer.updateUI(this.deltaTime);
      } else if (this.state.isState(this.state.states.LEVEL_COMPLETE) || this.state.isState(this.state.states.LEVEL_FAILED)) {
        this.updateLevelEnd();
      }
      if (this.renderer) {
        this.renderer.update(this.deltaTime);
      }
      if (this.levelManager) this.levelManager.update(this.deltaTime);
      if (this.progressionSystem) this.progressionSystem.update(this.deltaTime);
      if (this.saveManager) this.saveManager.update(this.deltaTime);
    }
    /**
     * Update pre-level state (countdown, etc.)
     */
    updatePreLevel() {
    }
    /**
     * Update playing state - main game logic
     */
    updatePlaying() {
      if (this.entityManager) {
        this.entityManager.update(this.deltaTime);
      }
      if (this.spawningSystem) {
        this.spawningSystem.update(this.deltaTime);
      }
      if (this.gateSystem) {
        this.gateSystem.update(this.deltaTime);
      }
      if (this.weaponSystem) {
        this.weaponSystem.update(this.deltaTime);
      }
      if (this.physicsEngine) {
        this.physicsEngine.update(this.deltaTime);
      }
      this.checkGameConditions();
    }
    /**
     * Update level end state
     */
    updateLevelEnd() {
    }
    /**
     * Check win/lose conditions
     */
    checkGameConditions() {
      const levelGoal = this.levelManager ? this.levelManager.getCurrentLevelGoal() : 0;
      const currentCrowd = this.entityManager ? this.entityManager.getPlayerUnitCount() : 0;
      if (levelGoal > 0) {
        if (currentCrowd >= levelGoal) {
          this.completeLevel();
        } else if (currentCrowd <= 0) {
          this.failLevel();
        }
      }
    }
    /**
     * Complete the current level
     */
    completeLevel() {
      if (this.state.isState(this.state.states.PLAYING)) {
        this.state.changeState(this.state.states.LEVEL_COMPLETE);
        if (this.progressionSystem) {
          const rewards = this.levelManager.getLevelCompletionRewards();
          this.progressionSystem.addRewards(rewards);
        }
        if (this.saveManager) {
          this.saveManager.saveProgress();
        }
        this.showMessage("Level Complete!", 3e3);
      }
    }
    /**
     * Fail the current level
     */
    failLevel() {
      if (this.state.isState(this.state.states.PLAYING)) {
        this.state.changeState(this.state.states.LEVEL_FAILED);
        this.showMessage("Level Failed!", 3e3);
      }
    }
    /**
     * Render the game
     */
    render() {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.state.isState(this.state.states.BOOT) || this.state.isState(this.state.states.LOADING)) {
        this.renderLoadingScreen();
      } else if (this.state.isState(this.state.states.MAIN_MENU)) {
        this.renderMainMenu();
      } else if (this.state.isState(this.state.states.LEVEL_SELECT)) {
        this.renderLevelSelect();
      } else if (this.state.isState(this.state.states.PRE_LEVEL)) {
        this.renderPreLevel();
      } else if (this.state.isState(this.state.states.PLAYING)) {
        this.renderPlaying();
      } else if (this.state.isState(this.state.states.PAUSED)) {
        this.renderPlaying();
        this.renderPauseOverlay();
      } else if (this.state.isState(this.state.states.LEVEL_COMPLETE)) {
        this.renderPlaying();
        this.renderLevelCompleteOverlay();
      } else if (this.state.isState(this.state.states.LEVEL_FAILED)) {
        this.renderPlaying();
        this.renderLevelFailedOverlay();
      } else if (this.state.isState(this.state.states.UPGRADE)) {
        this.renderUpgradeMenu();
      } else if (this.state.isState(this.state.states.SETTINGS)) {
        this.renderSettings();
      }
      if (this.renderer) {
        this.renderer.renderHUD(this.getHUDData());
      }
    }
    /**
     * Get data for HUD rendering
     */
    getHUDData() {
      return {
        crowdCount: this.entityManager ? this.entityManager.getPlayerUnitCount() : 0,
        goalCount: this.levelManager ? this.levelManager.getCurrentLevelGoal() : 0,
        score: this.progressionSystem ? this.progressionSystem.getScore() : 0,
        waveCount: this.levelManager ? this.levelManager.getCurrentWave() : 0,
        levelNumber: this.levelManager ? this.levelManager.getCurrentLevel() : 0,
        coins: this.progressionSystem ? this.progressionSystem.getCoins() : 0,
        fps: this.fps,
        currentState: this.state.getCurrentState()
      };
    }
    /**
     * Render loading screen
     */
    renderLoadingScreen() {
      if (this.ctx) {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Loading...", this.canvas.width / 2, this.canvas.height / 2);
      }
    }
    /**
     * Render main menu
     */
    renderMainMenu() {
      if (this.ctx) {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#4a90e2";
        this.ctx.textAlign = "center";
        this.ctx.font = "48px Arial";
        this.ctx.fillText("CROWD COMMAND", this.canvas.width / 2, this.canvas.height / 3);
        this.ctx.font = "24px Arial";
        this.ctx.fillText("Tap to Start", this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = "18px Arial";
        this.ctx.fillText("Version 1.0.0", this.canvas.width / 2, this.canvas.height * 0.8);
      }
    }
    /**
     * Render level select screen
     */
    renderLevelSelect() {
      this.renderMainMenu();
      if (this.ctx) {
        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Level Select - Coming Soon", this.canvas.width / 2, this.canvas.height / 2 + 40);
      }
    }
    /**
     * Render pre-level screen
     */
    renderPreLevel() {
      this.renderPlaying();
      if (this.ctx) {
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.font = "32px Arial";
        this.ctx.fillText("Get Ready!", this.canvas.width / 2, this.canvas.height / 2);
      }
    }
    /**
     * Render playing state (delegated to renderer)
     */
    renderPlaying() {
      if (this.renderer) {
        this.renderer.renderGameWorld(
          this.entityManager ? this.entityManager.getAllEntities() : [],
          this.gateSystem ? this.gateSystem.getAllGates() : [],
          this.weaponSystem ? this.weaponSystem.getActiveEffects() : [],
          this.levelManager ? this.levelManager.getLevelData() : {}
        );
      }
    }
    /**
     * Render pause overlay
     */
    renderPauseOverlay() {
      if (this.ctx) {
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.font = "36px Arial";
        this.ctx.fillText("PAUSED", this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Tap to Resume", this.canvas.width / 2, this.canvas.height / 2 + 40);
      }
    }
    /**
     * Render level complete overlay
     */
    renderLevelCompleteOverlay() {
      if (this.ctx) {
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#00ff00";
        this.ctx.textAlign = "center";
        this.ctx.font = "36px Arial";
        this.ctx.fillText("LEVEL COMPLETE!", this.canvas.width / 2, this.canvas.height / 3);
        if (this.progressionSystem) {
          const rewards = this.levelManager.getLevelCompletionRewards();
          this.ctx.font = "24px Arial";
          this.ctx.fillText(`+${rewards.coins} Coins`, this.canvas.width / 2, this.canvas.height / 2);
          this.ctx.fillText(`+${rewards.xp} XP`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Tap to Continue", this.canvas.width / 2, this.canvas.height * 0.8);
      }
    }
    /**
     * Render level failed overlay
     */
    renderLevelFailedOverlay() {
      if (this.ctx) {
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#ff0000";
        this.ctx.textAlign = "center";
        this.ctx.font = "36px Arial";
        this.ctx.fillText("LEVEL FAILED", this.canvas.width / 2, this.canvas.height / 3);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Tap to Try Again", this.canvas.width / 2, this.canvas.height * 0.8);
      }
    }
    /**
     * Render upgrade menu
     */
    renderUpgradeMenu() {
      if (this.ctx) {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#4a90e2";
        this.ctx.textAlign = "center";
        this.ctx.font = "32px Arial";
        this.ctx.fillText("UPGRADES", this.canvas.width / 2, this.canvas.height / 3);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Upgrade System - Coming Soon", this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = "18px Arial";
        this.ctx.fillText("Tap to Return", this.canvas.width / 2, this.canvas.height * 0.8);
      }
    }
    /**
     * Render settings menu
     */
    renderSettings() {
      if (this.ctx) {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#4a90e2";
        this.ctx.textAlign = "center";
        this.ctx.font = "32px Arial";
        this.ctx.fillText("SETTINGS", this.canvas.width / 2, this.canvas.height / 3);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Settings - Coming Soon", this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = "18px Arial";
        this.ctx.fillText("Tap to Return", this.canvas.width / 2, this.canvas.height * 0.8);
      }
    }
    /**
     * Show a temporary message
     * @param {string} message - Message to show
     * @param {number} duration - Duration in milliseconds
     */
    showMessage(message, duration = 2e3) {
      if (this.uiElements.message) {
        this.uiElements.message.textContent = message;
        this.uiElements.message.style.opacity = "1";
        this.uiElements.message.style.display = "block";
        setTimeout(() => {
          this.uiElements.message.style.opacity = "0";
          setTimeout(() => {
            this.uiElements.message.style.display = "none";
          }, 300);
        }, duration);
      }
    }
    /**
     * Show an error message
     * @param {string} error - Error message
     */
    showError(error) {
      console.error(error);
      this.showMessage("Error: " + error, 5e3);
    }
    /**
     * Toggle debug mode (for development)
     */
    toggleDebug() {
      console.log("Debug toggled - FPS:", this.fps);
      if (this.entityManager) {
        console.log("Entities:", this.entityManager.getEntityCount());
      }
    }
    /**
     * Load game data (progress, settings, etc.)
     */
    async loadGameData() {
      if (this.saveManager) {
        try {
          await this.saveManager.loadProgress();
        } catch (error) {
          console.warn("Could not load saved game data:", error);
        }
      }
    }
    /**
     * Save game data
     */
    async saveGameData() {
      if (this.saveManager) {
        try {
          await this.saveManager.saveProgress();
        } catch (error) {
          console.error("Could not save game data:", error);
        }
      }
    }
    /**
     * Clean up resources
     */
    dispose() {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
      window.removeEventListener("resize", this.handleResize);
      if (this.inputManager) this.inputManager.dispose();
      if (this.renderer) this.renderer.dispose();
      if (this.physicsEngine) this.physicsEngine.dispose();
      if (this.entityManager) this.entityManager.dispose();
      if (this.gateSystem) this.gateSystem.dispose();
      if (this.spawningSystem) this.spawningSystem.dispose();
      if (this.weaponSystem) this.weaponSystem.dispose();
      if (this.levelManager) this.levelManager.dispose();
      if (this.progressionSystem) this.progressionSystem.dispose();
      if (this.saveManager) this.saveManager.dispose();
      console.log("Game disposed");
    }
  };

  // games/js/main.js
  var ui = {
    hud: document.getElementById("hud"),
    levelInfo: document.getElementById("level-info"),
    crowd: document.getElementById("crowd-count"),
    goal: document.getElementById("goal-count"),
    score: document.getElementById("score-count"),
    wave: document.getElementById("wave-count"),
    levelNumber: document.getElementById("level-number"),
    coins: document.getElementById("coins-count"),
    message: document.getElementById("message"),
    restartBtn: document.getElementById("restart-btn")
  };
  var canvas = document.getElementById("game-canvas");
  if (!canvas) {
    console.error("Canvas element #game-canvas not found");
    throw new Error("Missing canvas");
  }
  var game = new Game(canvas, ui);
  window.game = game;
  ui.restartBtn.addEventListener("click", () => game.restart());
})();
