export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
    }

    create() {
        // Score display
        this.elements.scoreText = this.scene.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);

        // Coins display
        this.elements.coinsText = this.scene.add.text(20, 50, 'Coins: 0', {
            fontSize: '20px',
            fill: '#ffd700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);

        // Best score display
        this.elements.bestScoreText = this.scene.add.text(20, 80, 'Best: 0', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);
    }

    updateScore(score) {
        this.elements.scoreText.setText(`Score: ${score}`);
    }

    updateCoins(coins) {
        this.elements.coinsText.setText(`Coins: ${coins}`);
    }

    updateBestScore(bestScore) {
        this.elements.bestScoreText.setText(`Best: ${bestScore}`);
    }
}