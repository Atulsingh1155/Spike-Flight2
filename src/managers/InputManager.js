export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = null;
        this.mobileControls = {};
        // ✅ FIX: Initialize jumpPressed property
        this.jumpPressed = false;
        this.setupControls();
    }

    setupControls() {
        // Keyboard controls
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // Add WASD keys
        this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        
        // Mobile controls
        this.setupMobileControls();
        
        // Touch/pointer controls
        this.scene.input.on('pointerdown', this.handlePointerDown, this);
    }

    setupMobileControls() {
        if (this.scene.sys.game.device.input.touch) {
            // Create mobile control buttons
            this.createMobileButtons();
        }
    }

    createMobileButtons() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Left button
        this.mobileControls.leftBtn = this.scene.add.rectangle(80, height - 80, 120, 120, 0x000000, 0.3)
            .setScrollFactor(0)
            .setDepth(100)
            .setInteractive();
            
        this.scene.add.text(80, height - 80, '←', { fontSize: '40px', fill: '#fff' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        // Right button
        this.mobileControls.rightBtn = this.scene.add.rectangle(220, height - 80, 120, 120, 0x000000, 0.3)
            .setScrollFactor(0)
            .setDepth(100)
            .setInteractive();
            
        this.scene.add.text(220, height - 80, '→', { fontSize: '40px', fill: '#fff' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);

        // Setup button events
        this.mobileControls.leftBtn.on('pointerdown', () => this.mobileControls.leftPressed = true);
        this.mobileControls.leftBtn.on('pointerup', () => this.mobileControls.leftPressed = false);
        this.mobileControls.rightBtn.on('pointerdown', () => this.mobileControls.rightPressed = true);
        this.mobileControls.rightBtn.on('pointerup', () => this.mobileControls.rightPressed = false);
    }

  handlePointerDown(pointer) {
    // ✅ FIX: Only trigger jump in game area, not in UI
    const gameHeight = this.scene.cameras.main.height;
    const gameWidth = this.scene.cameras.main.width;
    
    // Avoid UI areas (top 100px for HUD, bottom 200px for mobile controls)
    if (pointer.y > 100 && pointer.y < gameHeight - 200 && 
        pointer.x > 50 && pointer.x < gameWidth - 50) {
        this.jumpPressed = true;
    }
}


    isLeftPressed() {
        return this.cursors.left.isDown || this.wasd.A.isDown || this.mobileControls.leftPressed;
    }

    isRightPressed() {
        return this.cursors.right.isDown || this.wasd.D.isDown || this.mobileControls.rightPressed;
    }

    isJumpPressed() {
        return this.cursors.up.isDown || this.wasd.W.isDown || this.jumpPressed;
    }
  update() {
    // ✅ FIX: Reset jump pressed after frame to prevent stuck input
    if (this.jumpPressed) {
        // Set a timeout to reset jump pressed
        this.scene.time.delayedCall(50, () => {
            this.jumpPressed = false;
        });
    }
}
}