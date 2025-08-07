export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.isMuted = this.loadMuteState();
        this.audioContextStarted = false;
    }

    async startAudioContext() {
        if (!this.audioContextStarted && this.scene.sound.context) {
            try {
                await this.scene.sound.context.resume();
                this.audioContextStarted = true;
                console.log('Audio context started');
            } catch (error) {
                console.log('Failed to start audio context:', error);
            }
        }
    }

    loadSounds() {
    try {
        // ✅ FIX: Only load sounds that exist and handle errors gracefully
        const soundMappings = {
            'jumpSound': 'jump',
            'coinSound': 'coin', 
            'gameOverSound': 'gameOver',
            'backgroundMusic': 'background'
        };

        for (const [cacheKey, soundKey] of Object.entries(soundMappings)) {
            if (this.scene.cache.audio.exists(cacheKey)) {
                try {
                    this.sounds[soundKey] = this.scene.sound.add(cacheKey, { 
                        volume: soundKey === 'background' ? this.musicVolume : this.sfxVolume,
                        loop: soundKey === 'background'
                    });
                } catch (error) {
                    console.log(`Failed to create sound ${soundKey}:`, error);
                }
            } else {
                console.log(`Sound not found in cache: ${cacheKey}`);
            }
        }
    } catch (error) {
        console.log('Error loading sounds:', error);
    }
}

    async playSound(soundKey) {
        await this.startAudioContext();
        if (!this.isMuted && this.sounds[soundKey]) {
            try {
                this.sounds[soundKey].play();
            } catch (error) {
                console.log(`Failed to play sound ${soundKey}:`, error);
            }
        }
    }

   async playMusic() {
    try {
        await this.startAudioContext();
        if (!this.isMuted && this.sounds.background && !this.sounds.background.isPlaying) {
            this.sounds.background.play();
        }
    } catch (error) {
        console.log('Failed to play background music:', error);
    }
}

    stopMusic() {
        if (this.sounds.background) {
            this.sounds.background.stop();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMuteState();
        
        if (this.isMuted) {
            this.scene.sound.mute = true;
        } else {
            this.scene.sound.mute = false;
        }
    }

    loadMuteState() {
        return localStorage.getItem('spikeFlightMuted') === 'true';
    }

    saveMuteState() {
        localStorage.setItem('spikeFlightMuted', this.isMuted.toString());
    }
}