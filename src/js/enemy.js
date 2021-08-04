import images from '../assets/*.png';

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
            this.scene.decrementEnemyCount();
            this.scene.registry.enemies.remove(this, true, true);
        }
    }

}

module.exports = Enemy
