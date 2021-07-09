import images from '../assets/*.png';

const Tower = require("./tower.js")

class LevelOneScene extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }

  preload() {
    this.load.image('background', images.sky);
    this.load.image('bullet', images.bullet);
    this.load.image('basic_tower', images.tower);
  }

  create() {
    // World properties
    this.physics.world.setBounds(0, 0, 800, 600);

    // Static/dynamic object groups
    let bullets = this.physics.add.group();
    let newTower = new Tower(this, 300, 200, "basic_tower")


    // Image/object placement
    this.add.text(50, 50, "Sample text");
    this.physics.add.sprite(100, 100, 'bullet');


  }

  update() {

  }
}

export default LevelOneScene;