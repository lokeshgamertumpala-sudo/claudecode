/**
 * Input Manager - Handles all input for multiple devices
 * Supports touch, mouse, and keyboard input with pointer events
 */
export class InputManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;

        // Input state
        this.mouseX = 0;
        this.mouseY = 0;
        this.isPointerDown = false;
        this.pointerDownX = 0;
        this.pointerDownY = 0;
        this.lastTapTime = 0;

        // Touch state
        this.activeTouches = new Map();

        // Keyboard state
        this.keys = {};
        this.wasKeysPressed = {};

        // Callbacks
        this.onPointerDown = null;
        this.onPointerUp = null;
        this.onPointerMove = null;
        this.onTap = null;

        // Cooldown for preventing accidental double-taps
        this.tapCooldown = 200; // ms

        // Initialize
        this.init();
    }

    /**
     * Initialize input listeners
     */
    init() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.onTouchCancel.bind(this), { passive: false });

        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
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

        // Check for tap (quick click)
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

        Array.from(e.changedTouches).forEach(touch => {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            this.activeTouches.set(touch.identifier, { x, y });
            this.mouseX = x;
            this.mouseY = y;
        });

        // For single touch, treat as pointer down
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            this.mouseX = x;
            this.mouseY = y;
            this.isPointerDown = true;
            this.pointerDownX = x;
            this.pointerDownY = y;

            if (this.onPointerDown) {
                this.onPointerDown(x, y);
            }

            // Check for tap
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

        Array.from(e.changedTouches).forEach(touch => {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.activeTouches.set(touch.identifier, { x, y });
        });

        // Update mouse position from latest touch
        let latestTouch = null;
        let latestTime = 0;
        this.activeTouches.forEach((pos, id) => {
            // Touch position is already updated
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

        Array.from(e.changedTouches).forEach(touch => {
            this.activeTouches.delete(touch.identifier);
        });

        // If no more touches, consider pointer up
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

        // Prevent arrow keys from scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        if (this.wasKeysPressed[e.key] !== true) {
            // Key just pressed
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

        const minMove = 10; // Minimum pixels to not be considered a tap
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
        // Update touch positions if needed
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
        return Object.values(this.keys).some(k => k);
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
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.removeEventListener('mouseleave', this.onMouseLeave.bind(this));

        this.canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.removeEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.removeEventListener('touchend', this.onTouchEnd.bind(this));
        this.canvas.removeEventListener('touchcancel', this.onTouchCancel.bind(this));

        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));

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
            keysPressed: Object.keys(this.keys).filter(k => this.keys[k]).length
        };
    }
}