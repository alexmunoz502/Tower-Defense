class UIButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, text, onPressSound, callback, callbackArgs){
        super(scene, x, y, 'ui_button')
        this.scene = scene;
        this.text = text;
        this.onPressSound = onPressSound;
        this.callback = callback;
        this.callbackArgs = callbackArgs;
        this.initailize();
    }

    initailize() {
        this.depth = 0;
        this.setOrigin(0, 0);
        this.setInteractive({ useHandCursor: true });
        this.on('pointerover', function() {
            this.scene.sound.play('menu_hover');
            this.setTint(0xAAAAAA)
        })
        this.on('pointerdown', function() {
            this.scene.sound.play(this.onPressSound);
            this.callback(this.callbackArgs);
        }, this);

        this.on('pointerout', function() {
            this.setTint(0xFFFFFF);
        })

        var text = this.scene.add.text(this.x + 36, this.y + 18, this.text, {
            fontFamily: 'Verdana',
            color: '#434A5F',
            fontSize: 12
        })
        text.depth = 1;
    }

}

module.exports = UIButton;