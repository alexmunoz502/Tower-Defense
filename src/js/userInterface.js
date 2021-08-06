const { NONE } = require("phaser");

// Theme colors
const HUD_COLOR = '0xedf4ff';
const HUD_STROKE_COLOR = '0x696969';
const STROKE_COLOR = 'black';  // Default stroke color that stands out from HUD background
const TITLE_COLOR = 'blue';
const TITLE_STROKE_COLOR = 'cyan';
const CREDITS_COLOR = 'yellow';
const HEALTH_COLOR = 'red';
const DETAILS_BACKGROUND_COLOR = 'black';
const DETAILS_TEXT_COLOR = 'lime';
const DETAILS_STROKE_COLOR = '0x00FF00';

const CELL_SIZE = 54;
const CELL_OFFSET = CELL_SIZE / 2;

class UserInterface {
    constructor(scene) {
        this._scene = scene;
        this.towerPreview = null;
        this.activeButton = false;

        // NOTE: Creating UI from left to right

        // UI region
        this.hud = this._scene.add.sprite(459, 540, "HUD");

        // Health Value
        this.healthValue = this._scene.add.text(78, 509, this._scene.registry.get('base_health'), {
            fontFamily: 'Verdana',
            fontSize: '36px',
            fontStyle: 'bold',
            color: HEALTH_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '4'
        });

        // Health Title
        this.healthTitle = this._scene.add.text(78, 549, "Health", {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontWeight: 'bold',
            color: DETAILS_TEXT_COLOR
        });

        // Credits Value
        this.creditsLargeNumber = false
        this.creditsValue = this._scene.add.text(176, 509, this._scene.registry.get('credits'), {
            fontFamily: 'Verdana',
            fontSize: '36px',
            fontStyle: 'bold',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '4'
        });

        // Credits Title
        this.creditsTitle = this._scene.add.text(185, 549, "Credits", {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontWeight: 'bold',
            color: DETAILS_TEXT_COLOR
        });

        // ---------------------
        // Tower icons & titles
        // ---------------------
        var blaster = this.addTothis(this, 320, 531, "blaster");
        this.tower1Title = this._scene.add.text(302, 558, "100", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });

        var repeater = this.addTothis(this, 398, 531, "repeater");
        this.tower2Title = this._scene.add.text(380, 558, "200", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });

        var shocker = this.addTothis(this, 476, 531, "shocker");
        this.tower3Title = this._scene.add.text(460, 558, "250", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });

        // -----------------------

        // Tower Details Background
        //this.details = this._scene.add.rectangle(956, 635, 300, 90, DETAILS_BACKGROUND_COLOR).setOrigin(1, 1);
        //this.details.setStrokeStyle(2, DETAILS_STROKE_COLOR);

        // Damage Title + Value
        this.damageTitle = this._scene.add.text(729, 516, 'Damage:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });

        // Range Title + Value
        this.rangeTitle = this._scene.add.text(729, 534, 'Range:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });

        // Attack Speed + Title
        this.attackSpeedTitle = this._scene.add.text(729, 550, 'Cooldown:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });

        // Updates display of health and credit values when they change.
        this._scene.registry.events.on('changedata', this.updateValues, this);

        // Controls
        this.rangeDisplay = null;
    }

    // Triggered when health or credit values change
    // Add each updateable value to the switch statement
    updateValues(parent, key, data) {
        switch (key) {
            case 'base_health':
                this.healthValue.setText(data);
                break;
            case 'credits':
                this.creditsValue.setText(data);
                if (data < 1000 && this.creditsLargeNumber) {
                    // 3 figures, expand text, move right
                    this.creditsLargeNumber = false
                    this.creditsValue.setFontSize(36)
                    this.creditsValue.x += 2
                    this.creditsValue.y -= 6
                } else if (data > 999 && !this.creditsLargeNumber) {
                    // 4 figures, shrink text, move left
                    this.creditsLargeNumber = true
                    this.creditsValue.setFontSize(28)
                    this.creditsValue.x -= 2
                    this.creditsValue.y += 6
                }
                break;
        }
    }

    update() {
        // DEBUG: console.log("MouseX: " + String(this._scene.game.input.mousePointer.worldX) + " MouseY: " + String(this._scene.game.input.mousePointer.worldY))

        // Snap tower preview to grid
        if (this.towerPreview !== null) {
            this.towerPreview.x = this._scene.towerPlacementCursor.x
            this.towerPreview.y = this._scene.towerPlacementCursor.y
            this.towerPreview.turret.x = this.towerPreview.x
            this.towerPreview.turret.y = this.towerPreview.y
            if (!this._scene.towerPlacementCursor.isValid) {
                this.towerPreview.setTint(0xff0000);
                this.towerPreview.turret.setTint(0xff0000);
            } else {
                this.towerPreview.setTint(0xffffff)
                this.towerPreview.turret.setTint(0xffffff);
            }
        }
    }

    // Adds interactive tower icon to scene
    addTothis(towerParent, x, y, towerName) {
        var towerSelect = towerParent._scene.add.sprite(x, y, "tower_base").setInteractive();
        towerSelect.turret = towerParent._scene.add.sprite(x, y, towerName)

        // Clicking on a tower creates a floating transparent tower to preview placement.
        towerSelect.on("pointerdown", function (scene = this._scene) {
            if (this.scene.getTowerCost(towerName) > this.scene.getCredits()) {
                this.scene._audioManager.playSound("tower_error");
                return;
            }
            this.scene.enableTowerPlacementMode()
            console.log(x, y)
            towerParent.towerPreview = towerParent._scene.add.sprite(x, y, "tower_base").setInteractive();
            towerParent.towerPreview.turret = towerParent._scene.add.sprite(x, y, towerName);
            towerParent.towerPreview.alpha = 0.5;
            towerParent.towerPreview.turret.alpha = 0.5;

            // Clicking again adds a new tower to the scene at the given location.
            towerParent.towerPreview.on("pointerdown", function (pointer) {
                // Stops towers from being placed out of bounds on hud
                // NOTE: I'm not sure what value to put to adjust for the horizontal hud so it's a static value for now.
                if (towerParent.towerPreview.y <= (towerParent.hud.y - 54) && towerParent._scene.towerPlacementCursor.isValid) {
                    var newTowerX = Math.floor(towerParent.towerPreview.x / CELL_SIZE) * CELL_SIZE + CELL_OFFSET;
                    var newTowerY = Math.floor(towerParent.towerPreview.y / CELL_SIZE) * CELL_SIZE + CELL_OFFSET;
                    var newTower = towerParent._scene.addTower(newTowerX, newTowerY, towerName);

                    if (newTower == null) return;

                    // Mark grid space as occupied
                    towerParent._scene.grid[Math.floor(newTower.y / CELL_SIZE)][Math.floor(newTower.x / CELL_SIZE)] = true;

                    // Shows tower stats when selecting tower.
                    newTower.on("pointerdown", function (pointer) {
                        // Updates tower stat towerParent
                        towerParent.damageTitle.setText("Damage: " + newTower.damage);
                        towerParent.rangeTitle.setText("Range: " + newTower.range);
                        towerParent.attackSpeedTitle.setText("Cooldown: " + newTower.cooldown / 60.0);

                        // Adds upgradeButton to towerParent if tower is not at max rank
                        if (newTower.rank < 3 && !towerParent.activeButton) {
                            towerParent.addUpgradeButton(towerParent, newTower);
                            towerParent.activeButton = newTower;
                        }
                        // If another upgradeButton already exists in towerParent, remove it and add new one
                        else if (towerParent.activeButton !== newTower) {
                            towerParent.upgradeButton.destroy();
                            towerParent.activeButton = false
                            if (newTower.rank < 3) {
                                towerParent.addUpgradeButton(towerParent, newTower);
                                towerParent.activeButton = newTower;
                            }
                        }
                    });


                    // DEBUG: Placing multiple towers
                    if (!towerParent._scene.shiftKey.isDown || towerParent._scene.getTowerCost(towerName) > towerParent._scene.getCredits()) {
                        towerParent.towerPreview.turret.destroy(true);
                        towerParent.towerPreview.destroy(true);
                        towerParent._scene.disableTowerPlacementMode();
                    }
                }
                else {
                    // Invalid placement area
                    towerParent._scene._audioManager.playSound("tower_error");
                    //towerParent.towerPreview.turret.destroy(true);
                    //towerParent.towerPreview.destroy(true);
                }
            });
        });
        return towerSelect;
    }

    // Adds upgrade button to UI
    addUpgradeButton(buttonParent, tower) {
        buttonParent.upgradeButton = buttonParent._scene.add.image(608, 558, 'tower_base_upgrade').setOrigin(1, 1).setInteractive();
        buttonParent.deleteButton = buttonParent._scene.add.image(686, 558, 'tower_base_delete').setOrigin(1, 1).setInteractive();

        // Upgrades tower and updates text
        buttonParent.upgradeButton.on("pointerdown", function (pointer) {
            // remove button if tower is fully upgraded(rank 3)
            if ((this.scene.getCredits() > tower.upgradeCost) && tower.upgrade() >= 2) {
                buttonParent.upgradeButton.destroy();
                buttonParent.activeButton = false;
            }

            // Update tower stats display
            buttonParent.damageTitle.setText("Damage: " + tower.damage);
            buttonParent.rangeTitle.setText("Range: " + tower.range);
            buttonParent.attackSpeedTitle.setText("Cooldown: " + tower.cooldown / 60.0);
        });

        // Removes tower, refunds the base credits (no upgrade credits), removes buttons,
        // removes range, and clears stats
        buttonParent.deleteButton.on("pointerdown", function (pointer) {
            this.scene.addCredits(tower.cost);
            buttonParent.damageTitle.setText("Damage:");
            buttonParent.rangeTitle.setText("Range:");
            buttonParent.attackSpeedTitle.setText("Cooldown:");

            // TODO: play credit sound?
            buttonParent.grid[Math.floor(tower.y / CELL_SIZE)][Math.floor(tower.x / CELL_SIZE)] = false;
            tower.deleteTower();
            this.scene.getUserInterface().clearRangeDisplay();
            buttonParent.upgradeButton.destroy();
            buttonParent.deleteButton.destroy();
        });

    }

    // Displays the range information on a selected tower
    updateRangeDisplay(selectedTower) {
        this.rangeDisplay = selectedTower.scene.add.circle(
            selectedTower.x, selectedTower.y, selectedTower.range)
        this.rangeDisplay.setStrokeStyle(2, 0xfc0303)
    }

    clearRangeDisplay() {
        if (this.rangeDisplay != null) {
            this.rangeDisplay.destroy();
            this.rangeDisplay = null;
        }
    }

}

module.exports = UserInterface
