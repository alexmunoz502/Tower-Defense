// Importing only necessary assets
import { NONE, Scene } from 'phaser';
import backgrounds from '../assets/backgrounds/*.png'
import levelSelectTheme from '../assets/music/Level_Select_Theme.mp3'
import uiButton from '../assets/UI/UI_Button.png';
import uiButtonBlue from '../assets/UI/UI_Button_Blue.png';
import menuSFX from '../assets/sfx/menu*.mp3';
import UIButton from './uiButton.js'
import levelData from '../data/levels.json';

const ROOM_WIDTH = 918;
const ROOM_HEIGHT = 594;

class LevelSelect extends Phaser.Scene {
    // Initialization
    constructor() {
        super({ key: 'levelSelect' });
    }

    preload() {
        for (const backgroundImage in backgrounds) {
            this.load.image(backgroundImage, backgrounds[backgroundImage]);
        }
        this.load.image('ui_button', uiButton);
        this.load.image('play_button', uiButtonBlue);

        this.load.audio('level_select_theme', levelSelectTheme);

        for (const soundClip in menuSFX) {
            this.load.audio(`menu${soundClip}`, menuSFX[soundClip]);
        }

    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Level Select Properties
        this.selectedLevel = levelData["1"]
        this.levelPreview = {}

        // World Properties
        this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

        // Background
        this.add.image(0, 0, 'level_select').setOrigin(0, 0);

        // Level Select text
        this.add.text(54, 54, 'Level Select', {
            fontFamily: 'Verdana',
            color: '#434A5F',
            fontSize: 42
        });

        // Level 1 Button
        let levelOneButton = new UIButton(this, 94, 135, "1. A New Threat", 'menu_select', (levelName) => {
            this.selectLevel(levelName);
        }, '1')
        this.add.existing(levelOneButton)

        // Level 2 Button
        let levelTwoButton = new UIButton(this, 94, 216, "2. Recapture", 'menu_select', (levelName) => {
            this.selectLevel(levelName);
        }, '2')
        this.add.existing(levelTwoButton)

        // Level 3 Button
        let levelThreeButton = new UIButton(this, 94, 297, "3. Extermination", 'menu_select', (levelName) => {
            this.selectLevel(levelName);
        }, '3')
        this.add.existing(levelThreeButton)

        // Back to title Screen Button
        let backButton = new UIButton(this, 94, 486, "   Main Menu", 'menu_back', (levelName) => {
            music.stop();
            this.changeScene(levelName);
        }, 'mainMenu')
        this.add.existing(backButton)

        // Selected Level Information
        this.levelPreview.picture = this.add.image(378, 108, this.selectedLevel.background).setOrigin(0, 0)
        this.levelPreview.picture.scale = (1 / 5);

        this.levelPreview.name = this.add.text(594, 108, this.selectedLevel.name, {
            fontFamily: 'Verdana',
            color: '#9AC4F7',
            fontSize: 18
        });

        this.levelPreview.difficulty = this.add.text(594, 126, `Difficulty: ${this.selectedLevel.difficulty}`, {
            fontFamily: 'Verdana',
            color: '#9AC4F7',
            fontSize: 18
        })

        this.levelPreview.waveCount = this.add.text(594, 144, `Waves: ${this.getSelectedLevelWaveCount()}`, {
            fontFamily: 'Verdana',
            color: '#9AC4F7',
            fontSize: 18
        })

        this.levelPreview.description = this.add.text(378, 234, this.selectedLevel.description, {
            fontFamily: 'Verdana',
            color: '#9AC4F7',
            fontSize: 10,
            wordWrap: { width: 378, useAdvancedWrap: false }
        })

        // Play Level Button
        this.playLevelButton = new UIButton(this, 594, 180, "       PLAY", 'menu_select', (level) => {
            music.stop()
            this.changeScene(level);
        }, this.selectedLevel.name)
        this.playLevelButton.setTexture('play_button')
        this.add.existing(this.playLevelButton)

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });

        // Level Select music
        let music = this.sound.add('level_select_theme')
        music.setVolume(0.5);
        music.setLoop(true);
        music.play()
    }

    selectLevel(levelName) {
        this.selectedLevel = levelData[levelName]
        this.playLevelButton.callbackArgs = this.selectedLevel.name
        this.levelPreview.picture.setTexture(this.selectedLevel.background)
        this.levelPreview.name.text = this.selectedLevel.name
        this.levelPreview.difficulty.text = `Difficulty: ${this.selectedLevel.difficulty}`
        this.levelPreview.waveCount.text = `Waves: ${this.getSelectedLevelWaveCount()}`;
        this.levelPreview.description.text = this.selectedLevel.description
    }

    changeScene(levelName) {
        var levelScene = this.scene.get(levelName)
        if (levelScene._isSceneUsed) {
            this.scene.restart();
        } else {
            this.scene.start(levelName);
        }
    }

    getSelectedLevelWaveCount() {
        var waveCount = this.selectedLevel.waveData.length
        return waveCount
    }

}

export default LevelSelect;
