class CreditText extends Phaser.GameObjects.Text{
    constructor(scene, x, y, text, style){
        super(scene, x, y, text, style);
        this.scene = scene;
        this.scene.time.addEvent({
            delay: 300,
            callback: ()=>{
                this.destroy();
            },
            callbackScope: this,
        });
    }

    
}

module.exports = CreditText;