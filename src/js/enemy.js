import images from '../assets/*.png';

const CreditText = require("./creditText.js");

class Enemy extends Phaser.Physics.Arcade.Sprite {
    // Initialization
    constructor(scene, x, y, enemyData, path) {
        super(scene, x, y, enemyData, path);
        this.scene = scene;
        this.path = path;

        this.setTexture(enemyData.texture);
        this.scale = enemyData.scale;

        // Private Attributes
        this._name = enemyData.name;
        this._health = enemyData.health;
        this._damage = enemyData.damage;
        this._speed = enemyData.speed;
        this._credits = enemyData.credits;


        // Adds enemy to scene
        scene.add.existing(this);
        scene.registry.enemies.add(this);

        // newEnemy.body.debugShowBody = false;
    }

    // Getters
    get name() {
        return this._name;
    }

    get health() {
        return this._health;
    }

    get damage() {
        return this._damage;
    }

    get speed() {
        return this._speed;
    }

    get credits() {
        return this._credits;
    }

    // Public Methods
    isDead() {
        return this._health <= 0 ? true : false;
    }

    takeDamage(damageValue) {
        this._health -= damageValue;
        if (this.isDead()) this.die();
    }

    die() {
        // TODO: death animation ?
        this.scene.addCredits(this._credits);

        // Credit amount appears briefly where enemy dies.
        this.credit_text = new CreditText(this.scene, this.x - 15, this.y - 15, this._credits, {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: 'yellow',
            stroke: 'black',
            strokeThickness: '2'
        });
        this.scene.add.existing(this.credit_text);

        this.scene.decrementEnemyCount();
        this.scene.registry.enemies.remove(this, true, true);


    }

    update() {
        // update the tween this enemy is 'following'
        this.path.getPoint(this.follower.t, this.follower.vec);

        // update enemy/sprite coordinates to match tween
        this.x = this.follower.vec.x;
        this.y = this.follower.vec.y;
        if (this.follower.t == 1) {
            this.scene.registry.set('base_health', (this.scene.registry.get('base_health') - this._damage));
            if (this.scene.registry.get('base_health') > 0) {
                this.scene.decrementEnemyCount();
                this.scene.registry.enemies.remove(this, true, true);
            }
        }
    }

}

module.exports = Enemy
