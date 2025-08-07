export const _CONFIG = {
    title: "Spike Flight",
    description: "Navigate through spikes and platforms",
    instructions: "Use arrow keys to move and avoid spikes",
    deviceOrientation: "landscape",
    orientationSizes: {
        landscape: {
            width: 800,
            height: 600
        },
        portrait: {
            width: 600,
            height: 800
        }
    },
    imageLoader: {
        // Updated paths to match your folder structure
        background: '/Assets/ui/background.png',  // ← Changed from /images/ to /ui/
        player: '/Assets/ui/player.png',
        platform: '/Assets/ui/platform.png',
        avoidable: '/Assets/ui/spike.png',
        bubbles: '/Assets/ui/bubbles.png'
    },
    soundsLoader: {
        // Updated path to match your folder structure
        background: '/Assets/audio/background.mp3'  // ← Changed from /sounds/ to /audio/
    }
};

export const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    pixelArt: true,
    antialias: false
};