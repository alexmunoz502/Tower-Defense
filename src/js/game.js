import 'phaser';
import LevelScene from './level.js';
import levelData from '../data/levels.json';
import MainMenu from './mainMenu.js';


var scenes = [new MainMenu()];

// Creates a new scene for each existing level data
for (var level in levelData) if (levelData.hasOwnProperty(level)) {
  scenes.push(new LevelScene(levelData[level]));
}

// Game settings
const gameConfig = {
  type: Phaser.AUTO,
  parent: 'tower-defense',
  title: "Tower Defense",
  width: 960,
  height: 640,
  backgroundColor: '#a06505', 
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {
        y: 0
      }
    }
  },
  scene: scenes
};

// Instantiates a phaser game.
window.onload = function () {
  var game = new Phaser.Game(gameConfig);
};