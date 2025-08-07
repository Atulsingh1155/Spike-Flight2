export class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.cursors = null;
        this.mobileControls = {};
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
    
    // ✅ FIX: Better mobile control layout - only left and right arrows
    
    // Left arrow button with image
    if (this.scene.textures.exists('leftimage')) {
        this.mobileControls.leftBtn = this.scene.add.image(60, height - 160, 'leftimage') // ← MOVED UP from height - 120 to height - 160
            .setScrollFactor(0)
            .setDepth(100)
            .setScale(0.2)  // ← DOUBLED from 0.1 to 0.2
            .setAlpha(0.8)
            .setInteractive({ cursor: 'pointer' });
    } else {
        // Better fallback with proper size
        this.mobileControls.leftBtn = this.scene.add.circle(60, height - 160, 70, 0x333333, 0.8) // ← MOVED UP from height - 120 to height - 160
            .setScrollFactor(0)
            .setDepth(100)
            .setInteractive({ cursor: 'pointer' });
            
        this.scene.add.text(60, height - 160, '←', { // ← MOVED UP from height - 120 to height - 160
            fontSize: '56px',  // ← DOUBLED from 28px to 56px
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);
    }

    // Right arrow button with image
    if (this.scene.textures.exists('rightimage')) {
        this.mobileControls.rightBtn = this.scene.add.image(width - 60, height - 160, 'rightimage') // ← MOVED UP from height - 120 to height - 160
            .setScrollFactor(0)
            .setDepth(100)
            .setScale(0.2)  // ← DOUBLED from 0.1 to 0.2
            .setAlpha(0.8)
            .setInteractive({ cursor: 'pointer' });
    } else {
        // Better fallback with proper size
        this.mobileControls.rightBtn = this.scene.add.circle(width - 60, height - 160, 70, 0x333333, 0.8) // ← MOVED UP from height - 120 to height - 160
            .setScrollFactor(0)
            .setDepth(100)
            .setInteractive({ cursor: 'pointer' });
            
        this.scene.add.text(width - 60, height - 160, '→', { // ← MOVED UP from height - 120 to height - 160
            fontSize: '56px',  // ← DOUBLED from 28px to 56px
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);
    }


    // ✅ ALSO UPDATE: Button press interactions to match new size
    
    // Left button events
    this.mobileControls.leftBtn.on('pointerdown', () => {
        this.mobileControls.leftPressed = true;
        this.mobileControls.leftBtn.setAlpha(1).setScale(0.24); // ← DOUBLED from 0.12 to 0.24
    });
    
    this.mobileControls.leftBtn.on('pointerup', () => {
        this.mobileControls.leftPressed = false;
        this.mobileControls.leftBtn.setAlpha(0.8).setScale(0.2); // ← DOUBLED from 0.1 to 0.2
    });
    
    this.mobileControls.leftBtn.on('pointerout', () => {
        this.mobileControls.leftPressed = false;
        this.mobileControls.leftBtn.setAlpha(0.8).setScale(0.2); // ← DOUBLED from 0.1 to 0.2
    });

    // Right button events
    this.mobileControls.rightBtn.on('pointerdown', () => {
        this.mobileControls.rightPressed = true;
        this.mobileControls.rightBtn.setAlpha(1).setScale(0.24); // ← DOUBLED from 0.12 to 0.24
    });
    
    this.mobileControls.rightBtn.on('pointerup', () => {
        this.mobileControls.rightPressed = false;
        this.mobileControls.rightBtn.setAlpha(0.8).setScale(0.2); // ← DOUBLED from 0.1 to 0.2
    });
    
    this.mobileControls.rightBtn.on('pointerout', () => {
        this.mobileControls.rightPressed = false;
        this.mobileControls.rightBtn.setAlpha(0.8).setScale(0.2); // ← DOUBLED from 0.1 to 0.2
    });

    // ✅ FIX: Update touch area detection for larger buttons
     this.scene.add.text(width/2, height - 30, 'Tap screen to jump • Use arrows to move', {
        fontSize: '14px',
        fill: '#cccccc',
        fontFamily: 'Arial',
        align: 'center'
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setAlpha(0.8);
}

handlePointerDown(pointer) {
    const gameHeight = this.scene.cameras.main.height;
    const gameWidth = this.scene.cameras.main.width;
    
    // ✅ FIX: Update touch areas for moved up buttons
    const leftControlArea = pointer.x < 140 && pointer.y > gameHeight - 220; // ← UPDATED from gameHeight - 180 to gameHeight - 220
    const rightControlArea = pointer.x > gameWidth - 140 && pointer.y > gameHeight - 220; // ← UPDATED from gameHeight - 180 to gameHeight - 220
    const hudArea = pointer.y < 120; // Top HUD area
    
    // Allow jumping by tapping anywhere except control and HUD areas
    if (!leftControlArea && !rightControlArea && !hudArea) {
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
        if (this.jumpPressed) {
            this.scene.time.delayedCall(50, () => {
                this.jumpPressed = false;
            });
        }
    }
}