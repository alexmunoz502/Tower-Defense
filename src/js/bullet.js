const ROTATION_ADJUSTMENT = 90 * (Math.PI / 180)

class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene, parent, target) {
        super(scene, parent, target);

        this.setTexture(parent.projectile)
        this.scene = scene;
        this.parent = parent;
        this.x = this.parent.turret.x + (Math.sin(this.parent.turret.rotation) * -24); // makes it look like bullet is coming out of turret
        this.y = this.parent.turret.y + (Math.cos(this.parent.turret.rotation) * 24); // ''
        this.behavior = parent.type;
        this.speed = parent.projectileSpeed;
        this.damage = parent.damage;
        this.target = target;
        this.duration = parent.projectileDuration;
        this.stopTargeting = false
        this.depth = 1;
        this.accuracyVariation = Phaser.Math.FloatBetween(this.parent.accuracy - 1, 1 - this.parent.accuracy);
        this.rotation = this.parent.turret.rotation + this.accuracyVariation

        // Adds bullet to scene
        scene.add.existing(this);
        scene.registry.bullets.add(this);
    }

    getAngleToTarget() {
        // The base rotation is based off of the turret rotation, which is 
        // adjusted 90 degrees counter-clockwise because in Phaser3 0 degrees 
        // is right-facing and the turret sprites are down-facing. Since the
        // bullet is created with the turret rotation as its own rotation,
        // for homing to work, the updated angle must be adjusted as well.
        let angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y) + ROTATION_ADJUSTMENT;
        return angle;
    }

    update() {
        if (this.behavior == "homing" && this.target.active) {
            this.setRotation(this.getAngleToTarget())
        }


        if (!this.stopTargeting || this.behavior != "non-homing") {
            let targetPosition = {
                x: this.x - (this.speed * Math.sin(this.rotation)),
                y: this.y + (this.speed * Math.cos(this.rotation))
            };
            this.scene.physics.moveToObject(this, targetPosition, this.speed)
            this.stopTargeting = true;
        }
        this.checkCollision(this);
        this.duration -= 1;
        if (this.duration < 1) {
            this.destroy();
        }
    }

    checkCollision(bullet) {
        var scene = bullet.scene
        switch (this.behavior) {
            case "homing":
                if (Phaser.Math.Distance.Between(this.target.x, this.target.y, this.x, this.y) <= 20) {
                    if (this.target.active) {
                        this.target.takeDamage(this.damage)
                        this.scene.registry["bullets"].remove(this, true, true)
                    }
                }
                break
            case "non-homing":
                bullet.scene.registry["enemies"].children.iterate(function (enemy) {
                    if (bullet !== undefined && enemy !== undefined) {
                        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, bullet.x, bullet.y) <= 30) {
                            if (enemy.active) {
                                enemy.takeDamage(bullet.damage)
                            }
                            scene.registry["bullets"].remove(bullet, true, true)
                        }
                    }
                });
                break;
        }
    }
}
module.exports = Bullet;