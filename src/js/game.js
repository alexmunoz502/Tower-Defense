import 'phaser';
import LevelScene from './level.js';
import levelData from '../data/levels.json';
import MainMenu from './mainMenu.js';
import LevelSelect from './levelSelect.js';
import WinScreen from './winScreen.js';
import LoseScreen from './loseScreen.js';
import levelSelectBg from '../assets/backgrounds/level_select.png';


var scenes = [new MainMenu(), new LevelSelect(), new WinScreen(), new LoseScreen()];

// Creates a new scene for each existing level data
for (var level in levelData) if (levelData.hasOwnProperty(level)) {
  scenes.push(new LevelScene(levelData[level]));
}

// Game settings
const gameConfig = {
  type: Phaser.AUTO,
  parent: 'tower-defense',
  title: "Tower Defense",
  width: 918,
  height: 594,
  backgroundColor: '#000000',
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