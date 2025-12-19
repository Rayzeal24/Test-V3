import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import FirstLaunchScene from "./scenes/FirstLaunchScene";
import MenuScene from "./scenes/MenuScene";

const config = {
  type: Phaser.AUTO,
  width: 768,
  height: 480,
  parent: document.body,
  backgroundColor: "#0f1220",
  scene: [BootScene, FirstLaunchScene, MenuScene],
};

new Phaser.Game(config);
