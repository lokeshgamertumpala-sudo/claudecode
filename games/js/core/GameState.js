/**
 * Game State Manager - Handles game states and transitions
 * Prevents duplicate loops, race conditions, and stuck states
 */
export class GameState {
    constructor() {
        this.states = {
            BOOT: 'boot',
            LOADING: 'loading',
            MAIN_MENU: 'main_menu',
            LEVEL_SELECT: 'level_select',
            PRE_LEVEL: 'pre_level',
            PLAYING: 'playing',
            PAUSED: 'paused',
            LEVEL_COMPLETE: 'level_complete',
            LEVEL_FAILED: 'level_failed',
            UPGRADE: 'upgrade',
            SETTINGS: 'settings'
        };

        this.currentState = this.states.BOOT;
        this.previousState = null;
        this.stateChangeCallbacks = new Map();
        this.isTransitioning = false;
        this.lastStateChangeTime = 0;
        this.minStateChangeInterval = 100; // Prevent rapid state changes
    }

    /**
     * Change to a new state
     * @param {string} newState - The state to transition to
     * @returns {boolean} - True if state changed, false if blocked
     */
    changeState(newState) {
        // Prevent state changes too quickly
        const now = Date.now();
        if (now - this.lastStateChangeTime < this.minStateChangeInterval) {
            return false;
        }

        // Prevent changing to the same state
        if (this.currentState === newState) {
            return false;
        }

        // Prevent invalid transitions (optional - can be customized)
        if (!this.isValidTransition(this.currentState, newState)) {
            console.warn(`Invalid state transition from ${this.currentState} to ${newState}`);
            return false;
        }

        // Store previous state
        this.previousState = this.currentState;
        this.currentState = newState;
        this.lastStateChangeTime = now;
        this.isTransitioning = true;

        // Notify listeners
        this.notifyStateChange(newState, this.previousState);

        // Reset transitioning flag after a short delay
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
        // Define valid transitions
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
            this.stateChangeCallbacks.set(state, new Set());
        }
        this.stateChangeCallbacks.get(state).add(callback);

        // Return unsubscribe function
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
        // Notify specific state listeners
        if (this.stateChangeCallbacks.has(newState)) {
            this.stateChangeCallbacks.get(newState).forEach(callback => {
                try {
                    callback(newState, oldState);
                } catch (error) {
                    console.error(`Error in state change callback for ${newState}:`, error);
                }
            });
        }

        // Notify all state listeners (null key)
        if (this.stateChangeCallbacks.has(null)) {
            this.stateChangeCallbacks.get(null).forEach(callback => {
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
}