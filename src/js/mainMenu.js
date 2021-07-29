// Importing only necessary assets
import background from '../assets/backgrounds/menu_background.png'

// const UserInterface = require("./userInterface.js");

const ROOM_WIDTH = 960;
const ROOM_HEIGHT = 640;

class MainMenu extends Phaser.Scene {
    // Initialization
    constructor() {
        super({ key: 'mainMenu' });
    }

    init() {
        // Game's initial options
        this.registry.set('background_music', 1); // 0 or 1
        this.registry.set('game_speed', 1); // 1, 1.5, 2
    }

    preload() {
        this.load.image('menu_background', background);
    }

    create() {
        // World Properties
        this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

        // Background
        this.add.image(0, 0, 'menu_background').setOrigin(0, 0);

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });
    }

    update() {
        
    }
}

export default MainMenu;
