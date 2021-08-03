// Importing only necessary assets
import { Scene } from 'phaser';
import background from '../assets/backgrounds/menu_background.png'
import LevelScene from './level';

// const UserInterface = require("./userInterface.js");

const ROOM_WIDTH = 960;
const ROOM_HEIGHT = 640;
const LOGO_COLOR = 'lime';
const LOGO_STROKE = 'blue';

class MainMenu extends Phaser.Scene {
    // Initialization
    constructor() {
        super({ key: 'mainMenu' });
    }

    init() {
        
    }

    preload() {
        this.load.image('menu_background', background);
    }

    startGame(){
        this.scene.start('Level 1');
    }

    create() {
        // World Properties
        this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

        // Background
        this.add.image(0, 0, 'menu_background').setOrigin(0, 0);

        // Title screen: Replace with Logo
        this.add.text(200, 100, 'Mars Mayhem!', {
            fontFamily: 'Verdana',
            fontSize: '72px',
            fontStyle: 'bold',
            color: LOGO_COLOR,
            stroke: LOGO_STROKE,
            strokeThickness: '4'
        });

        // Clicking start text moves player to first level
        this.start_option = this.add.text(400, 400, 'Start', {
            fontFamily: 'Verdana',
            fontSize: '48px',
            fontStyle: 'bold',
            color: LOGO_COLOR,
            stroke: LOGO_STROKE,
            strokeThickness: '4'
        });
        this.start_option.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.start_option.width, this.start_option.height), Phaser.Geom.Rectangle.Contains);
        this.start_option.on('pointerdown', function() {
            this.scene.start('Level 1');
        }, this);

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });
    }

    
}

export default MainMenu;
