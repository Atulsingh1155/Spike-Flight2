import { loadAssets } from '../utils/assetLoader.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.createLoadingBar();
        loadAssets(this);
        
        this.load.on('progress', (progress) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x00ff00);
            
            // ✅ FIX: Use responsive positioning for progress bar
            const { width, height } = this.cameras.main;
            const barWidth = width * 0.3; // 60% of screen width
            const barHeight = 30;
            const barX = (width - barWidth) / 2;
            const barY = height / 2;
            
            this.progressBar.fillRect(barX, barY, barWidth * progress, barHeight);
        });

        this.load.on('complete', () => {
            this.scene.start('MenuScene');
        });
    }

    createLoadingBar() {
        // ✅ FIX: Use responsive positioning for all loading elements
        const { width, height } = this.cameras.main;
        
        // Loading text - centered
        this.add.text(width / 2, height / 2 - 50, 'Loading Spike Flight...', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Progress bar background - centered and responsive
        const barWidth = width * 0.3; // 60% of screen width
        const barHeight = 30;
        const barX = (width - barWidth) / 2;
        const barY = height / 2;
        
        this.add.graphics()
            .fillStyle(0x444444)
            .fillRect(barX, barY, barWidth, barHeight);

        this.progressBar = this.add.graphics();
        
        // ✅ ADD: Loading percentage text
        this.percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // ✅ ADD: Update percentage on progress
        this.load.on('progress', (progress) => {
            this.percentText.setText(Math.round(progress * 100) + '%');
        });
    }
}