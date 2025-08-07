import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import { MenuScene } from './scenes/MenuScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import './style.css';

// Set up scenes
gameConfig.scene = [PreloadScene, MenuScene, GameScene, GameOverScene];

// Initialize game
const game = new Phaser.Game(gameConfig);

window.game = game;

// Handle window resize
function resizeGame() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }
    game.scale.refresh();
}

// Add event listeners
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', resizeGame);

// Initial resize
setTimeout(resizeGame, 100);