import Phaser from "phaser";
import { loadSave, saveGame, makeDefaultSave } from "../core/storage";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    let save = loadSave();

    if (!save) {
      save = makeDefaultSave();
      saveGame(save);
    }

    // On met le save dans le registry Phaser (accessible partout)
    this.registry.set("save", save);

    // Si first launch pas terminé -> écran first launch
    if (!save.firstLaunchDone) {
      this.scene.start("firstLaunch");
    } else {
      this.scene.start("menu");
    }
  }
}
