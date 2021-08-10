import images from '../assets/*.png';
import UISprites from '../assets/UI/*.png';
import backgroundImages from '../assets/backgrounds/*.png';
import musicTracks from '../assets/music/*.mp3';
import soundFX from '../assets/sfx/*.mp3';

import towerSprites from '../assets/towers/*.png';
import bulletSprites from '../assets/bullets/*.png';
import enemySprites from '../assets/enemies/*.png';

const UserInterface = require("./userInterface.js");
const TowerManager = require("./towerManager.js");
const EnemyManager = require("./enemyManager.js");
const AudioManager = require("./audioManager.js");
const Bullet = require("./bullet.js");
const Tower = require("./tower.js");
const Enemy = require("./enemy.js");

const CELL_SIZE = 54;
const CELL_OFFSET = CELL_SIZE / 2;


class LevelScene extends Phaser.Scene {
    // Initialization
    constructor(levelData) {
        super({ key: levelData.name });

        // Private scene properties
        this._levelData = levelData;
        this.resetPrivateAttributes();

    }

    init() {
        // Scene's registry data
        this.registry.set('credits', this._levelData.startingCredits);
        this.registry.set('base_health', 20);
        this.registry.events.on('changedata', this.loseIfDead, this);
    }

    resetPrivateAttributes() {
        // Private scene properties
        this._isSceneUsed = false;

        // State Control
        this._isLevelWon = false
        this._secondsElapsed = 0
        this._isWaveInProgress = false
        this._enemyCount = 0

        // Tower Controls
        this._selectedTower = null
        this._selectorSwitch = false // prevents deselect executing on select
        this._towerPlacingMode = false
        this.towerPlacementCursor = { x: 0, y: 0, previousX: 0, previousY: 0, isValid: false };

        // Wave Data
        this._waveData = this._levelData.waveData
        this._currentWaveIndex = -1
        this._currentWave = this._waveData[this._currentWaveIndex]
        this._waveCount = this._waveData.length

        // 2d array to track occupied spaces
        this._grid = [];
    }

    preload() {
        // Load Game Assets
        // -- Tower Sprites
        for (const spriteName in towerSprites) {
            this.load.image(spriteName, towerSprites[spriteName]);
        }

        // -- Bullet Sprites
        for (const spriteName in bulletSprites) {
            this.load.image(spriteName, bulletSprites[spriteName]);
        }

        // -- Enemy Sprites
        for (const spriteName in enemySprites) {
            this.load.image(spriteName, enemySprites[spriteName]);
        }

        // -- UI
        for (const spriteName in UISprites) {
            this.load.image(spriteName, UISprites[spriteName]);
        }

        // -- Background Image
        var bgImageName = this._levelData.background;
        this.load.image(bgImageName, backgroundImages[bgImageName]);

        // -- Audio - Music
        for (const track in musicTracks) {
            this.load.audio(track, musicTracks[track]);
        }

        // -- Audio - SFX
        for (const soundClip in soundFX) {
            this.load.audio(soundClip, soundFX[soundClip]);
        }
    }

    create() {
        if (this.scene._isSceneUsed) this.resetPrivateAttributes();
        this.scene._isSceneUsed = true;
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // World Properties
        this.physics.world.setBounds(0, 0, this._levelData.width, this._levelData.height);

        // Background
        this.add.image(459, 297, this._levelData.background);

        // Set game grid to correct size
        for (let i = 0; i < (this.game.config.height / CELL_SIZE); i++) {
            this._grid.push([])
        }


        // Physics groups
        // NOTE: These physics groups were added indirectly by manager classes, but since
        // the scene owns the physics group, they should be created here.
        this.registry.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.registry.towers = this.physics.add.group({ classType: Tower, runChildUpdate: true });
        this.registry.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // Controls
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Initialize Managers
        this._audioManager = new AudioManager(this, musicTracks);
        this._audioManager.initializeMusic();
        this._audioManager.playMusic("preparation")
        this._userInterface = new UserInterface(this);
        this._enemyManager = new EnemyManager(this, this._levelData.waveData);
        this._towerManager = new TowerManager(this);

        // Use Level Data to populate level
        // - spawn base
        // - create path from points, pass path to wave manager?
        let graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffffff, 1);

        let paths = {};
        let i = 1;
        for (const path in this._levelData.paths) {
            let pathData = this._levelData.paths[path]
            paths[i] = this.add.path();
            paths[i].length = 0;
            for (var j = 0; j < pathData.length; j++) {
                var lineData = pathData[j];
                paths[i].length += Math.abs(lineData[2] - lineData[0])
                paths[i].length += Math.abs(lineData[3] - lineData[1])
                paths[i].add(new Phaser.Curves.Line(lineData));
                if (j == 0) {
                    paths[i].startX = lineData[0];
                    paths[i].startY = lineData[1];
                }
            }
            i++;
        }
        this.paths = paths;
        // DEBUG:
        // for (const path in this.paths) {
        //     this.paths[path].draw(graphics);
        // }
        // -------------------------
        // DEBUG Tools
        // -------------------------


        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', (pointer) => {
            if (this._selectedTower && !this._selectorSwitch) {
                this.deselectTower();
            } else {
                this._selectorSwitch = false;
            }
        }, this);

        // // Increase credits
        // this.input.keyboard.on('keydown-C', () => {
        //     this.registry.set('credits', this.registry.get('credits') + 1000);
        // }, this);


    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            if (this._isWaveInProgress == false) {
                this._userInterface.showWaveNumber(this._currentWaveIndex + 2);
                this.nextWave();
            }
        }

        this._userInterface.update();


        this.towerPlacementCursor.x = Math.floor(this.game.input.mousePointer.worldX / CELL_SIZE) * CELL_SIZE + CELL_OFFSET
        this.towerPlacementCursor.y = Math.floor(this.game.input.mousePointer.worldY / CELL_SIZE) * CELL_SIZE + CELL_OFFSET

        if (this._towerPlacingMode) {

            if ((this.towerPlacementCursor.x != this.towerPlacementCursor.previousX) || (this.towerPlacementCursor.y != this.towerPlacementCursor.previousY)) {
                this.towerPlacementCursor.isValid = this.checkTowerPlacementValidity();
            }

            this.towerPlacementCursor.previousX = this.towerPlacementCursor.x
            this.towerPlacementCursor.previousY = this.towerPlacementCursor.y
        }

        if (this._isWaveInProgress) {
            if (this._enemyCount <= 0) {
                this._audioManager.playSound("wave_end");
                this._isWaveInProgress = false
                this._audioManager.playMusic("preparation");
                if (this._currentWaveIndex == this._waveCount - 1) {
                    this.cleanUp();
                    this._isLevelWon = true;
                    this.scene.start('winScreen', this);
                }
                if (!this._isLevelWon) {
                    this.setPreparationTimer();
                }
            }
        }
    }
    // Getters
    getCredits() {
        return this.registry.get('credits');
    }

    getTowerCost(towerName) {
        return this._towerManager.getTowerCost(towerName);
    }

    // Setters
    addCredits(amount) {
        var newCreditAmount = Math.min(this.getCredits() + amount, 9999);
        this.registry.set('credits', newCreditAmount);
    }

    removeCredits(amount) {
        var newCreditAmount = Math.max(this.getCredits() - amount, 0);
        this.registry.set('credits', newCreditAmount);
    }

    decrementEnemyCount() {
        this._enemyCount -= 1
    }

    get selectedTower() {
        return this._selectedTower;
    }

    selectTower(tower) {
        if (this._selectedTower) this.deselectTower();
        this._selectorSwitch = true;
        this._selectedTower = tower;
        this._userInterface.updateRangeDisplay(tower);
    }

    deselectTower() {
        if (this._selectedTower) {
            this._selectedTower = null;
            this._userInterface.clearRangeDisplay();
        }
    }

    // Actions
    // -- Towers
    enableTowerPlacementMode() {
        this._towerPlacingMode = true;
        this._audioManager.playSound("tower_pickup");
    }

    disableTowerPlacementMode() {
        this._towerPlacingMode = false
    }

    addTower(x, y, towerName) {
        if (this.towerPlacementCursor.isValid) {
            var newTower = this._towerManager.addTower(x, y, towerName)
            if (newTower != null) {
                this._audioManager.playSound("tower_place");
            }
            return newTower;
        }
    }

    checkTowerPlacementValidity() {
        var paths = this._levelData.paths
        for (const path in paths) {
            let pathData = paths[path]
            for (var i = 0; i < pathData.length; i++) {
                var x1 = Math.floor(pathData[i][0] / CELL_SIZE);
                var y1 = Math.floor(pathData[i][1] / CELL_SIZE);
                var x2 = Math.floor(pathData[i][2] / CELL_SIZE);
                var y2 = Math.floor(pathData[i][3] / CELL_SIZE);

                // Check if tower position is on path on X axis
                var isXMatch = false
                var cellX = Math.floor(this.towerPlacementCursor.x / CELL_SIZE)
                if (cellX >= x1 && cellX <= x2) {
                    // Check X left-to-right
                    isXMatch = true
                } else if (cellX >= x2 && cellX <= x1) {
                    // Check X right-to-left
                    isXMatch = true
                }

                // Check if tower position is on path Y axis
                var isYMatch = false
                var cellY = Math.floor(this.towerPlacementCursor.y / CELL_SIZE)
                if (cellY >= y1 && cellY <= y2) {
                    isYMatch = true
                } else if (cellY >= y2 && cellY <= y1) {
                    isYMatch = true
                }


                // If both X and Y match, tower is on path, i.e. invalid position
                if ((isXMatch && isYMatch)
                    || this._grid[Math.floor(this.towerPlacementCursor.y / CELL_SIZE)]
                    [Math.floor(this.towerPlacementCursor.x / CELL_SIZE)]) {
                    return false;
                }
            }
        }
        return true;
    }

    // -- Waves
    getPreparationSecondsElapsed() {
        return this._secondsElapsed;
    }
    setPreparationTimer() {
        this.preparationTimer = this.time.addEvent({
            delay: 20000,
            callback: this.nextWave,
            callbackScope: this
        });
        this.secondsTimer = this.time.addEvent({
            delay: 1000,
            callback: (prepTimer = this.preparationTimer) => {
                this._secondsElapsed += 1
                this._userInterface.updatePreparationTimer();
            },
            callbackScope: this.preparationTimer,
            repeat: 30
        });
        this._userInterface.updatePreparationTimer();
    }

    stopWaveTimers() {
        this.preparationTimer.remove()
        this.secondsTimer.remove()
    }

    nextWave() {
        if (this.preparationTimer || this.secondsTimer) {
            this._secondsElapsed = 0;
            this.stopWaveTimers();
        }
        if (!this._isWaveInProgress) this._audioManager.playMusic("action");

        this._isWaveInProgress = true
        this._currentWaveIndex += 1;
        if (this._currentWaveIndex < this._waveCount) {
            if (this._currentWaveIndex % 10 == 0 && this._currentWaveIndex != 0) {
                // Boss Battle
                this._audioManager.playSound("boss_warning");
                this._audioManager.playMusic("boss");
            } else {
                // Regular Fight
                this._audioManager.playSound("wave_start");
            }

            this.startWave(this._currentWaveIndex)
        } else {
            // DEBUG, reset waves
            this._currentWaveIndex = -1
            this.nextWave();
        }
    }

    startWave(waveNumber) {
        var waveRecord = this._waveData[waveNumber]
        for (const wave of waveRecord) {
            var enemyCount = wave[0]
            var enemyType = wave[1]
            var spawnDelay = wave[2]
            var path = wave[3]
            this._enemyCount += enemyCount;

            var waveTimer = this.time.addEvent({
                delay: spawnDelay,
                callback: this._enemyManager.addToPath,
                args: [this, this.paths[path], enemyType],
                callbackScope: this._enemyManager,
                repeat: enemyCount - 1
            })
        }
    }

    decEnemyCount() {
        this._enemyCount -= 1;
    }

    getUserInterface() {
        return this._userInterface;
    }

    loseIfDead() {
        if (this.registry.get('base_health') < 1) {
            this.cleanUp();
            this.scene.start('loseScreen', this);
        }
    }

    // Call this before leaving the screen
    cleanUp() {
        this.registry.destroy();
        this.events.off();
        this.sound.stopAll();
    }

    get grid() {
        return this._grid
    }


}

export default LevelScene;
