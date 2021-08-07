import data from "../data/enemies.json"
const Enemy = require("./enemy.js")

class EnemyManager {
    constructor(scene) {
        this._scene = scene;
    }

    addEnemy(x, y, enemyID) {
        var enemyData = data[enemyID];
        let newEnemy = new Enemy(this._scene, x, y, enemyData);
        this._scene.add.existing(newEnemy);
        this._scene.registry.enemies.add(newEnemy);
        return newEnemy;
    }

    addToPath(scene, path, enemyName) {
        let enemy = this.addEnemy(path.startX, path.startY, enemyName)
        var f = { t: 0, vec: new Phaser.Math.Vector2() };
        scene.tweens.add({
            targets: f,
            t: 1,
            ease: "Linear",
            duration: (path.length * 4) / enemy.speed,
            yoyo: false,
            repeat: 0
        });
        enemy.path = path;
        enemy.follower = f;
    }
}


module.exports = EnemyManager
