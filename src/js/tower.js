import images from '../assets/*.png';
const Bullet = require("./bullet.js")
const ROTATION_ADJUSTMENT = 90 * (Math.PI / 180)

class Tower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, towerData) {
        super(scene, x, y, towerData);

        this.setTexture("tower_base")
        this._scene = scene
        this.name = towerData.name;
        this.type = towerData.type;
        this.cost = towerData.cost;
        this.sound = towerData.sound;
        this.soundVolume = towerData.sound_volume;
        this.projectile = towerData.projectile;
        this.projectileSpeed = towerData.projectile_speed;
        this.projectileDuration = towerData.projectile_duration;
        this.accuracy = towerData.accuracy;
        this._damage = towerData.damage;
        this._upgradeCost = towerData.upgrade_cost
        this.scale = towerData.scale;
        this._rank = 0
        this._range = towerData.range;
        this.currentCD = 0;
        this._cooldown = towerData.cooldown;
        this.scene = scene;

        this.turret = new Phaser.Physics.Arcade.Sprite(scene, x, y, towerData.name)
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
                    this.scene._audioManager.playSound(this.sound, true, this.soundVolume);
                    if (this.type != "stationary-aoe") {
                        this.scene.registry.bullets.add(new Bullet(this.scene, this, enemy));
                    }
                    else {
                        var attackSpriteBorder = this.scene.add.circle(this.x, this.y, this.range, '0xFFFFFF', 0.5)
                        var attackSprite = this.scene.add.circle(this.x, this.y, this.range - 5, '0x2CC5F6', 0.5);
                        setTimeout(() => {
                            attackSpriteBorder.destroy();
                            attackSprite.destroy();
                        }, 250);
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
        }
    }

    getTurretAngleToEnemy(enemy) {
        let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y,
            this.turret.x, this.turret.y) + ROTATION_ADJUSTMENT;
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
            this._scene._audioManager.playSound("tower_upgrade", true);
            this._scene.removeCredits(this.upgradeCost)
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
    get upgradeCost() {
        return this._upgradeCost[this._rank]
    }
    get rank() {
        return this._rank + 1
    }

    // Deletes the tower base and turret
    deleteTower() {
        this.scene.registry.towers.remove(this, true, true);
        this.turret.destroy();
        this.destroy();
    }

}
module.exports = Tower
