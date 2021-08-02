import images from '../assets/*.png';
import backgroundImages from '../assets/backgrounds/*.png';
import musicTracks from '../assets/music/*.mp3';

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

        // State Control
        this._isWaveInProgress = false
        this._enemyCount = 0

        // Tower Controls
        this._towerPlacingMode = false
        this.towerPlacementCursor = { x: 0, y: 0, previousX: 0, previousY: 0, isValid: false };

        // Wave Data
        this._waveData = this._levelData.waveData
        this._currentWaveIndex = -1
        this._currentWave = this._waveData[this._currentWaveIndex]
        this._waveCount = this._waveData.length
    }

    init() {
        // Scene's registry data
        this.registry.set('credits', this._levelData.startingCredits);
        this.registry.set('base_health', 20);
    }

    preload() {
        // Scene object images
        for (const spriteName in images) {
            this.load.image(spriteName, images[spriteName]);
        }

        // Background Image
        var bgImageName = this._levelData.background;
        this.load.image('levelBg', backgroundImages[bgImageName])

        // Audio - Music
        for (const track in musicTracks) {
            this.load.audio(track, musicTracks[track])
        }

    }

    create() {
        // World Properties
        this.physics.world.setBounds(0, 0, this._levelData.width, this._levelData.height);

        // Background
        this.add.image(270, 270, 'levelBg');

        // Physics groups
        // NOTE: These physics groups were added indirectly by manager classes, but since
        // the scene owns the physics group, they should be created here.
        this.registry.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.registry.towers = this.physics.add.group({ classType: Tower, runChildUpdate: true });
        this.registry.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });

        // Controls
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

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

        let path = this.add.path();
        for (var i = 0; i < this._levelData.path.length; i++) {
            var lineData = this._levelData.path[i]
            path.add(new Phaser.Curves.Line(lineData));
            if (i == 0) {
                path.startX = lineData[0];
                path.startY = lineData[1];
            }
        }
        this.path = path
        // DEBUG: path.draw(graphics);
        // -------------------------
        // DEBUG Tools
        // -------------------------
        // Spawn an enemy manually
        this.input.keyboard.on('keydown-A', () => {
            //this._enemyManager.addToPath(this, path, "test_enemy")
            this.nextWave()
        }, this);

        // Click on a spot to print x/y coordinates to console.
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });

        // Increase credits
        this.input.keyboard.on('keydown-C', () => {
            this.registry.set('credits', this.registry.get('credits') + 1000);
        }, this);
    }

    update() {
        this._userInterface.update();

        if (this._towerPlacingMode) {
            this.towerPlacementCursor.x = Math.floor(this.game.input.mousePointer.worldX / CELL_SIZE) * CELL_SIZE + CELL_OFFSET
            this.towerPlacementCursor.y = Math.floor(this.game.input.mousePointer.worldY / CELL_SIZE) * CELL_SIZE + CELL_OFFSET

            if ((this.towerPlacementCursor.x != this.towerPlacementCursor.previousX) || (this.towerPlacementCursor.y != this.towerPlacementCursor.previousY)) {
                this.towerPlacementCursor.isValid = this.checkTowerPlacementValidity();
            }

            this.towerPlacementCursor.previousX = this.towerPlacementCursor.x
            this.towerPlacementCursor.previousY = this.towerPlacementCursor.y
        }

        if (this._isWaveInProgress) {
            if (this._enemyCount <= 0) {
                console.log("Wave Ended.")
                this._isWaveInProgress = false
                this._audioManager.playMusic("preparation")
            }
        }
    }

    // Actions
    // -- Towers
    enableTowerPlacementMode() {
        this._towerPlacingMode = true
    }

    disableTowerPlacementMode() {
        this._towerPlacingMode = false
    }

    addTower(x, y, towerName) {
        if (this.towerPlacementCursor.isValid) {
            return this._towerManager.addTower(x, y, towerName)
        } else {
            return null;
        }
    }

    checkTowerPlacementValidity() {
        var pathData = this._levelData.path
        for (var i = 0; i < pathData.length; i++) {
            var x1 = pathData[i][0];
            var y1 = pathData[i][1];
            var x2 = pathData[i][2];
            var y2 = pathData[i][3];

            // Check if tower position is on path on X axis
            var isXMatch = false
            if (this.towerPlacementCursor.x >= x1 && this.towerPlacementCursor.x <= x2) {
                // Check X left-to-right
                isXMatch = true
            } else if (this.towerPlacementCursor.x >= x2 && this.towerPlacementCursor.x <= x1) {
                // Check X right-to-left
                isXMatch = true
            }

            // Check if tower position is on path Y axis
            var isYMatch = false
            if (this.towerPlacementCursor.y >= y1 && this.towerPlacementCursor.y <= y2) {
                isYMatch = true
            } else if (this.towerPlacementCursor.y >= y2 && this.towerPlacementCursor.y <= y1) {
                isYMatch = true
            }

            // If both X and Y match, tower is on path, i.e. invalid position
            if (isXMatch && isYMatch) {
                return false;
            }
        }
        return true;
    }

    // -- Waves
    nextWave() {
        this._audioManager.playMusic("action");
        this._isWaveInProgress = true
        this._currentWaveIndex += 1;
        if (this._currentWaveIndex < this._waveCount) {
            this.startWave(this._currentWaveIndex)
            console.log("Starting Wave: " + String(this._currentWaveIndex) + " Enemies Remaining: " + String(this._enemyCount))
        } else {
            // DEBUG, reset waves
            this._currentWaveIndex = -1
            this.nextWave()
        }
    }

    startWave(waveNumber) {
        var waveRecord = this._waveData[waveNumber]
        for (const wave of waveRecord) {
            var enemyCount = wave[0] - 1
            var enemyType = wave[1]
            var spawnDelay = wave[2]
            var waveTimer = this.time.addEvent({
                delay: spawnDelay,
                callback: this._enemyManager.addToPath,
                args: [this, this.path, enemyType],
                callbackScope: this._enemyManager,
                repeat: enemyCount
            })
        }
    }


}

export default LevelScene;
