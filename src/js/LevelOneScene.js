import images from '../assets/*.png';

const Tower = require("./tower.js")
const Enemy = require("./enemy.js")
const Bullet = require("./bullet.js")
const TowerManager = require("./towerManager.js")
const EnemyManager = require("./enemyManager.js")

let placeholder = null;

class LevelOneScene extends Phaser.Scene {

  constructor() {
    super({ key: "Level1" });
    // this.towerManager = new TowerManager(this)
  }

  preload() {
    for (const spriteName in images) {
      this.load.image(spriteName, images[spriteName])
    }

  }

  create() {
    let cur_scene = this;
    // World properties
    this.physics.world.setBounds(0, 0, 800, 600);


    let graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);

    this.registry.managers = {};

    let towerManager = new TowerManager(this);
    // let tower = towerManager.addTower(100, 450, "basic_tower");
    // let tower2 = towerManager.addTower(450, 400, "basic_tower");
    // towerManager.addTower(100, 200, "basic_tower");
    // towerManager.addTower(500, 300, "basic_tower");

    let enemyManager = new EnemyManager(this);
    // let enemy = enemyManager.addEnemy(475, 200, "test_enemy");

    let bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    this.registry.managers["bullets"] = bullets;


    let sidebar = this.add.rectangle(900, 300, 200, 600, 0x474c59);
    var tower_select = this.add.sprite(900, 300, "basic_tower").setInteractive();
    tower_select.on("pointerdown", function (pointer) {
      placeholder = cur_scene.add.sprite(900, 300, "basic_tower").setInteractive();
      placeholder.scale = 0.5;
      placeholder.on("pointerdown", function (pointer) {
        towerManager.addTower(placeholder.x, placeholder.y, "basic_tower");
        placeholder.destroy(true);
      });
    });

    let path = this.add.path();

    path.add(new Phaser.Curves.Line([50, 500, 700, 500]));
    path.add(new Phaser.Curves.Line([700, 500, 500, 450]));
    path.add(new Phaser.Curves.Line([500, 450, 50, 450]));
    path.add(new Phaser.Curves.Line([50, 450, 50, 400]));
    path.add(new Phaser.Curves.Line([50, 400, 700, 400]));
    path.add(new Phaser.Curves.Line([700, 400, 700, 350]));
    path.add(new Phaser.Curves.Line([700, 350, 50, 350]));
    path.add(new Phaser.Curves.Line([50, 350, 50, 300]));
    path.add(new Phaser.Curves.Line([50, 300, 700, 300]));
    path.add(new Phaser.Curves.Line([700, 300, 100, 150]));
    path.add(new Phaser.Curves.Line([100, 150, 700, 150]));

    path.draw(graphics);


    enemyManager.addToPath(this, path, "test_enemy");
    console.log(this);

    this.input.keyboard.on('keydown-A', () => {

      enemyManager.addToPath(this, path, "test_enemy")

    }, this);


    // Image/object placement
    // this.add.text(50, 50, "Sample text");


  }

  update() {

    if (placeholder !== null) {
      placeholder.x = this.game.input.mousePointer.worldX;
      placeholder.y = this.game.input.mousePointer.worldY;
    }


  }

}



export default LevelOneScene;