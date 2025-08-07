import { ScoreManager } from '../managers/ScoreManager.js';
import { AudioManager } from '../managers/AudioManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

   create() {
    const { width, height } = this.cameras.main;
    
    // Initialize managers
    this.scoreManager = new ScoreManager();
    this.audioManager = new AudioManager(this);
    this.audioManager.loadSounds();
    
    // ✅ ADD: Setup Enter key listener
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on('down', () => this.startGame());

    // Background
    if (this.textures.exists('background')) {
        this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0, 0);
    } else {
        this.add.rectangle(width/2, height/2, width, height, 0x87CEEB);
    }

    // Title
    this.add.text(width/2, height/4, 'SPIKE FLIGHT', {
        fontSize: '48px',
        fill: '#ffffff',
        fontFamily: 'Arial Black',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width/2, height/4 + 60, 'Navigate through spikes and platforms!', {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Best Score
    this.add.text(width/2, height/2 - 50, `Best Score: ${this.scoreManager.getBestScore()}`, {
        fontSize: '24px',
        fill: '#ffff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Coins
    this.add.text(width/2, height/2 - 20, `Coins: ${this.scoreManager.getCoins()}`, {
        fontSize: '20px',
        fill: '#ffd700',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Start Button
    const startBtn = this.add.rectangle(width/2, height/2 + 50, 200, 60, 0x00aa00)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.startGame())
        .on('pointerover', () => startBtn.setFillStyle(0x00cc00))
        .on('pointerout', () => startBtn.setFillStyle(0x00aa00));

    this.add.text(width/2, height/2 + 50, 'START GAME', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Instructions Button
    const instructBtn = this.add.rectangle(width/2, height/2 + 130, 200, 50, 0x0066cc)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.showInstructions())
        .on('pointerover', () => instructBtn.setFillStyle(0x0088ee))
        .on('pointerout', () => instructBtn.setFillStyle(0x0066cc));

    this.add.text(width/2, height/2 + 130, 'HOW TO PLAY', {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Mute Button
    this.muteBtn = this.add.rectangle(width - 50, 50, 80, 50, 0x333333)
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.toggleMute());

    this.muteText = this.add.text(width - 50, 50, this.audioManager.isMuted ? '🔇' : '🔊', {
        fontSize: '24px'
    }).setOrigin(0.5);

    // ✅ ADD: Enter key instruction
    this.add.text(width/2, height - 60, 'Press ENTER to Start Game', {
        fontSize: '18px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    // Controls info
    this.add.text(width/2, height - 30, 'Use Arrow Keys or Touch to Move', {
        fontSize: '16px',
        fill: '#cccccc',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
}

async startGame() {
    try {
        // ✅ FIX: Start audio context and music on user interaction
        await this.audioManager.startAudioContext();
        this.audioManager.playMusic();
        this.audioManager.playSound('jump');
        
        // ✅ FIX: Add small delay to ensure everything is ready
        this.time.delayedCall(100, () => {
            this.scene.start('GameScene', { 
                scoreManager: this.scoreManager,
                audioManager: this.audioManager 
            });
        });
    } catch (error) {
        console.warn('Audio context failed to start:', error);
        // Start game anyway without audio
        this.scene.start('GameScene', { 
            scoreManager: this.scoreManager,
            audioManager: this.audioManager 
        });
    }
}

    showInstructions() {
        const { width, height } = this.cameras.main;
        
        // Create instruction popup
        const popup = this.add.container(width/2, height/2);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8);
        const title = this.add.text(0, -120, 'HOW TO PLAY', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        const instructions = this.add.text(0, -20, 
            '• Use Arrow Keys or Touch to move\n' +
            '• Avoid red spikes at the top\n' +
            '• Land on platforms to stay alive\n' +
            '• Collect coins for points\n' +
            '• Survive as long as possible!\n' +
            '• Press ENTER to start game quickly', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.rectangle(0, 100, 120, 40, 0xcc0000)
            .setInteractive({ cursor: 'pointer' })
            .on('pointerdown', () => popup.destroy());
            
        const closeText = this.add.text(0, 100, 'CLOSE', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        popup.add([bg, title, instructions, closeBtn, closeText]);
    }

    toggleMute() {
        this.audioManager.toggleMute();
        this.muteText.setText(this.audioManager.isMuted ? '🔇' : '🔊');
    }
}