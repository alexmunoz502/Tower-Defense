// Importing only necessary assets
import { Scene } from 'phaser';
import background from '../assets/backgrounds/win_background.png'
import mainTheme from '../assets/music/Main_Theme.mp3'
import greenRetroFont from '../assets/bitmaps/knight3_green.png'
import redRetroFont from '../assets/bitmaps/knight3_red.png'
import LevelScene from './level.js';

const ROOM_WIDTH = 960;
const ROOM_HEIGHT = 640;

class WinScreen extends Phaser.Scene {
    // Initialization
    constructor() {
        super({ key: 'winScreen' });
    }

    init(levelWonScene) {
        levelWonScene.registry.destroy();
        levelWonScene.events.off();
    }

    preload() {
        this.load.image('win_background', background);
        this.load.audio('main_theme', mainTheme);
        this.load.image('green_retro_font', greenRetroFont);
        this.load.image('red_retro_font', redRetroFont);
    }

    create() {
        // World Properties
        this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

        // Background
        // TODO: Replace with alternate background
        this.add.image(0, 0, 'menu_background').setOrigin(0, 0); 

        // Logo
        var titleFontConfig = {
            image: 'green_retro_font',
            width: 31,
            height: 25,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
            charsPerRow: 10,
            spacing: { x: 1, y: 1 }
        };
        this.cache.bitmapFont.add('retro_font', Phaser.GameObjects.RetroFont.Parse(this, titleFontConfig));
        this.dynamic = this.add.bitmapText(30, 100, 'retro_font', 'STELLAR WORK! MARS\nIS SAFE... FOR NOW!');
        this.dynamic.setScale(1.5);

        // --------------------------------------------------------
        // Clicking flashing text moves player to title screen
        // --------------------------------------------------------
        // Adding bitmap text to scene
        var startFontConfig = {
            image: 'red_retro_font',
            width: 31,
            height: 25,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
            charsPerRow: 10,
            spacing: { x: 1, y: 1 }
        };
        this.cache.bitmapFont.add('retro_font', Phaser.GameObjects.RetroFont.Parse(this, startFontConfig));
        this.start_option = this.add.bitmapText(100, 500, 'retro_font', 'RETURN TO LEVEL SELECT');
        this.start_option.setScale(1);
        
        // Fade in/out animation
        this.start_tween = this.tweens.timeline({
            tweens: [
                {   
                    // Starts invisible
                    targets: this.start_option, easing: 'Linear', duration: 0,  alpha: 0
                },
                {   
                    // Fades to visible
                    targets: this.start_option, easing: 'Linear', duration: 1000,  alpha: 1
                },
                {
                    // Holds visibility
                    targets: this.start_option, easing: 'Linear', duration: 500,  alpha: 1
                },
                {
                    // Returns back to invisible
                    targets: this.start_option, easing: 'Linear', duration: 1000,  alpha: 0
                }
            ],
            loop: -1
        });
        
        // Clicking action
        this.start_option.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.start_option.width, this.start_option.height), Phaser.Geom.Rectangle.Contains);
        this.start_option.on('pointerdown', function() {
            music.stop();
            this.scene.start("levelSelect");
        }, this);
        

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });

        // Victory music
        let music = this.sound.add('main_theme')
        music.setVolume(0.5);
        music.setLoop(true);
        music.play()
    }

    
}

export default WinScreen;
