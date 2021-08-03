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
        this.hud = this._scene.add.sprite(459, 540, "HUD")

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
            fontSize: '16px',
            fontStyle: 'bold',
            color: TITLE_COLOR,
            stroke: TITLE_STROKE_COLOR,
            strokeThickness: '2'
        });

        // Credits Value
        this.creditsValue = this._scene.add.text(182, 509, this._scene.registry.get('credits'), {
            fontFamily: 'Verdana',
            fontSize: '36px',
            fontStyle: 'bold',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '4'
        });

        // Credits Title
        this.creditsTitle = this._scene.add.text(182, 549, "Credits", {
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'bold',
            color: TITLE_COLOR,
            stroke: TITLE_STROKE_COLOR,
            strokeThickness: '2'
        });

        // ---------------------
        // Tower icons & titles
        // ---------------------
        this.addTothis(this, 320, 531, "blaster");
        this.tower1Title = this._scene.add.text(302, 558, "100", { 
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });

        this.addTothis(this, 398, 531, "repeater");
        this.tower2Title = this._scene.add.text(380, 558, "200", { 
            fontFamily: 'Verdana',
            fontSize: '16px',
            fontStyle: 'normal',
            color: CREDITS_COLOR,
            stroke: STROKE_COLOR,
            strokeThickness: '2'
        });
        
        this.addTothis(this, 482, 531, "shocker");
        this.tower3Title  = this._scene.add.text(464, 558, "250", { 
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
        this.damageTitle = this._scene.add.text(665, 516, 'Damage:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });

        // Range Title + Value
        this.rangeTitle = this._scene.add.text(665, 534, 'Range:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });

        // Attack Speed + Title
        this.attackSpeedTitle = this._scene.add.text(665, 550, 'Attack Speed:', {
            fontFamily: 'Verdana',
            fontSize: '12px',
            color: DETAILS_TEXT_COLOR
        });

        // Updates display of health and credit values when they change.
        this._scene.registry.events.on('changedata', this.updateValues, this);
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

    // Adds interactable tower icon to scene
    addTothis(towerParent, x, y, towerName) {
        var towerSelect = towerParent._scene.add.sprite(x, y, "tower_base").setInteractive();
        towerSelect.turret = towerParent._scene.add.sprite(x, y, towerName)

        // Clicking on a tower creates a floating transparent tower to preview placement.
        towerSelect.on("pointerdown", function (scene = this._scene) {
            this.scene.enableTowerPlacementMode()
            towerParent.towerPreview = towerParent._scene.add.sprite(x, y, "tower_base").setInteractive();
            towerParent.towerPreview.turret = towerParent._scene.add.sprite(x, y, towerName);
            towerParent.towerPreview.alpha = 0.5;
            towerParent.towerPreview.turret.alpha = 0.5;
            
            // Clicking again adds a new tower to the scene at the given location.
            towerParent.towerPreview.on("pointerdown", function (pointer) {
                // Stops towers from being placed out of bounds on hud
                // NOTE: I'm not sure what value to put to adjust for the horizontal hud so it's a static value for now.
                if (towerParent.towerPreview.y <= (towerParent.hud.y - 54)) {
                    var newTowerX = Math.floor(towerParent.towerPreview.x / CELL_SIZE) * CELL_SIZE + CELL_OFFSET;
                    var newTowerY = Math.floor(towerParent.towerPreview.y / CELL_SIZE) * CELL_SIZE + CELL_OFFSET;
                    var newTower = towerParent._scene.addTower(newTowerX, newTowerY, towerName);

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
                    if (!towerParent._scene.shiftKey.isDown) {
                        towerParent.towerPreview.turret.destroy(true);
                        towerParent.towerPreview.destroy(true);
                        towerParent._scene.disableTowerPlacementMode();
                    }
                }
                else {
                    // Invalid placement area
                    towerParent.towerPreview.turret.destroy(true);
                    towerParent.towerPreview.destroy(true);
                }
            });
        });
    }

    // Adds upgrade button to UI
    addUpgradeButton(buttonParent, tower) {
        buttonParent.upgradeButton = buttonParent._scene.add.rectangle(945, 625, 70, 70, '0x44ff00').setOrigin(1, 1).setInteractive();

        // Upgrades tower and updates text
        buttonParent.upgradeButton.on("pointerdown", function (pointer) {
            // remove button if tower is fully upgraded(rank 3)
            if (tower.upgrade() >= 2) {
                buttonParent.upgradeButton.destroy();
                buttonParent.activeButton = false;
            }

            // Update tower stats display
            buttonParent.damageTitle.setText("Damage: " + tower.damage);
            buttonParent.rangeTitle.setText("Range: " + tower.range);
            buttonParent.attackSpeedTitle.setText("Cooldown: " + tower.cooldown / 60.0);
        });
    }

}

module.exports = UserInterface
