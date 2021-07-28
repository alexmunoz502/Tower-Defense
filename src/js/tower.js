import images from '../assets/*.png';
const Bullet = require("./bullet.js")


class Tower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, towerData) {
        super(scene, x, y, towerData);

        this.setTexture(towerData.name)
        this.name = towerData.name;
        this.type = towerData.type;
        this.projectile = towerData.projectile;
        this.projectileSpeed = towerData.projectile_speed;
        this.projectileDuration = towerData.projectile_duration;
        this.accuracy = towerData.accuracy;
        this._damage = towerData.damage;
        this.scale = towerData.scale;
        this._rank = 0
        this._range = towerData.range;
        this.currentCD = 0;
        this._cooldown = towerData.cooldown;
        this.scene = scene;

        this.turret = new Phaser.Physics.Arcade.Sprite(scene, x, y, "basic_turret")
        this.turret.isTracking = false
        //this.turret.setTexture("basic_turret")

        // Adds enemy to scene
        scene.add.existing(this);
        scene.add.existing(this.turret)
        scene.registry.towers.add(this);

        this.body.debugShowBody = false;
    }

    update(time, delta) {
        this.attackEnemies(this.scene.registry.bullets, this.scene.registry.enemies);
    }

    attackEnemies(bullets, enemies) {
        for (const enemy of enemies.children.entries) {
            if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.x, this.y) <= this.range) {
                if (!this.turret.isTracking) {
                    this.turret.setRotation(this.getTurretAngleToEnemy(enemy));
                    this.turret.isTracking = true;
                }
                if (this.currentCD == 0) {
                    if (this.projectile !== null) {
                        this.scene.registry.bullets.add(new Bullet(this.scene, this, enemy));
                    }
                    else if (this.type == "stationary-aoe") {
                        // setting tint is only temp solution until aoe animation is implemented
                        this.setTint(0xfc0303);
                        this.areaAttack();
                    }
                    this.currentCD += 1;
                }
            }
        }
        this.turret.isTracking = false;
        if (this.currentCD != 0) {
            this.currentCD += 1;
        }
        if (this.currentCD >= this.cooldown) {
            this.currentCD = 0;
            // remove tint to show aoe tower is off cooldown
            this.clearTint();
        }
    }

    getTurretAngleToEnemy(enemy) {
        let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.turret.x, this.turret.y) - (90 * (180/Math.PI))
        return angle;
    }

    areaAttack() {
        for (const enemy of this.scene.registry.enemies.children.entries) {
            if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.x, this.y) <= this.range) {
                enemy.takeDamage(this.damage);
            }
        }
    }

    upgrade() {
        if (this._rank < 2) {
            this._rank += 1
            return this._rank
        }
    }

    get damage() {
        return this._damage[this._rank]
    }
    get range() {
        return this._range[this._rank]
    }
    get cooldown() {
        return this._cooldown[this._rank] * 60.0
    }
    get rank() {
        return this._rank + 1
    }

}
module.exports = Tower
