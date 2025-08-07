import { _CONFIG } from '../config/gameConfig.js';
import { VFXLibrary, addEventListenersPhaser, initiateGameOver, handlePauseGame } from '../utils/gameUtils.js';
import { displayProgressLoader } from '../utils/assetLoader.js';
import { InputManager } from '../managers/InputManager.js';
import { ScoreManager } from '../managers/ScoreManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { ParticleManager } from '../effects/ParticleManager.js';
import { Player } from '../entities/Player.js';
import { Collectible } from '../entities/Collectible.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.platforms = null;
        this.coins = null;
        this.nailWall = null;
        this.backgroundSpeed = 0.8;
        this.lastPlatformY = 0;
        this.gameIsOver = false;
        this.difficultyLevel = 1;
        this.lastDifficultyIncrease = 0;
    }

  init(data) {
    this.scoreManager = data.scoreManager || new ScoreManager();
    this.audioManager = data.audioManager || new AudioManager(this);
    this.scoreManager.reset();
    
    // ✅ FIX: Complete reset of all game state variables
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.nailWall = null;
    this.backgroundSpeed = 0.8;
    this.lastPlatformY = 0;
    this.gameIsOver = false;
    this.difficultyLevel = 1;
    this.lastDifficultyIncrease = 0;
    this.playerTrail = null; // ✅ Initialize this properly
    
    // ✅ FIX: Reset physics world
    if (this.physics && this.physics.world) {
        this.physics.world.removeAllListeners();
    }
}

    preload() {
        displayProgressLoader.call(this);
        addEventListenersPhaser.bind(this)();
    }

   create() {
    // Initialize managers first
    this.inputManager = new InputManager(this);
    this.particleManager = new ParticleManager(this);
    this.vfx = new VFXLibrary(this);

    // Load sounds if not already loaded
    if (!this.audioManager.sounds.jump) {
        this.audioManager.loadSounds();
    }

    // ✅ FIX: Create in correct order
    this.createBackground();
    this.createCoins(); // ← Create coins group FIRST
    this.createSpikes();
    this.createPlayer();
    this.createPlatforms();
    this.createHUD();
    this.setupPhysics();
    this.startGameTimers();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => this.pauseGame());
    
    this.startGameTimers();

    // Start background music with error handling
    try {
        this.audioManager.playMusic();
    } catch (error) {
        console.log('Failed to start background music:', error);
    }
}
    createBackground() {
        const { width, height } = this.cameras.main;
        
        if (this.textures.exists('background')) {
            this.background = this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0, 0);
        } else {
            this.background = this.add.graphics();
            this.background.fillStyle(0x87CEEB);
            this.background.fillRect(0, 0, width, height);
        }
    }

    createSpikes() {
        this.nailWall = this.physics.add.staticGroup();
        const spikeCount = Math.ceil(this.cameras.main.width / 30);
        
        for (let i = 0; i < spikeCount; i++) {
            let nail;
            if (this.textures.exists('avoidable')) {
                nail = this.nailWall.create(i * 30, 20, 'avoidable').setScale(0.1);
            } else {
                nail = this.add.graphics();
                nail.fillStyle(0xff0000);
                nail.fillTriangle(0, 0, 20, 0, 10, 30);
                nail.x = i * 30;
                nail.y = 20;
                this.physics.add.existing(nail, true);
                this.nailWall.add(nail);
            }
            
            if (nail.body) {
                nail.body.setSize(nail.width || 20, nail.height || 30);
            }
            
            this.vfx.addShine(nail, 3000, 0.3);
        }
    }
createPlayer() {
    if (this.textures.exists('player')) {
        this.player = new Player(this, 400, 300);
    } else {
        // Create rectangle player with proper physics setup
        this.player = this.add.rectangle(400, 300, 32, 32, 0x00ff00);
        this.physics.add.existing(this.player);
        
        this.player.body.setCollideWorldBounds(true);
        
        // Add basic player methods for fallback
        this.player.update = (inputManager) => {
            const acceleration = 10;
            const maxSpeed = 170;
            const friction = 0.95;

            if (inputManager.isLeftPressed()) {
                this.player.setVelocityX(Math.max(this.player.body.velocity.x - acceleration, -maxSpeed));
            } else if (inputManager.isRightPressed()) {
                this.player.setVelocityX(Math.min(this.player.body.velocity.x + acceleration, maxSpeed));
            } else {
                this.player.setVelocityX(this.player.body.velocity.x * friction);
            }

            if (!this.player.onPlatform) {
                this.player.setVelocityY(this.player.body.velocity.y + 1.8);
            }
        };
        
        // Add missing methods for fallback player
        this.player.setPlatform = (platform) => {
            this.player.onPlatform = platform;
        };
        
        this.player.clearPlatform = () => {
            this.player.onPlatform = null;
        };
        
        this.player.onPlatform = null;
    }

    // ✅ FIX: Better trail effect using particles manager
    this.createPlayerTrail();
}

// ✅ NEW METHOD: Separate trail creation
createPlayerTrail() {
    try {
        if (this.textures.exists('bubbles')) {
            // Clean up existing trail
            if (this.playerTrail) {
                this.playerTrail.destroy();
                this.playerTrail = null;
            }
            
            this.playerTrail = this.add.particles(0, 0, 'bubbles', {
                speed: { min: 20, max: 40 },
                scale: { start: 0.01, end: 0 },
                lifespan: 1000,
                quantity: 1,
                frequency: 50,
                tint: 0x00ffff,
                alpha: 0.4,
                gravityY: -this.backgroundSpeed * 60,
                blendMode: 'ADD'
            });
            
            this.playerTrail.startFollow(this.player, 0, 15);
        }
    } catch (error) {
        console.log('Failed to create player trail:', error);
        this.playerTrail = null;
    }
}

    createPlatforms() {
        this.platforms = this.physics.add.group();
        this.createPlatform(400, 500); // Starting platform
    }

   createCoins() {
    // ✅ FIX: Ensure coins group is properly initialized
    if (this.coins) {
        this.coins.clear(true, true);
    }
    this.coins = this.physics.add.group();
}

    createHUD() {
        // Score display
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);

        // Coins display
        this.coinsText = this.add.text(20, 50, `Coins: ${this.scoreManager.getCoins()}`, {
            fontSize: '20px',
            fill: '#ffd700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);

        // Best score display
        this.bestScoreText = this.add.text(20, 80, `Best: ${this.scoreManager.getBestScore()}`, {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);

        // Pause button
        this.pauseButton = this.add.rectangle(this.cameras.main.width - 50, 50, 80, 50, 0x333333, 0.8)
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => this.pauseGame())
            .setScrollFactor(0)
            .setDepth(100);

        this.add.text(this.cameras.main.width - 50, 50, '⏸️', {
            fontSize: '24px'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    }

    setupPhysics() {
    // Player-platform collision
    this.physics.add.collider(this.player, this.platforms, (player, platform) => {
        if (player.body.velocity.y > 0) { // Only when falling down
            if (this.player.setPlatform) {
                this.player.setPlatform(platform);
            } else {
                this.player.onPlatform = platform;
            }
        }
    });

    // ✅ FIX: Player-coin collision with proper callback
    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
        if (coin && !coin.collected) { // Check if coin exists and not collected
            this.collectCoin(coin);
        }
    });

    // Player-spike collision
    this.physics.add.overlap(this.player, this.nailWall, () => {
        this.gameOver();
    });
}
    startGameTimers() {
        // Platform generation
        this.time.addEvent({
            delay: 1500,
            callback: this.createPlatformSequence,
            callbackScope: this,
            loop: true
        });

        // Score update
        this.time.addEvent({
            delay: 100,
            callback: this.updateScore,
            callbackScope: this,
            loop: true
        });

        // Difficulty increase
        this.time.addEvent({
            delay: 10000, // Every 10 seconds
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
    }
update() {
    // ✅ FIX: Check both game over and pause states
    if (this.gameIsOver || this.gamePaused) return;

    // Trail update
    if (this.playerTrail && this.playerTrail.active) {
        // Trail automatically follows player, no manual update needed
    } else if (this.textures.exists('bubbles') && !this.playerTrail) {
        this.createPlayerTrail();
    }

    // Update background
    if (this.background && this.background.tilePositionY !== undefined) {
        this.background.tilePositionY -= this.backgroundSpeed;
    }

    // Update player
    if (this.player && this.player.update) {
        this.player.update(this.inputManager);
    }

    // Update input manager
    if (this.inputManager && this.inputManager.update) {
        this.inputManager.update();
    }

    // Update platforms and check platform collision
    this.updatePlatforms();

    // Check for game over conditions
    this.checkGameOverConditions();

    // Update coins
    this.updateCoins();

    // Enhanced: More frequent random coins
    if (Phaser.Math.Between(1, 200) === 1) {
        this.spawnRandomCoin();
    }
}

    updatePlatforms() {
        this.platforms.children.entries.forEach(platform => {
            platform.y -= this.backgroundSpeed;
            platform.body.setVelocityY(-this.backgroundSpeed * 60);

            if (platform.y < -100) {
                platform.destroy();
            }

            // Check if player is on platform
            if (this.player.y <= platform.y - platform.displayHeight / 2 &&
                this.player.y >= platform.y - platform.displayHeight / 2 - this.player.displayHeight &&
                this.player.x >= platform.x - platform.displayWidth / 2 &&
                this.player.x <= platform.x + platform.displayWidth / 2) {
                
                if (this.player.setPlatform) {
                    this.player.setPlatform(platform);
                } else {
                    this.player.onPlatform = platform;
                }
            }
        });

        // Check if player left platform
        if (this.player.onPlatform &&
            (this.player.x < this.player.onPlatform.x - this.player.onPlatform.displayWidth / 2 ||
             this.player.x > this.player.onPlatform.x + this.player.onPlatform.displayWidth / 2)) {
            
            if (this.player.clearPlatform) {
                this.player.clearPlatform();
            } else {
                this.player.onPlatform = null;
            }
        }
    }

    updateCoins() {
    this.coins.children.entries.forEach(coin => {
        if (coin.collected) return; // Skip collected coins
        
        // ✅ FIX: Use the coin's update method for proper movement
        if (coin.update) {
            coin.update(this.backgroundSpeed);
        } else {
            // Fallback for non-Collectible coins
            coin.y -= this.backgroundSpeed;
        }
        
        // Remove coins that moved off screen
        if (coin.y < -50) {
            coin.destroy();
        }
    });
}


    checkGameOverConditions() {
        // Check if player fell off screen
        if (this.player.y > this.cameras.main.height * 0.94) {
            this.gameOver();
        }

        // Check spike collision (additional check)
        this.nailWall.getChildren().forEach(nail => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, nail.x, nail.y);
            
            if (distance < 30) {
                this.gameOver();
            }
        });
    }

   createPlatform(x, y) {
    let platform;
    if (this.textures.exists('platform')) {
        platform = this.physics.add.sprite(x, y, 'platform');
    } else {
        platform = this.add.rectangle(x, y, 100, 15, 0x8B4513);
        this.physics.add.existing(platform, true);
    }
    
    // Random platform width based on difficulty
    const minWidth = Math.max(70, 140 - (this.difficultyLevel * 8));   // ← Smaller starting size
const maxWidth = Math.max(90, 170 - (this.difficultyLevel * 8));   // ← Smaller maximum size
const width = Phaser.Math.Between(minWidth, maxWidth);

platform.displayWidth = width;
platform.displayHeight = 12; // ← Slightly thinner
    
    if (platform.refreshBody) {
        platform.refreshBody();
    }
    
    platform.setImmovable(true);
    platform.body.allowGravity = false;
    this.platforms.add(platform);
    
    // ✅ ENHANCED: Higher chance to spawn coins
    if (Phaser.Math.Between(1, 2) === 1) {  // ← 50% chance instead of 33%
        this.spawnCoin(x, y - 50);  // ← Spawn higher above platform
    }
    
    return platform;
}

    createPlatformSequence() {
        const minGap = Math.max(60, 120 - (this.difficultyLevel * 5));
        const maxGap = Math.max(80, 150 - (this.difficultyLevel * 5));
        const minX = this.cameras.main.width * 0.1;
        const maxX = this.cameras.main.width * 0.9;

        const platformCount = Phaser.Math.Between(2, 4);

        for (let i = 0; i < platformCount; i++) {
            const gap = Phaser.Math.Between(minGap, maxGap);
            this.lastPlatformY += gap;

            const x = Phaser.Math.Between(minX, maxX);
            this.createPlatform(x, this.cameras.main.height + this.lastPlatformY);
        }
    }

  spawnCoin(x, y) {
    // ✅ FIX: Better error handling for coins group
    if (!this.coins) {
        console.warn('Coins group not initialized, creating now...');
        this.createCoins();
    }

    if (!this.coins) {
        console.error('Failed to create coins group');
        return;
    }

    if (this.textures.exists('coin')) {
        const coin = new Collectible(this, x, y, 'coin');
        this.coins.add(coin);
    } else {
        // Enhanced fallback coin
        const coin = this.add.circle(x, y, 16, 0xffd700);
        this.physics.add.existing(coin);
        coin.body.setCircle(16);
        coin.value = 10;
        coin.baseY = y;
        coin.collected = false;
        
        // Add update method for fallback coins
        coin.update = (backgroundSpeed) => {
            if (!coin.collected) {
                coin.baseY -= backgroundSpeed;
                coin.y = coin.baseY;
            }
        };
        
        this.coins.add(coin);
        
        // Better animations for fallback
        const floatTween = this.tweens.add({
            targets: coin,
            y: y - 15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        const scaleTween = this.tweens.add({
            targets: coin,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Store tweens for cleanup
        coin.floatTween = floatTween;
        coin.scaleTween = scaleTween;
        
        // Override destroy method for cleanup
        const originalDestroy = coin.destroy;
        coin.destroy = function() {
            if (this.floatTween) this.floatTween.destroy();
            if (this.scaleTween) this.scaleTween.destroy();
            originalDestroy.call(this);
        };
    }
}

spawnRandomCoin() {
    const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
    const y = this.cameras.main.height + Phaser.Math.Between(50, 150);  // ← Varied height
    this.spawnCoin(x, y);
}

  collectCoin(coin) {
    // ✅ FIX: Check if coin is already collected
    if (coin.collected) return;
    
    // ✅ FIX: Increase score significantly when collecting coins
    const coinValue = coin.value || 10;
    this.scoreManager.addScore(coinValue * 5);  // ← 5x multiplier for coins!
    this.scoreManager.addCoin();
    
    // Play sound and create effect
    this.audioManager.playSound('coin');
    
    // ✅ ENHANCED: Show score popup
    const scorePopup = this.add.text(coin.x, coin.y - 30, `+${coinValue * 5}`, {
        fontSize: '20px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    
    this.tweens.add({
        targets: scorePopup,
        y: scorePopup.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => scorePopup.destroy()
    });
    
    // ✅ FIX: Call collect method which handles disappearing
    if (coin.collect) {
        coin.collect();
    } else {
        // Fallback for non-Collectible coins
        coin.destroy();
    }
    
    // Update HUD
    this.updateHUD();
}

    updateScore() {
        if (!this.gameIsOver) {
            this.scoreManager.addScore(1);
            this.updateHUD();
        }
    }

    updateHUD() {
        this.scoreText.setText(`Score: ${this.scoreManager.getCurrentScore()}`);
        this.coinsText.setText(`Coins: ${this.scoreManager.getCoins()}`);
        this.bestScoreText.setText(`Best: ${this.scoreManager.getBestScore()}`);
    }

    increaseDifficulty() {
        this.difficultyLevel++;
        this.backgroundSpeed += 0.1;
        
        // Show difficulty increase notification
        const notification = this.add.text(this.cameras.main.width/2, 200, `Level ${this.difficultyLevel}!`, {
            fontSize: '32px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        
        this.tweens.add({
            targets: notification,
            alpha: 0,
            y: 150,
            duration: 2000,
            onComplete: () => notification.destroy()
        });
    }

   gameOver() {
    if (this.gameIsOver) return;
    
    this.gameIsOver = true;
    
    // ✅ FIX: Complete cleanup before transitioning
    
    // Stop music
    this.audioManager.stopMusic();
    
    // Clean up trail effect
    if (this.playerTrail) {
        this.playerTrail.destroy();
        this.playerTrail = null;
    }
    
    // Clean up all coins and their tweens
    if (this.coins) {
        this.coins.children.entries.forEach(coin => {
            if (coin.destroy) {
                coin.destroy();
            }
        });
    }
    
    // Clean up all platforms
    if (this.platforms) {
        this.platforms.children.entries.forEach(platform => {
            if (platform.destroy) {
                platform.destroy();
            }
        });
    }
    
    // Create death effect
    this.particleManager.createDeathEffect(this.player.x, this.player.y);
    
    // Camera shake
    this.vfx.shakeCamera(300, 10);
    
    // Check for new record
    const isNewRecord = this.scoreManager.getCurrentScore() > this.scoreManager.getBestScore();
    
    // Transition to game over scene
    this.time.delayedCall(1000, () => {
        // Complete cleanup of scene
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.input.removeAllListeners();
        
        // Clear all physics groups
        if (this.platforms) this.platforms.clear(true, true);
        if (this.coins) this.coins.clear(true, true);
        if (this.nailWall) this.nailWall.clear(true, true);
        
        this.scene.start('GameOverScene', {
            score: this.scoreManager.getCurrentScore(),
            scoreManager: this.scoreManager,
            audioManager: this.audioManager,
            isNewRecord: isNewRecord
        });
    });
}

    // Replace the pauseGame method (around line 400)
pauseGame() {
    if (this.gamePaused) {
        // Resume game
        this.physics.resume();
        this.time.paused = false;
        this.anims.resumeAll();
        this.gamePaused = false;
        
        // Remove pause overlay
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null;
        }
        if (this.pauseText) {
            this.pauseText.destroy();
            this.pauseText = null;
        }
        
    } else {
        // Pause game
        this.physics.pause();
        this.time.paused = true;
        this.anims.pauseAll();
        this.gamePaused = true;
        
        // Create pause overlay
        this.pauseOverlay = this.add.rectangle(
            this.cameras.main.width/2, 
            this.cameras.main.height/2, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x000000, 
            0.7
        ).setScrollFactor(0).setDepth(1000);
        
        this.pauseText = this.add.text(
            this.cameras.main.width/2, 
            this.cameras.main.height/2, 
            'PAUSED', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    }
}
}