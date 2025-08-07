import { _CONFIG } from '../config/gameConfig.js';

export function loadAssets(scene) {
    // Load images - wrap in try/catch for each file
    for (const key in _CONFIG.imageLoader) {
        try {
            scene.load.image(key, _CONFIG.imageLoader[key]);
            scene.load.on('loaderror', (file) => {
                if (file.key === key) {
                    console.log(`Failed to load image: ${key} from ${_CONFIG.imageLoader[key]}`);
                }
            });
        } catch (error) {
            console.log(`Failed to load image ${key}:`, error);
        }
    }

    // Load sounds - wrap in try/catch for each file  
    for (const key in _CONFIG.soundsLoader) {
        try {
            scene.load.audio(key, [_CONFIG.soundsLoader[key]]);
            scene.load.on('loaderror', (file) => {
                if (file.key === key) {
                    console.log(`Failed to load sound: ${key} from ${_CONFIG.soundsLoader[key]}`);
                }
            });
        } catch (error) {
            console.log(`Failed to load sound ${key}:`, error);
        }
    }

    // Load additional audio files with error handling
    const audioFiles = [
        { key: 'jumpSound', path: '/Assets/audio/jump.wav' },
        { key: 'coinSound', path: '/Assets/audio/coin.mp3' },
        { key: 'gameOverSound', path: '/Assets/audio/gameover.mp3' },
        { key: 'backgroundMusic', path: '/Assets/audio/music.mp3' }
    ];

    audioFiles.forEach(audio => {
        try {
            scene.load.audio(audio.key, [audio.path]);
            scene.load.on('loaderror', (file) => {
                if (file.key === audio.key) {
                    console.log(`Failed to load audio: ${audio.key} from ${audio.path}`);
                }
            });
        } catch (error) {
            console.log(`Failed to load audio ${audio.key}:`, error);
        }
    });
    
    // Load UI assets with error handling
    const uiAssets = [
        { key: 'coin', path: '/Assets/ui/coin.png' },
        { key: 'button', path: '/Assets/ui/button.png' },
        // ✅ FIX: Correct paths for mobile control images
        { key: 'leftimage', path: '/Assets/ui/left.png' },
        { key: 'rightimage', path: '/Assets/ui/right.png' }
    ];

    uiAssets.forEach(asset => {
        try {
            scene.load.image(asset.key, asset.path);
            scene.load.on('loaderror', (file) => {
                if (file.key === asset.key) {
                    console.log(`Failed to load UI asset: ${asset.key} from ${asset.path}`);
                }
            });
        } catch (error) {
            console.log(`Failed to load UI asset ${asset.key}:`, error);
        }
    });
}


export function displayProgressLoader() {
    let width = 320;
    let height = 50;
    let x = (this.game.config.width / 2) - 160;
    let y = (this.game.config.height / 2) - 50;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, width, height);

    const loadingText = this.make.text({
        x: this.game.config.width / 2,
        y: this.game.config.height / 2 + 20,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    }).setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0x364afe, 1);
        progressBar.fillRect(x, y, width * value, height);
    });

    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
    });
}