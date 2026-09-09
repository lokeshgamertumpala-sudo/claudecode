// Bootstrap for the Crowd Command arcade game
// This script loads the canvas, initializes UI, and starts the Game class

import { Game } from './core/Game.js';

// Helper to query DOM nodes for UI overlay elements
const ui = {
    hud: document.getElementById('hud'),
    levelInfo: document.getElementById('level-info'),
    crowd: document.getElementById('crowd-count'),
    goal: document.getElementById('goal-count'),
    score: document.getElementById('score-count'),
    wave: document.getElementById('wave-count'),
    levelNumber: document.getElementById('level-number'),
    coins: document.getElementById('coins-count'),
    message: document.getElementById('message'),
    restartBtn: document.getElementById('restart-btn'),
};

// Find canvas element
const canvas = document.getElementById('game-canvas');

if (!canvas) {
    console.error('Canvas element #game-canvas not found');
    throw new Error('Missing canvas');
}

// Instantiate game
const game = new Game(canvas, ui);

// Expose globally for debugging
window.game = game;

// Ensure UI events are wired after game init
ui.restartBtn.addEventListener('click', () => game.restart());
