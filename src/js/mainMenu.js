// Importing only necessary assets
import { Scene } from 'phaser';
import background from '../assets/backgrounds/menu_background.png'
import mainTheme from '../assets/music/Main_Theme.mp3'
import greenRetroFont from '../assets/bitmaps/knight3_green.png'
import redRetroFont from '../assets/bitmaps/knight3_red.png'
import LevelScene from './level.js';

const ROOM_WIDTH = 960;
const ROOM_HEIGHT = 640;

class MainMenu extends Phaser.Scene {
    // Initialization
    constructor() {
        super({ key: 'mainMenu' });
    }

    init() {
        
    }

    preload() {
        this.load.image('menu_background', background);
        this.load.audio('main_theme', mainTheme);
        this.load.image('green_retro_font', greenRetroFont);
        this.load.image('red_retro_font', redRetroFont);
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // World Properties
        this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

        // Background
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
        this.dynamic = this.add.bitmapText(200, 100, 'retro_font', ' MARS\nMAYHEM');
        this.dynamic.setScale(3);

        // --------------------------------------------------------
        // Clicking flashing start text moves player to first level
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
        this.start_option = this.add.bitmapText(250, 475, 'retro_font', ' START!');
        this.start_option.setScale(2);
        
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
            this.scene.start('levelSelect');
        }, this);
        

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });

        // Credit text
        this.add.text(320, 560, 'Created by Devin Leung, Alex Muñoz, and Ryan Ong\n      Music by Eric Matyas www.soundimage.org', {
            fontFamily: 'Arial',
            color: 'Black',
            fontSize: 14
        });

        // Main menu music
        let music = this.sound.add('main_theme')
        music.setVolume(0.5);
        music.setLoop(true);
        music.play()
    }

    
}

export default MainMenu;
