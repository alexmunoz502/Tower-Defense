const PREPARATION_THEME_COUNT = 5
const ACTION_THEME_COUNT = 6

class AudioManager {
    constructor(scene, musicFiles) {
        this._scene = scene;
        this._musicFiles = musicFiles
        this._music = {}
        this._song = null
        this._actionThemeCounter = Math.floor(Math.random() * (ACTION_THEME_COUNT - 1) + 1);
        this._preparationThemeCounter = Math.floor(Math.random() * (PREPARATION_THEME_COUNT -1) + 1);
        this._currentTrack = null;

        this._musicVolume = 0.5
    }

    initializeMusic() {
        for (const track in this._musicFiles) {
            this._music[track] = this._scene.sound.add(track);
        }
    }

    playMusic(type) {
        if (this._song) {
            this.fadeOutMusic()
        }
        switch (type) {
            case "main":
                this._currentTrack = "Main_Theme"
                break;
            case "level_select":
                this._currentTrack = "Level_Select_Theme"
                break;
            case "preparation":
                this._currentTrack = `Preparation_Theme_${this._preparationThemeCounter}`
                this._preparationThemeCounter += 1
                if (this._preparationThemeCounter > PREPARATION_THEME_COUNT) this._preparationThemeCounter = 1;
                break;
            case "action":
                this._currentTrack = `Action_Theme_${this._actionThemeCounter}`
                this._actionThemeCounter += 1
                if (this._actionThemeCounter > ACTION_THEME_COUNT) this._actionThemeCounter = 1;
                break;
            case "boss":
                this._currentTrack = "Boss_Theme"
                break;
            default:
                break; 
        }
        this._song = this._music[this._currentTrack]
        this._song.setLoop(true)
        this._song.setVolume(0)
        this._song.play()
        this.fadeInMusic()
    }

    fadeOutMusic() {
        this._scene.tweens.add({
            targets: this._song,
            volume: 0,
            duration: 1500,
            onCompleteScope: this._song,
            onComplete: this._song.stop
        })
    }

    fadeInMusic() {
        this._scene.tweens.add({
            targets: this._song,
            volume: this._musicVolume,
            duration: 5000,
            ease: 'Linear'
        })
    }

    playSound(soundName, hasRandomPitch=false, soundVolume=1) {
        if (hasRandomPitch) {
            this._scene.sound.play(soundName, {
                volume: soundVolume,
                detune: this.getRandomPitchShiftValue(),
            })
        } else {
            this._scene.sound.play(soundName, {
                volume: soundVolume
            });
        }
    }

    getRandomPitchShiftValue() {
        return Math.random() * (2000) - 1000;
    }
}

module.exports = AudioManager