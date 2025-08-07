// Working version with breathing effect added safely
export class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'coin') {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(0.05);
        this.body.setSize(24, 24);
        this.value = 10;
        this.collected = false;
        
        this.baseY = y;
        this.floatOffset = 0;
        
        // Simple floating animation
        this.floatTween = scene.tweens.add({
            targets: this,
            floatOffset: 15,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                this.y = this.baseY - this.floatOffset;
            }
        });
        
        // ✨ BREATHING EFFECT: Safe scale animation using custom property
        this.breathScale = 1.0; // Custom property for breathing
        this.breathTween = scene.tweens.add({
            targets: this,
            breathScale: 1.15, // Breathe up to 15% larger
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Apply breathing effect to base scale
                if (!this.collected) {
                    this.setScale(0.04 * this.breathScale);
                }
            }
        });
        
        // ✨ OPTIONAL: Gentle rotation for extra sparkle
        this.rotationTween = scene.tweens.add({
            targets: this,
            rotation: Math.PI * 2,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    update(backgroundSpeed) {
        if (this.collected) return;
        this.baseY -= backgroundSpeed;
        this.y = this.baseY - this.floatOffset;
    }

    collect() {
        if (this.collected) return;
        this.collected = true;
        
        // ✅ IMMEDIATE DESTRUCTION - Clean up all tweens
        if (this.floatTween) {
            this.floatTween.destroy();
            this.floatTween = null;
        }
        if (this.breathTween) {
            this.breathTween.destroy();
            this.breathTween = null;
        }
        if (this.rotationTween) {
            this.rotationTween.destroy();
            this.rotationTween = null;
        }
        
        this.destroy();
    }

    destroy() {
        // Clean up all tweens
        if (this.floatTween) {
            this.floatTween.destroy();
            this.floatTween = null;
        }
        if (this.breathTween) {
            this.breathTween.destroy();
            this.breathTween = null;
        }
        if (this.rotationTween) {
            this.rotationTween.destroy();
            this.rotationTween = null;
        }
        super.destroy();
    }
}