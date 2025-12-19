import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    const { width, height } = this.scale;
    const save = this.registry.get("save");

    this.cameras.main.setBackgroundColor("#12162a");

    this.add.text(width / 2, 120, "MENU", {
      fontFamily: "system-ui",
      fontSize: "52px",
      color: "#FFD54A",
      fontStyle: "900",
      stroke: "#000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(width / 2, 200, `Salut ${save.player.name} 👋`, {
      fontFamily: "system-ui",
      fontSize: "22px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(width / 2, 250, `Langue: ${save.settings.language.toUpperCase()} | Son: ${save.settings.sound ? "ON" : "OFF"}`, {
      fontFamily: "system-ui",
      fontSize: "16px",
      color: "#ffffffaa",
    }).setOrigin(0.5);
  }
}

