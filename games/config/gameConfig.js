// Game Configuration - Converted from JSON for ES module compatibility
export default {
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
    "enemyHealth": {"base": 10, "perLevel": 1.1},
    "enemyDamage": {"base": 5, "perLevel": 1.05},
    "enemySpeed": {"base": 2, "perLevel": 1.02},
    "gateFrequency": {"base": 0.003, "perLevel": 0.0001},
    "projectileSpeed": {"base": 0.12, "perLevel": 0.002},
    "rewardMultiplier": {"base": 1.0, "perLevel": 0.01}
  }
};