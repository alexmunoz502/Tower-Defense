import * as data from "../data/*.json"
const Tower = require("./tower.js")

class TowerManager {
    constructor(scene) {
        this._scene = scene;
    }

    addTower(x, y, towerName) {
        // Adds tower to scene
        var towerData = data[towerName];

        if (this._scene.getCredits() < towerData.cost) {
            // Can't Afford
            return null;
        }

        let newTower = new Tower(this._scene, x, y, towerData);
        this._scene.removeCredits(newTower.cost);
        this._scene.registry.towers.add(newTower);

        // Show/hide range display when mousing over tower.
        // let rangeDisplay;
        newTower.setInteractive({ cursor: 'pointer' });
        newTower.on("pointerdown", function () {
            if (this._scene.selectedTower != this) {
                this._scene.selectTower(this)
                this._scene._audioManager.playSound("tower_select");
            }
        });

        return newTower
    }

    getTowerCost(towerName) {
        return data[towerName].cost;
    }
}


module.exports = TowerManager