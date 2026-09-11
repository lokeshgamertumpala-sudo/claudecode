/**
 * Main Game Class - Orchestrates all game systems
 * Core game loop, system initialization, and coordination
 */
import { ConfigManager } from './ConfigManager.js';
import { GameState } from './GameState.js';
import { InputManager } from '../input/InputManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { EntityManager } from '../entities/EntityManager.js';
import { GateSystem } from '../gameplay/GateSystem.js';
import { SpawningSystem } from '../gameplay/SpawningSystem.js';
import { WeaponSystem } from '../gameplay/WeaponSystem.js';
import { LevelManager } from '../levels/LevelManager.js';
import { ProgressionSystem } from '../progression/ProgressionSystem.js';
import { SaveManager } from '../saveData/SaveManager.js';

export class Game {
    constructor(canvasElement, uiElements) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.uiElements = uiElements || {};

        // Core managers
        this.config = new ConfigManager();
        this.state = new GameState();

        // Game systems (will be initialized in init())
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

        // Game state
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.framesThisSecond = 0;
        this.lastFpsUpdate = 0;

        // Binding
        this.gameLoop = this.gameLoop.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize all game systems
     */
    async init() {
        try {
            this.state.changeState(this.state.states.BOOT);

            // Load configuration
            await this.loadConfig();

            // Initialize systems in dependency order
            await this.initSystems();

            // Set up event listeners
            this.setupEventListeners();

            // Initial resize
            this.resize();

            // Load saved data
            await this.loadGameData();

            // Go to main menu
            this.state.changeState(this.state.states.MAIN_MENU);

            // Start game loop
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game: ' + error.message);
        }
    }

    /**
     * Load configuration (could be from file in future)
     */
    async loadConfig() {
        // Config is already loaded in ConfigManager constructor
        // Could extend to load from JSON file here
        return Promise.resolve();
    }

    /**
     * Initialize all game systems
     */
    async initSystems() {
        this.state.changeState(this.state.states.LOADING);

        // Initialize systems
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

        // Set up cross-system references
        this.entityManager.setSystems({
            weaponSystem: this.weaponSystem,
            gateSystem: this.gateSystem,
            spawningSystem: this.spawningSystem
        });

        // IMPORTANT: Pass renderer reference to entity manager for advanced effects
        this.entityManager.setRenderer(this.renderer);

        this.state.changeState(this.state.states.MAIN_MENU);
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Visibility change (pause when tab/window is hidden)
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Window resize
        window.addEventListener('resize', this.handleResize);

        // Keyboard shortcuts for debugging
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' && e.shiftKey && e.altKey) {
                // Debug combo: Shift+Alt+F12
                this.toggleDebug();
            }
        });
    }

    /**
     * Set up UI menu event listeners
     */
    setupMenuHandlers() {
        // Main menu buttons
        const btnPlay = document.getElementById('btn-play');
        const btnLevels = document.getElementById('btn-levels');
        const btnSettings = document.getElementById('btn-settings');

        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                if (this.state.isState(this.state.states.MAIN_MENU)) {
                    this.state.changeState(this.state.states.LEVEL_SELECT);
                }
            });
        }
        if (btnLevels) {
            btnLevels.addEventListener('click', () => {
                if (this.state.isState(this.state.states.MAIN_MENU)) {
                    this.state.changeState(this.state.states.LEVEL_SELECT);
                }
            });
        }
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                if (this.state.isState(this.state.states.MAIN_MENU)) {
                    this.state.changeState(this.state.states.SETTINGS);
                }
            });
        }

        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (this.state.isState(this.state.states.LEVEL_FAILED) ||
                    this.state.isState(this.state.states.LEVEL_COMPLETE)) {
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
            // Page is hidden - pause game
            if (this.state.isState(this.state.states.PLAYING)) {
                this.state.changeState(this.state.states.PAUSED);
            }
        } else {
            // Page is visible - resume if was playing
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
        // Get the container size
        const container = this.canvas.parentElement;
        if (!container) return;

        // Set canvas size to match container while maintaining aspect ratio
        const aspectRatio = 16 / 9; // Target aspect ratio
        let width = container.clientWidth;
        let height = container.clientHeight;

        // Check if we need to letterbox/pillarbox
        if (width / height > aspectRatio) {
            // Container is wider than target aspect ratio
            width = height * aspectRatio;
        } else {
            // Container is taller than target aspect ratio
            height = width / aspectRatio;
        }

        // Set canvas size
        this.canvas.width = width;
        this.canvas.height = height;

        // Notify renderer of size change
        if (this.renderer) {
            this.renderer.onResize(width, height);
        }
    }

    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        // Calculate delta time
        if (this.lastTime !== 0) {
            this.deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
            // Cap delta time to prevent spiral of death on large pauses
            this.deltaTime = Math.min(this.deltaTime, 0.1);
        } else {
            this.deltaTime = 1 / 60; // First frame assumption
        }
        this.lastTime = timestamp;

        // Update FPS counter
        this.framesThisSecond++;
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.fps = this.framesThisSecond;
            this.framesThisSecond = 0;
            this.lastFpsUpdate = timestamp;
        }

        // Update game systems (only if not in a blocking state)
        this.update();

        // Render game
        this.render();

        // Request next frame
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update all game systems
     */
    update() {
        // Don't update game logic in certain states
        if (this.state.isState(this.state.states.BOOT) ||
            this.state.isState(this.state.states.LOADING) ||
            this.state.isState(this.state.states.MAIN_MENU) ||
            this.state.isState(this.state.states.LEVEL_SELECT) ||
            this.state.isState(this.state.states.SETTINGS) ||
            this.state.isState(this.state.states.UPGRADE)) {
            // Still update input and renderer for UI interactions
            if (this.inputManager) this.inputManager.update(this.deltaTime);
            if (this.renderer) this.renderer.updateUI(this.deltaTime);
            return;
        }

        // Update input first
        if (this.inputManager) {
            this.inputManager.update(this.deltaTime);
        }

        // Update game systems based on current state
        if (this.state.isState(this.state.states.PRE_LEVEL)) {
            this.updatePreLevel();
        } else if (this.state.isState(this.state.states.PLAYING)) {
            this.updatePlaying();
        } else if (this.state.isState(this.state.states.PAUSED)) {
            // Update minimal systems when paused
            if (this.inputManager) this.inputManager.update(this.deltaTime);
            if (this.renderer) this.renderer.updateUI(this.deltaTime);
        } else if (this.state.isState(this.state.states.LEVEL_COMPLETE) ||
                   this.state.isState(this.state.states.LEVEL_FAILED)) {
            this.updateLevelEnd();
        }

        // Always update renderer
        if (this.renderer) {
            this.renderer.update(this.deltaTime);
        }

        // Update other managers
        if (this.levelManager) this.levelManager.update(this.deltaTime);
        if (this.progressionSystem) this.progressionSystem.update(this.deltaTime);
        if (this.saveManager) this.saveManager.update(this.deltaTime);
    }

    /**
     * Update pre-level state (countdown, etc.)
     */
    updatePreLevel() {
        // Could add countdown timer here
        // For now, just transition to playing after a short delay
        // This would typically be handled by a timer or input
    }

    /**
     * Update playing state - main game logic
     */
    updatePlaying() {
        // Update entity manager (handles unit movement, AI, etc.)
        if (this.entityManager) {
            this.entityManager.update(this.deltaTime);
        }

        // Update spawning system
        if (this.spawningSystem) {
            this.spawningSystem.update(this.deltaTime);
        }

        // Update gate system
        if (this.gateSystem) {
            this.gateSystem.update(this.deltaTime);
        }

        // Update weapon system
        if (this.weaponSystem) {
            this.weaponSystem.update(this.deltaTime);
        }

        // Update physics engine
        if (this.physicsEngine) {
            this.physicsEngine.update(this.deltaTime);
        }

        // Check win/lose conditions
        this.checkGameConditions();
    }

    /**
     * Update level end state
     */
    updateLevelEnd() {
        // Handle level complete/failed logic
        // This would typically wait for player input to continue
    }

    /**
     * Check win/lose conditions
     */
    checkGameConditions() {
        // Get current level goal from level manager
        const levelGoal = this.levelManager ? this.levelManager.getCurrentLevelGoal() : 0;
        const currentCrowd = this.entityManager ? this.entityManager.getPlayerUnitCount() : 0;

        if (levelGoal > 0) {
            if (currentCrowd >= levelGoal) {
                // Level complete
                this.completeLevel();
            } else if (currentCrowd <= 0) {
                // Level failed
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

            // Award rewards
            if (this.progressionSystem) {
                const rewards = this.levelManager.getLevelCompletionRewards();
                this.progressionSystem.addRewards(rewards);
            }

            // Save progress
            if (this.saveManager) {
                this.saveManager.saveProgress();
            }

            // Show completion message
            this.showMessage('Level Complete!', 3000);
        }
    }

    /**
     * Fail the current level
     */
    failLevel() {
        if (this.state.isState(this.state.states.PLAYING)) {
            this.state.changeState(this.state.states.LEVEL_FAILED);

            // Show failure message
            this.showMessage('Level Failed!', 3000);
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Render based on state
        if (this.state.isState(this.state.states.BOOT) ||
            this.state.isState(this.state.states.LOADING)) {
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

        // Always render UI elements (HUD, etc.)
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
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    /**
     * Render main menu
     */
    renderMainMenu() {
        if (this.ctx) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#4a90e2';
            this.ctx.textAlign = 'center';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('CROWD COMMAND', this.canvas.width / 2, this.canvas.height / 3);

            this.ctx.font = '24px Arial';
            this.ctx.fillText('Tap to Start', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.font = '18px Arial';
            this.ctx.fillText('Version 1.0.0', this.canvas.width / 2, this.canvas.height * 0.8);
        }
    }

    /**
     * Render level select screen
     */
    renderLevelSelect() {
        // Placeholder - would show available levels
        this.renderMainMenu(); // Reuse for now
        if (this.ctx) {
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Level Select - Coming Soon', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    /**
     * Render pre-level screen
     */
    renderPreLevel() {
        // Could show countdown or level info
        this.renderPlaying(); // Show game but wait for start
        if (this.ctx) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.font = '32px Arial';
            this.ctx.fillText('Get Ready!', this.canvas.width / 2, this.canvas.height / 2);
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
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.font = '36px Arial';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tap to Resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    /**
     * Render level complete overlay
     */
    renderLevelCompleteOverlay() {
        if (this.ctx) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#00ff00';
            this.ctx.textAlign = 'center';
            this.ctx.font = '36px Arial';
            this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 3);

            // Show rewards
            if (this.progressionSystem) {
                const rewards = this.levelManager.getLevelCompletionRewards();
                this.ctx.font = '24px Arial';
                this.ctx.fillText(`+${rewards.coins} Coins`, this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.fillText(`+${rewards.xp} XP`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            }

            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tap to Continue', this.canvas.width / 2, this.canvas.height * 0.8);
        }
    }

    /**
     * Render level failed overlay
     */
    renderLevelFailedOverlay() {
        if (this.ctx) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ff0000';
            this.ctx.textAlign = 'center';
            this.ctx.font = '36px Arial';
            this.ctx.fillText('LEVEL FAILED', this.canvas.width / 2, this.canvas.height / 3);

            this.ctx.font = '20px Arial';
            this.ctx.fillText('Tap to Try Again', this.canvas.width / 2, this.canvas.height * 0.8);
        }
    }

    /**
     * Render upgrade menu
     */
    renderUpgradeMenu() {
        // Placeholder for upgrade system
        if (this.ctx) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#4a90e2';
            this.ctx.textAlign = 'center';
            this.ctx.font = '32px Arial';
            this.ctx.fillText('UPGRADES', this.canvas.width / 2, this.canvas.height / 3);

            this.ctx.font = '20px Arial';
            this.ctx.fillText('Upgrade System - Coming Soon', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.font = '18px Arial';
            this.ctx.fillText('Tap to Return', this.canvas.width / 2, this.canvas.height * 0.8);
        }
    }

    /**
     * Render settings menu
     */
    renderSettings() {
        // Placeholder for settings
        if (this.ctx) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#4a90e2';
            this.ctx.textAlign = 'center';
            this.ctx.font = '32px Arial';
            this.ctx.fillText('SETTINGS', this.canvas.width / 2, this.canvas.height / 3);

            this.ctx.font = '20px Arial';
            this.ctx.fillText('Settings - Coming Soon', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.font = '18px Arial';
            this.ctx.fillText('Tap to Return', this.canvas.width / 2, this.canvas.height * 0.8);
        }
    }

    /**
     * Show a temporary message
     * @param {string} message - Message to show
     * @param {number} duration - Duration in milliseconds
     */
    showMessage(message, duration = 2000) {
        if (this.uiElements.message) {
            this.uiElements.message.textContent = message;
            this.uiElements.message.style.opacity = '1';
            this.uiElements.message.style.display = 'block';

            setTimeout(() => {
                this.uiElements.message.style.opacity = '0';
                setTimeout(() => {
                    this.uiElements.message.style.display = 'none';
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
        this.showMessage('Error: ' + error, 5000);
    }

    /**
     * Toggle debug mode (for development)
     */
    toggleDebug() {
        // This would show FPS, entity counts, etc.
        console.log('Debug toggled - FPS:', this.fps);
        if (this.entityManager) {
            console.log('Entities:', this.entityManager.getEntityCount());
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
                console.warn('Could not load saved game data:', error);
                // Continue with default values
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
                console.error('Could not save game data:', error);
            }
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('resize', this.handleResize);

        // Dispose of systems
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

        console.log('Game disposed');
    }
}