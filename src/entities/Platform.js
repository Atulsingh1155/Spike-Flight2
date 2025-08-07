export class Platform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'platform') {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Static body
        
        this.displayWidth = 150;
        this.displayHeight = 15;
        this.refreshBody();
        
        this.setImmovable(true);
        this.body.allowGravity = false;
    }
}