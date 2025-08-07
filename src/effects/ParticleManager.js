export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
    }

    createJumpEffect(x, y) {
        this.scene.add.particles(x, y + 20, 'bubbles', {
            speed: { min: 30, max: 60 },
            scale: { start: 0.000001, end: 0 },
            lifespan: 400,
            quantity: 3,
            angle: { min: 60, max: 120 }
        });
    }

    createCoinEffect(x, y) {
        // Gold sparkle effect
        this.scene.add.particles(x, y, 'coin', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.4, end: 0 },
            lifespan: 500,
            quantity: 8,
            tint: 0xffff00
        });
    }

    createDeathEffect(x, y) {
        // Red explosion effect
        this.scene.add.particles(x, y, 'bubbles', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.06, end: 0 },
            lifespan: 800,
            quantity: 15,
            tint: 0xff0000
        });
    }

    createTrailEffect(player) {
        const trail = this.scene.add.particles(0, 0, 'bubbles', {
            speed: 50,
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            quantity: 1,
            frequency: 50,
            tint: 0x00ffff
        });
        
        trail.startFollow(player);
        return trail;
    }
}