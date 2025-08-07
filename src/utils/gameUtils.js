// VFX Library
export class VFXLibrary {
    constructor(scene) {
        this.scene = scene;
    }
    
    shakeCamera(duration = 100, intensity = 5) {
        this.scene.cameras.main.shake(duration, intensity);
    }
    
    scaleGameObject(obj, scale = 1.1, duration = 500) {
        this.scene.tweens.add({
            targets: obj,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            repeat: -1
        });
    }
    
    addShine(obj, duration = 1000, alpha = 0.5) {
        this.scene.tweens.add({
            targets: obj,
            alpha: alpha,
            duration: duration,
            yoyo: true,
            repeat: -1
        });
    }
}

// Game utility functions
export function addEventListenersPhaser() {
    // Mock function for compatibility
    console.log('Event listeners added');
}

export function initiateGameOver(data) {
    console.log('Game Over! Score:', data.score);
    this.gameIsOver = true;
    this.scene.restart();
}

export function handlePauseGame() {
    if (this.scene.isPaused()) {
        this.scene.resume();
        console.log('Game resumed');
    } else {
        this.scene.pause();
        console.log('Game paused');
    }
}