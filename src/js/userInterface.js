const CELL_SIZE = 54;
const CELL_OFFSET = CELL_SIZE / 2;

class UserInterface {
    constructor(scene) {
        this._scene = scene;
        this.placeholder = null;
        this.create();
    }

    create() {
        UI = this
        // Sidebar UI
        // In current config, this starts at x = 594, and extends to the right
        UI.sidebar = this._scene.add.rectangle(729, 300, 270, 600, 0x474c59);
        UI._scene.towerStats = this._scene.add.rectangle(729, 550, 270, 300, 0x272c59)
        UI._scene.towerStats.damage = this._scene.add.text(620, 420, "Damage")
        UI._scene.towerStats.range = this._scene.add.text(620, 460, "Range")
        UI._scene.towerStats.attackSpeed = this._scene.add.text(620, 500, "Attack Speed")
        UI.activeButton = false


        // Tower Placement Preview
        this.addToUI(650, 150, "basic_tower")
        this.addToUI(750, 150, "rapid_tower")
        this.addToUI(650, 250, "aoe_tower")


        // Player Health
        this._scene.add.text(674, 50, "Health: ");
        this._healthDisplay = this._scene.add.text(754, 50, this._scene.registry.get('base_health'));

        // Updates display of health when health changes
        this._scene.registry.events.on('changedata', this.updateHealth, this);
    }

    // Triggered when health value changes
    updateHealth(parent, key, data) {
        this._healthDisplay.setText(data);
    }



    update() {
        //console.log("MouseX: " + String(this._scene.game.input.mousePointer.worldX) + " MouseY: " + String(this._scene.game.input.mousePointer.worldY))
        // Snap tower preview to grid
        if (this.placeholder !== null) {
            this.placeholder.x = Math.floor(this._scene.game.input.mousePointer.worldX / CELL_SIZE) * CELL_SIZE + CELL_OFFSET
            this.placeholder.y = Math.floor(this._scene.game.input.mousePointer.worldY / CELL_SIZE) * CELL_SIZE + CELL_OFFSET
        }

        // Update player health info
        //this._healthDisplay.setText(this._scene.registry.health);
    }

    addToUI(x, y, towerName) {
        var tower_select = this._scene.add.sprite(x, y, towerName).setInteractive();
        tower_select.on("pointerdown", function (pointer) {

            UI.placeholder = UI._scene.add.sprite(x, y, towerName).setInteractive();
            UI.placeholder.scale = 1;
            UI.placeholder.alpha = 0.5;
            UI.placeholder.on("pointerdown", function (pointer) {
                if (UI.placeholder.x <= (UI.sidebar.x - UI.sidebar.geom.centerX)) {  // Stops towers from being placed out of bounds on sidebar
                    var newTowerX = Math.floor(UI.placeholder.x / CELL_SIZE) * CELL_SIZE + CELL_OFFSET
                    var newTowerY = Math.floor(UI.placeholder.y / CELL_SIZE) * CELL_SIZE + CELL_OFFSET
                    var newTower = UI._scene.addTower(newTowerX, newTowerY, towerName);
                    // Shows tower stats when selecting tower.
                    newTower.on("pointerdown", function (pointer) {
                        UI._scene.towerStats.damage.setText("Damage: " + newTower.damage)
                        UI._scene.towerStats.range.setText("Range: " + newTower.range)
                        UI._scene.towerStats.attackSpeed.setText("Cooldown: " + newTower.cooldown / 60.0)
                        // Adds upgradeButton to UI if tower is not at max rank
                        if (newTower.rank < 3 && !UI.activeButton) {
                            UI.addUpgradeButton(newTower)
                            UI.activeButton = newTower
                        }
                        // If another upgradeButton already exists in UI, remove it and add new one
                        else if (UI.activeButton !== newTower && newTower.rank < 3) {
                            UI.upgradeButton.destroy()
                            UI.addUpgradeButton(newTower)
                            UI.activeButton = newTower
                        }
                    });
                    if (!UI._scene.shiftKey.isDown) UI.placeholder.destroy(true);
                }
                else {
                    UI.placeholder.destroy(true);
                }
            });
        });
    }

    addUpgradeButton(tower) {
        UI.upgradeButton = this._scene.add.rectangle(700, 550, 100, 50, 0x46cf6b).setInteractive()
        UI.upgradeButton.on("pointerdown", function (pointer) {
            // remove button if tower is fully upgraded(rank 3)
            if (tower.upgrade() >= 2) {
                UI.upgradeButton.destroy()
                UI.activeButton = false
            }
            // Update tower stats display
            UI._scene.towerStats.damage.setText("Damage: " + tower.damage)
            UI._scene.towerStats.range.setText("Range: " + tower.range)
            UI._scene.towerStats.attackSpeed.setText("Cooldown: " + tower.cooldown / 60.0)
        });
    }

}

module.exports = UserInterface
