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
            this.mobileControls.leftBtn = this.scene.add.image(60, height - 80, 'leftimage')
                .setScrollFactor(0)
                .setDepth(100)
                .setScale(0.1)  // ← Better size
                .setAlpha(0.8)
                .setInteractive({ cursor: 'pointer' });
        } else {
            // Better fallback with proper size
            this.mobileControls.leftBtn = this.scene.add.circle(60, height - 80, 35, 0x333333, 0.8)
                .setScrollFactor(0)
                .setDepth(100)
                .setInteractive({ cursor: 'pointer' });
                
            this.scene.add.text(60, height - 80, '←', { 
                fontSize: '28px', 
                fill: '#ffffff',
                fontFamily: 'Arial'
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        }

        // Right arrow button with image
        if (this.scene.textures.exists('rightimage')) {
            this.mobileControls.rightBtn = this.scene.add.image(width - 60, height - 80, 'rightimage')
                .setScrollFactor(0)
                .setDepth(100)
                .setScale(0.1)  // ← Better size
                .setAlpha(0.8)
                .setInteractive({ cursor: 'pointer' });
        } else {
            // Better fallback with proper size
            this.mobileControls.rightBtn = this.scene.add.circle(width - 60, height - 80, 35, 0x333333, 0.8)
                .setScrollFactor(0)
                .setDepth(100)
                .setInteractive({ cursor: 'pointer' });
                
            this.scene.add.text(width - 60, height - 80, '→', { 
                fontSize: '28px', 
                fill: '#ffffff',
                fontFamily: 'Arial'
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        }

        // ✅ REMOVED: No more jump button in center - cleaner UI

        // ✅ FIX: Better button interactions with proper visual feedback
        
        // Left button events
        this.mobileControls.leftBtn.on('pointerdown', () => {
            this.mobileControls.leftPressed = true;
            this.mobileControls.leftBtn.setAlpha(0.2).setScale(0.15);
        });
        
        this.mobileControls.leftBtn.on('pointerup', () => {
            this.mobileControls.leftPressed = false;
            this.mobileControls.leftBtn.setAlpha(0.15).setScale(0.1);
        });
        
        this.mobileControls.leftBtn.on('pointerout', () => {
            this.mobileControls.leftPressed = false;
            this.mobileControls.leftBtn.setAlpha(0.15).setScale(0.1);
        });

        // Right button events
        this.mobileControls.rightBtn.on('pointerdown', () => {
            this.mobileControls.rightPressed = true;
            this.mobileControls.rightBtn.setAlpha(0.2).setScale(0.15);
        });
        
        this.mobileControls.rightBtn.on('pointerup', () => {
            this.mobileControls.rightPressed = false;
            this.mobileControls.rightBtn.setAlpha(0.15).setScale(0.1);
        });
        
        this.mobileControls.rightBtn.on('pointerout', () => {
            this.mobileControls.rightPressed = false;
            this.mobileControls.rightBtn.setAlpha(0.15).setScale(0.1);
        });

        // ✅ FIX: Simple and clean mobile instruction
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
        
        // ✅ FIX: Better jump area - tap anywhere except control areas
        const leftControlArea = pointer.x < 120 && pointer.y > gameHeight - 120;
        const rightControlArea = pointer.x > gameWidth - 120 && pointer.y > gameHeight - 120;
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