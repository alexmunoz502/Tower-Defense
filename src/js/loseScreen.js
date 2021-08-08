// Importing only necessary assets
import { Scene } from 'phaser';
import redRetroFont from '../assets/bitmaps/knight3_red.png'
import LevelScene from './level.js';

const ROOM_WIDTH = 960;
const ROOM_HEIGHT = 640;

class LoseScreen extends Phaser.Scene {
    // Initialization
    constructor() {
        super({ key: 'loseScreen' });
    }

    init(levelLostScene) {
        levelLostScene.registry.destroy();
        levelLostScene.events.off();
    }

    preload() {
        this.load.image('red_retro_font', redRetroFont);
    }

    create() {
        // World Properties
        this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
        
        // Game over message
        var gameOverFontConfig = {
            image: 'red_retro_font',
            width: 31,
            height: 25,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
            charsPerRow: 10,
            spacing: { x: 1, y: 1 }
        };
        this.cache.bitmapFont.add('retro_font', Phaser.GameObjects.RetroFont.Parse(this, gameOverFontConfig));
        this.gameOverFont = this.add.bitmapText(200, 200, 'retro_font', 'GAME OVER').setAlpha(0);
        this.gameOverFont.setScale(2);
        
        // Fade in animation
        this.start_tween = this.tweens.timeline({
            tweens: [
                {   
                    // Starts invisible
                    targets: this.gameOverFont, easing: 'Linear', duration: 0,  alpha: 0
                },
                {   
                    // Fades to visible
                    targets: this.gameOverFont, easing: 'Linear', duration: 3000,  alpha: 1
                },
                {   
                    // Holds visibility
                    targets: this.gameOverFont, easing: 'Linear', duration: 2000,  alpha: 1
                }
            ],
            onComplete: ()=>{
                this.cameras.main.fadeOut(2000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    //window.location.reload();
                    this.scene.start("levelSelect")
                });     
            }
        });

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });
    }

    
}

export default LoseScreen;
