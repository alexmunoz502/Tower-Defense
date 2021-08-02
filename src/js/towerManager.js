import * as data from "../data/*.json"
const Tower = require("./tower.js")

class TowerManager {
    constructor(scene) {
        this._scene = scene;
    }

    addTower(x, y, towerName) {
        // Adds tower to scene
        var towerData = data[towerName];
        let newTower = new Tower(this._scene, x, y, towerData);
        this._scene.registry.towers.add(newTower);

        // Show/hide range display when mousing over tower.
        let rangeDisplay;
        newTower.setInteractive();
        newTower.on("pointerover", function (pointer) {
            rangeDisplay = newTower.scene.add.circle(newTower.x, newTower.y, newTower.range)
            rangeDisplay.setStrokeStyle(2, 0xfc0303)
        });
        newTower.on("pointerout", function (pointer) {
            rangeDisplay.destroy();
        });

        return newTower
    }
}


module.exports = TowerManager