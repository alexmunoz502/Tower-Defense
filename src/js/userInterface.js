const { NONE } = require("phaser");

// Theme colors
const HUD_COLOR = '0xedf4ff';
const HUD_STROKE_COLOR = '0x696969';
const STROKE_COLOR = 'black';  // Default stroke color that stands out from HUD background
const TITLE_COLOR = 'blue';
const TITLE_STROKE_COLOR = 'cyan';
const TIMER_COLOR = 'white';
const CREDITS_COLOR = 'yellow';
const HEALTH_COLOR = 'red';
const DETAILS_BACKGROUND_COLOR = 'black';
const DETAILS_TEXT_COLOR = 'lime';
const DETAILS_STROKE_COLOR = '0x00FF00';

// Depth Controls
const UI_DEPTH = 1;
const UI_HUD_DEPTH = 2;
const UI_TEXT_DEPTH = 3;

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
        this.hud.depth = 2;

        // Health Value
        this.healthValue = this._scene.add.text(78, 509, this._scene.registry.get('base_health'), {
            fontFamily: 'Verdana',
            fontSize: '36px',
            fontStyle: 'bold',
            color: HEALTH_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '4'
        });
        this.healthValue.depth = UI_TEXT_DEPTH;

        // Health Title
        this.healthTitle = this._scene.add.text(78, 549, "Health", {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontWeight: 'bold',
            color: DETAILS_TEXT_COLOR
        });
        this.healthTitle.depth = UI_TEXT_DEPTH;

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
        this.creditsValue.depth = UI_TEXT_DEPTH;

        // Credits Title
        this.creditsTitle = this._scene.add.text(185, 549, "Credits", {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontWeight: 'bold',
            color: DETAILS_TEXT_COLOR
        });
        this.creditsTitle.depth = UI_TEXT_DEPTH;

        // ---------------------
        // Tower icons & titles
        // ---------------------
        var blaster = this.addTothis(this, 320, 531, "blaster");
        this.tower1Title = this._scene.add.text(302, 558, "150", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        blaster.depth = UI_TEXT_DEPTH;
        this.tower1Title.depth = UI_TEXT_DEPTH;

        var repeater = this.addTothis(this, 398, 531, "repeater");
        this.tower2Title = this._scene.add.text(380, 558, "250", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        repeater.depth = UI_TEXT_DEPTH;
        this.tower2Title.depth = UI_TEXT_DEPTH;

        var shocker = this.addTothis(this, 476, 531, "shocker");
        this.tower3Title = this._scene.add.text(460, 558, "250", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        shocker.depth = UI_TEXT_DEPTH;
        this.tower3Title.depth = UI_TEXT_DEPTH;

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
        this.damageTitle.depth = UI_TEXT_DEPTH;

        // Range Title + Value
        this.rangeTitle = this._scene.add.text(729, 534, 'Range:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });
        this.rangeTitle.depth = UI_TEXT_DEPTH;

        // Attack Speed + Title
        this.attackSpeedTitle = this._scene.add.text(729, 550, 'Cooldown:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });
        this.attackSpeedTitle.depth = UI_TEXT_DEPTH;


        // Upgrade cost display
        this.upgradeCost = this._scene.add.text(564, 558, '', {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        this.upgradeCost.depth = UI_TEXT_DEPTH;

        // Updates display of health and credit values when they change.
        this._scene.registry.events.on('changedata', this.updateValues, this);

        // Controls
        this.rangeDisplay = null;

        // Wave Information
        this.waveNumberDisplay = this._scene.add.text(405, 162, `Wave #`, {
            fontFamily: 'Verdana',
            fontSize: '48px',
            fontStyle: 'normal',
            color: TIMER_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        })
        this.waveNumberDisplay.visible = false;
        this.waveNumberDisplay.depth = UI_TEXT_DEPTH;

        this.preparationTimer = this._scene.add.text(324, 422, "", {
            fontFamily: 'Verdana',
            fontSize: '36px',
            fontStyle: 'normal',
            color: TIMER_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        this.preparationTimer.depth = UI_TEXT_DEPTH;

        this.startNextWaveText = this._scene.add.text(369, 459, "Press [SPACE] to Start", {
            fontFamily: 'Verdana',
            fontSize: '18px',
            fontStyle: 'normal',
            color: TIMER_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        this.startNextWaveText.depth = UI_TEXT_DEPTH;
    }

    // Triggered when health or credit values change
    // Add each updateable value to the switch statement
    updateValues(parent, key, data) {
        if (data == null) return;
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


        this.preparationTimer.visible = !this._scene._isWaveInProgress;
        this.startNextWaveText.visible = !this._scene._isWaveInProgress;
    }

    updatePreparationTimer() {
        this.preparationTimer.text = `NEXT WAVE: ${20 - this._scene.getPreparationSecondsElapsed()}`;
    }

    // Adds interactive tower icon to scene
    addTothis(towerParent, x, y, towerName) {
        var towerSelect = towerParent._scene.add.sprite(x, y, "tower_base").setInteractive({ cursor: 'grab' });
        towerSelect.turret = towerParent._scene.add.sprite(x, y, towerName);
        towerSelect.turret.depth = UI_TEXT_DEPTH;

        // Clicking on a tower creates a floating transparent tower to preview placement.
        towerSelect.on("pointerdown", function (scene = this._scene) {
            if (this.scene.getTowerCost(towerName) > this.scene.getCredits()) {
                this.scene._audioManager.playSound("tower_error");
                return;
            }
            this.scene.enableTowerPlacementMode()
            console.log(x, y)
            towerParent.towerPreview = towerParent._scene.add.sprite(x, y, "tower_base").setInteractive({ cursor: 'grabbing' });
            towerParent.towerPreview.depth = UI_DEPTH;
            towerParent.towerPreview.turret = towerParent._scene.add.sprite(x, y, towerName);
            towerParent.towerPreview.turret.depth = UI_DEPTH;
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
                        towerParent.upgradeCost.setText(newTower.upgradeCost)
                        if (towerParent.deleteButton) {
                            towerParent.deleteButton.destroy();
                        }
                        towerParent.deleteButton = towerParent._scene.add.image(686, 558, 'tower_base_delete').setOrigin(1, 1).setInteractive({ cursor: 'pointer' });
                        towerParent.deleteButton.depth = UI_TEXT_DEPTH

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

                        // Removes tower, refunds the base credits (no upgrade credits), removes buttons,
                        // removes range, and clears stats
                        towerParent.deleteButton.on("pointerdown", function (pointer) {
                            this.scene.addCredits(newTower.cost);
                            towerParent.damageTitle.setText("Damage:");
                            towerParent.rangeTitle.setText("Range:");
                            towerParent.attackSpeedTitle.setText("Cooldown:");
                            towerParent.upgradeCost.setText('')

                            // TODO: play credit sound?
                            towerParent._scene.grid[Math.floor(newTower.y / CELL_SIZE)][Math.floor(newTower.x / CELL_SIZE)] = false;
                            newTower.deleteTower();
                            this.scene.getUserInterface().clearRangeDisplay();
                            towerParent.upgradeButton.destroy();
                            towerParent.deleteButton.destroy();
                        });
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
        buttonParent.upgradeButton = buttonParent._scene.add.image(608, 558, 'tower_base_upgrade').setOrigin(1, 1).setInteractive({ cursor: 'pointer' });
        buttonParent.upgradeButton.depth = UI_TEXT_DEPTH;
        buttonParent.upgradeCost.setText(tower.upgradeCost);
        buttonParent.upgradeCost.depth = UI_TEXT_DEPTH;

        // Upgrades tower and updates text
        buttonParent.upgradeButton.on("pointerdown", function () {
            // remove button if tower is fully upgraded(rank 3)
            this.scene._selectorSwitch = true;
            if ((this.scene.getCredits() >= tower.upgradeCost) && tower.upgrade() >= 2) {
                buttonParent.upgradeButton.destroy();
                buttonParent.activeButton = false;
            }

            // Update tower stats display
            buttonParent.damageTitle.setText("Damage: " + tower.damage);
            buttonParent.rangeTitle.setText("Range: " + tower.range);
            buttonParent.attackSpeedTitle.setText("Cooldown: " + tower.cooldown / 60.0);
            buttonParent.upgradeCost.setText(tower.upgradeCost)

            buttonParent.updateRangeDisplay(buttonParent._scene._selectedTower);
        });


    }

    // Displays the range information on a selected tower
    updateRangeDisplay(selectedTower) {
        if (this.rangeDisplay) {
            this.rangeDisplay.radius = selectedTower.range;
        } else {
            this.rangeDisplay = selectedTower.scene.add.circle(
                selectedTower.x, selectedTower.y, selectedTower.range)
            this.rangeDisplay.setStrokeStyle(2, 0xfc0303)
            this.rangeDisplay.depth = UI_DEPTH;
        }
    }

    clearRangeDisplay() {
        if (this.rangeDisplay != null) {
            this.rangeDisplay.destroy();
            this.rangeDisplay = null;
        }
    }

    // Showing Wave Number at start of wave
    showWaveNumber(waveNumber) {
        this.waveNumberDisplay.text = `Wave ${waveNumber}`
        this.waveNumberDisplay.visible = true;
        this._scene.time.addEvent({
            delay: 1300,
            callback: () => {
                this.waveNumberDisplay.visible = false;
            },
            callbackScope: this
        });
    }

}

module.exports = UserInterface
