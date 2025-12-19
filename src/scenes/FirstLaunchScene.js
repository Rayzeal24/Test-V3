import Phaser from "phaser";
import { saveGame } from "../core/storage";

export default class FirstLaunchScene extends Phaser.Scene {
  constructor() {
    super("firstLaunch");
    this.nameValue = "";
  }

  create() {
    const { width, height } = this.scale;
    const save = this.registry.get("save");

    // Background
    this.cameras.main.setBackgroundColor("#0f1220");
    const bg = this.add.graphics();
    bg.fillStyle(0x7b5cff, 1).fillRect(0, 0, width, height * 0.35);
    bg.fillStyle(0x12162a, 1).fillRect(0, height * 0.35, width, height * 0.65);

    // Panel
    const panelW = 520, panelH = 320;
    const px = width / 2 - panelW / 2;
    const py = height / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x12162a, 1).fillRoundedRect(px, py, panelW, panelH, 18);
    panel.lineStyle(2, 0x2a3156, 1).strokeRoundedRect(px, py, panelW, panelH, 18);

    this.add.text(width / 2, py + 30, "Bienvenue !", {
      fontFamily: "system-ui, Arial",
      fontSize: "34px",
      color: "#FFD54A",
      fontStyle: "900",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Label pseudo
    this.add.text(px + 28, py + 86, "Pseudo", {
      fontFamily: "system-ui",
      fontSize: "16px",
      color: "#ffffffcc",
    });

    // Input pseudo (HTML overlay)
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Ex: Kynra";
    input.maxLength = 16;
    input.value = save.player?.name || "";
    input.style.position = "absolute";
    input.style.width = "360px";
    input.style.padding = "10px 12px";
    input.style.borderRadius = "12px";
    input.style.border = "1px solid #2a3156";
    input.style.background = "#0f1220";
    input.style.color = "white";
    input.style.outline = "none";
    input.style.fontSize = "16px";
    input.style.fontFamily = "system-ui, Arial";

    // Position sync (canvas position)
    const placeInput = () => {
      const rect = this.game.canvas.getBoundingClientRect();
      input.style.left = `${rect.left + px + 28}px`;
      input.style.top = `${rect.top + py + 110}px`;
    };
    placeInput();
    window.addEventListener("resize", placeInput);

    document.body.appendChild(input);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("resize", placeInput);
      input.remove();
    });

    // Lang selector
    const langLabel = this.add.text(px + 28, py + 168, "Langue", {
      fontFamily: "system-ui",
      fontSize: "16px",
      color: "#ffffffcc",
    });

    const makePill = (x, y, text) => {
      const c = this.add.container(x, y);
      const r = this.add.rectangle(0, 0, 64, 34, 0x1a2040, 1).setStrokeStyle(2, 0x2a3156, 1);
      const t = this.add.text(0, 0, text, { fontFamily: "system-ui", fontSize: "14px", color: "#fff" }).setOrigin(0.5);
      c.add([r, t]);
      c.setSize(64, 34);
      c.setInteractive({ useHandCursor: true });
      c.bg = r;
      c.label = t;
      return c;
    };

    const langFR = makePill(px + 90, py + 208, "FR");
    const langEN = makePill(px + 170, py + 208, "EN");

    const setLangActive = (lang) => {
      save.settings.language = lang;
      langFR.bg.setFillStyle(lang === "fr" ? 0x3a4bb0 : 0x1a2040);
      langEN.bg.setFillStyle(lang === "en" ? 0x3a4bb0 : 0x1a2040);
    };
    setLangActive(save.settings.language || "fr");

    langFR.on("pointerdown", () => setLangActive("fr"));
    langEN.on("pointerdown", () => setLangActive("en"));

    // Sound toggle
    this.add.text(px + 250, py + 168, "Son", {
      fontFamily: "system-ui",
      fontSize: "16px",
      color: "#ffffffcc",
    });

    const soundBtn = makePill(px + 290, py + 208, save.settings.sound ? "ON" : "OFF");
    const setSound = (val) => {
      save.settings.sound = val;
      soundBtn.label.setText(val ? "ON" : "OFF");
      soundBtn.bg.setFillStyle(val ? 0x2da44e : 0x8b2d2d);
    };
    setSound(!!save.settings.sound);
    soundBtn.on("pointerdown", () => setSound(!save.settings.sound));

    // Start button
    const start = this.add.container(width / 2, py + panelH - 52);
    const bgr = this.add.rectangle(0, 0, 220, 44, 0xFFD54A, 1).setStrokeStyle(3, 0x000000, 0.25);
    const txt = this.add.text(0, 0, "Commencer", {
      fontFamily: "system-ui",
      fontSize: "18px",
      color: "#1b1b1b",
      fontStyle: "800",
    }).setOrigin(0.5);
    start.add([bgr, txt]);
    start.setSize(220, 44);
    start.setInteractive({ useHandCursor: true });

    start.on("pointerover", () => start.setScale(1.03));
    start.on("pointerout", () => start.setScale(1));

    start.on("pointerdown", () => {
      const name = (input.value || "").trim();

      save.player.name = name.length ? name : "Invité";
      save.firstLaunchDone = true;

      this.registry.set("save", save);
      saveGame(save);

      this.scene.start("menu");
    });

    // Small helper text
    this.add.text(width / 2, py + panelH - 18, "Tu pourras changer ça dans les réglages.", {
      fontFamily: "system-ui",
      fontSize: "12px",
      color: "#ffffffaa",
    }).setOrigin(0.5);
  }
}
