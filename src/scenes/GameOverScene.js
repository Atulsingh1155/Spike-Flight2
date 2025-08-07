import { ScoreManager } from '../managers/ScoreManager.js';
import { AudioManager } from '../managers/AudioManager.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.scoreManager = data.scoreManager || new ScoreManager();
        this.audioManager = data.audioManager || new AudioManager(this);
        this.finalScore = data.score || 0;
        this.isNewRecord = data.isNewRecord || false;
        
        // Save the final score
        if (this.finalScore > this.scoreManager.getBestScore()) {
            this.scoreManager.addScore(this.finalScore - this.scoreManager.getCurrentScore());
        }
        
        // ✅ FIX: Add pause state tracking
        this.gamePaused = false;
        
        // Reset game state variables
        this.player = null;
        this.platforms = null;
        this.coins = null;
        this.nailWall = null;
        this.backgroundSpeed = 0.8;
        this.lastPlatformY = 0;
        this.gameIsOver = false;
        this.difficultyLevel = 1;
        this.lastDifficultyIncrease = 0;
        this.playerTrail = null;
        
        if (this.physics && this.physics.world) {
            this.physics.world.removeAllListeners();
        }
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // ✅ ADD: Setup Enter key listener for Play Again
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey.on('down', () => this.playAgain());
        
        // ✅ ADD: Setup ESC key listener for Main Menu
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => this.goToMenu());
        
        // Background
        if (this.textures.exists('background')) {
            this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0, 0).setAlpha(0.5);
        } else {
            this.add.rectangle(width/2, height/2, width, height, 0x000033);
        }

        // Dark overlay
        this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        
        // Game Over title
        this.add.text(width/2, height/4, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // New Record notification
        if (this.isNewRecord) {
            this.add.text(width/2, height/4 + 60, 'NEW RECORD!', {
                fontSize: '24px',
                fill: '#ffff00',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            // Celebration particles
            if (this.textures.exists('coin')) {
                this.add.particles(width/2, height/4 + 60, 'coin', {
                    speed: { min: 50, max: 150 },
                    scale: { start: 0.3, end: 0 },
                    lifespan: 1000,
                    quantity: 20,
                    tint: [0xffff00, 0xff8800, 0xff0000]
                });
            }
        }

        // Score display
        this.add.text(width/2, height/2 - 50, `Your Score: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 - 10, `Best Score: ${this.scoreManager.getBestScore()}`, {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 + 20, `Total Coins: ${this.scoreManager.getCoins()}`, {
            fontSize: '20px',
            fill: '#ffd700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Buttons
        const playAgainBtn = this.add.rectangle(width/2 - 120, height/2 + 100, 200, 50, 0x00aa00)
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.playAgain())
            .on('pointerover', () => playAgainBtn.setFillStyle(0x00cc00))
            .on('pointerout', () => playAgainBtn.setFillStyle(0x00aa00));

        this.add.text(width/2 - 120, height/2 + 100, 'PLAY AGAIN', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const menuBtn = this.add.rectangle(width/2 + 120, height/2 + 100, 200, 50, 0x0066cc)
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.goToMenu())
            .on('pointerover', () => menuBtn.setFillStyle(0x0088ee))
            .on('pointerout', () => menuBtn.setFillStyle(0x0066cc));

        this.add.text(width/2 + 120, height/2 + 100, 'MAIN MENU', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // ✅ ADD: Keyboard instructions
        this.add.text(width/2, height - 80, 'Press ENTER to Play Again', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(width/2, height - 50, 'Press ESC for Main Menu', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Play game over sound
        this.audioManager.playSound('gameOver');
    }

    playAgain() {
        this.audioManager.playSound('jump');
        
        // ✅ FIX: Clean up current scene before starting new game
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.input.removeAllListeners();
        
        // ✅ FIX: Restart GameScene with fresh state
        this.scene.start('GameScene', {
            scoreManager: this.scoreManager,
            audioManager: this.audioManager
        });
    }

    goToMenu() {
        this.audioManager.playSound('jump');
        
        // ✅ FIX: Clean up current scene
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.input.removeAllListeners();
        
        this.scene.start('MenuScene');
    }
}