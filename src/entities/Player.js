// Add this method to reset player state:
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setScale(0.15);
        this.setCollideWorldBounds(true);
        this.body.setSize(this.width * 0.8, this.height * 0.8);
        
        // ✅ FIX: Reset all player properties properly
        this.jumpPower = 330;
        this.speed = 170;
        this.onPlatform = null;
        this.canDoubleJump = false;
        this.hasJumped = false;
        
        // ✅ FIX: Set initial position and velocity
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        
        // Animations
        this.createAnimations();
    }

    createAnimations() {
        // Idle animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.16,
            scaleY: 0.14,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(inputManager) {
    const acceleration = 10;
    const maxSpeed = this.speed;
    const friction = 0.95;

    // Horizontal movement
    if (inputManager.isLeftPressed()) {
        this.setVelocityX(Math.max(this.body.velocity.x - acceleration, -maxSpeed));
        this.setFlipX(true);
    } else if (inputManager.isRightPressed()) {
        this.setVelocityX(Math.min(this.body.velocity.x + acceleration, maxSpeed));
        this.setFlipX(false);
    } else {
        this.setVelocityX(this.body.velocity.x * friction);
    }

    // ✅ FIX: Better jumping logic
    if (inputManager.isJumpPressed() && this.onPlatform && !this.hasJumped) {
        this.jump();
        this.hasJumped = true;
    }

    // ✅ FIX: Reset jump flag when key released
    if (!inputManager.isJumpPressed()) {
        this.hasJumped = false;
    }

    // ✅ FIX: Better gravity and platform logic
    if (!this.onPlatform) {
        this.setVelocityY(this.body.velocity.y +2);
    } else {
        // Stick to platform
        this.y = this.onPlatform.y - this.onPlatform.displayHeight / 2 - this.displayHeight / 2;
        this.setVelocityY(this.onPlatform.body.velocity.y);
    }
}

    jump() {
    this.setVelocityY(-this.jumpPower);
    this.onPlatform = null;
    
    // Jump effect - ✅ FIX: Better particle settings
    if (this.scene.particleManager) {
        this.scene.particleManager.createJumpEffect(this.x, this.y);
    }
    if (this.scene.audioManager) {
        this.scene.audioManager.playSound('jump');
    }
    
    // Jump animation
    this.scene.tweens.add({
        targets: this,
        rotation: this.flipX ? -0.3 : 0.3,
        duration: 200,
        yoyo: true
    });
}

    setPlatform(platform) {
        this.onPlatform = platform;
    }

    clearPlatform() {
        this.onPlatform = null;
    }
}