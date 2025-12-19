import Phaser from "phaser";

/**
 * STYLE GLOBAL (cartoon-ish) : on fera ensuite des assets.
 * Pour l’instant : formes + texte, mais architecture déjà clean.
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    const { width, height } = this.scale;

    // Background gradient-ish
    const bg = this.add.graphics();
    bg.fillStyle(0x7b5cff, 1).fillRect(0, 0, width, height);
    bg.fillStyle(0xffb86b, 0.35).fillRect(0, height * 0.25, width, height * 0.75);

    // Mountains silhouettes
    const m = this.add.graphics();
    m.fillStyle(0x3a2b7a, 0.35);
    m.fillTriangle(0, height, width * 0.25, height * 0.55, width * 0.5, height);
    m.fillTriangle(width * 0.4, height, width * 0.65, height * 0.5, width * 0.9, height);

    // Title (placeholder)
    const title = this.add.text(width / 2, 90, "TOWER DEFENSE\nCLASH-LIKE", {
      fontFamily: "system-ui, Arial",
      fontSize: "52px",
      fontStyle: "900",
      color: "#FFD54A",
      align: "center",
      stroke: "#1b1b1b",
      strokeThickness: 10,
    }).setOrigin(0.5);

    // Big Play Button
    const btn = this.add.container(width / 2, height / 2 + 40);

    const ring = this.add.circle(0, 0, 90, 0x2d2d2d, 0.35);
    const plate = this.add.circle(0, 0, 78, 0x7a4a2b, 1);
    const boltRing = this.add.circle(0, 0, 95, 0x8aa0b8, 1);
    boltRing.setStrokeStyle(10, 0x2b2b2b, 0.6);

    const playTri = this.add.triangle(8, 0, -18, -24, -18, 24, 24, 0, 0xffffff, 1);
    playTri.setStrokeStyle(6, 0x000000, 0.25);

    btn.add([boltRing, ring, plate, playTri]);
    btn.setSize(200, 200);
    btn.setInteractive({ useHandCursor: true });

    // Small buttons (audio / help / language) placeholders
    const makeSmallBtn = (x, y, label) => {
      const c = this.add.container(x, y);
      const r = this.add.rectangle(0, 0, 56, 56, 0x2d2d2d, 0.4).setStrokeStyle(3, 0xffffff, 0.35);
      const t = this.add.text(0, 0, label, { fontFamily: "system-ui", fontSize: "20px", color: "#fff" }).setOrigin(0.5);
      c.add([r, t]);
      c.setSize(56, 56);
      c.setInteractive({ useHandCursor: true });
      return c;
    };

    const btnAudio = makeSmallBtn(width - 50, 40, "♪");
    const btnHelp = makeSmallBtn(width / 2 - 60, height - 55, "?");
    const btnLang = makeSmallBtn(width / 2 + 60, height - 55, "FR");

    btnAudio.on("pointerdown", () => {
      // plus tard: toggle sound
      this.cameras.main.flash(120, 255, 255, 255);
    });
    btnHelp.on("pointerdown", () => {
      this.add.text(width / 2, height - 110, "Tips: clique PLAY → place des tours → défends la base", {
        fontFamily: "system-ui",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00000066",
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      }).setOrigin(0.5).setDepth(10);
    });

    btn.on("pointerover", () => btn.setScale(1.04));
    btn.on("pointerout", () => btn.setScale(1));

    btn.on("pointerdown", () => {
      this.scene.start("game");
      this.scene.launch("ui");
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
    this.tile = 48;
    this.cols = 16;
    this.rows = 10;
    this.gold = 120;
    this.baseHp = 20;
    this.wave = 1;

    this.path = [
      { x: 0, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 2 }, { x: 10, y: 2 }, { x: 10, y: 8 }, { x: 15, y: 8 }
    ];
    this.towers = [];
    this.enemies = [];
    this.bullets = [];
    this.runningWave = false;
  }

  create() {
    this.cameras.main.setBackgroundColor("#12162a");
    this.drawGridAndPath();

    this.input.on("pointerdown", (p) => {
      // placement tour
      const gx = Math.floor(p.x / this.tile);
      const gy = Math.floor(p.y / this.tile);
      if (this.isOnPath(gx, gy)) return;
      if (this.towers.some(t => t.gx === gx && t.gy === gy)) return;

      const cost = 50;
      if (this.gold < cost) return;

      this.gold -= cost;
      this.events.emit("state", this.getState());

      const { x, y } = this.gridCenter(gx, gy);
      const tower = { gx, gy, x, y, range: 140, fireRate: 0.6, cd: 0, dmg: 12 };
      this.towers.push(tower);

      const g = this.add.circle(x, y, 16, 0x3a4bb0, 1);
      g.setStrokeStyle(4, 0x000000, 0.25);
      tower.gfx = g;
    });

    this.events.emit("state", this.getState());
  }

  getState() {
    return { gold: this.gold, hp: this.baseHp, wave: this.wave, running: this.runningWave };
  }

  drawGridAndPath() {
    const g = this.add.graphics();

    // Path tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.isOnPath(x, y)) {
          g.fillStyle(0x1b2448, 1).fillRect(x * this.tile, y * this.tile, this.tile, this.tile);
        }
      }
    }

    // Grid lines
    g.lineStyle(1, 0x2a3156, 0.35);
    for (let x = 0; x <= this.cols; x++) {
      g.beginPath(); g.moveTo(x * this.tile, 0); g.lineTo(x * this.tile, this.rows * this.tile); g.strokePath();
    }
    for (let y = 0; y <= this.rows; y++) {
      g.beginPath(); g.moveTo(0, y * this.tile); g.lineTo(this.cols * this.tile, y * this.tile); g.strokePath();
    }

    // Base at end
    const end = this.path[this.path.length - 1];
    const base = this.gridCenter(end.x, end.y);
    const b = this.add.circle(base.x, base.y, 18, 0x2b376b, 1);
    b.setStrokeStyle(6, 0x000000, 0.2);
  }

  isOnPath(gx, gy) {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i], b = this.path[i + 1];
      if (a.x === b.x) {
        const x = a.x;
        const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
        if (gx === x && gy >= y0 && gy <= y1) return true;
      } else if (a.y === b.y) {
        const y = a.y;
        const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
        if (gy === y && gx >= x0 && gx <= x1) return true;
      }
    }
    return false;
  }

  gridCenter(gx, gy) {
    return { x: gx * this.tile + this.tile / 2, y: gy * this.tile + this.tile / 2 };
  }

  startWave() {
    if (this.runningWave || this.baseHp <= 0) return;
    this.runningWave = true;
    this.events.emit("state", this.getState());

    const count = 8 + this.wave * 2;
    let spawned = 0;

    const spawnTimer = this.time.addEvent({
      delay: 420,
      repeat: count - 1,
      callback: () => {
        this.spawnEnemy();
        spawned++;
      }
    });

    this.spawnEnemy(); spawned++;

    // end condition check
    this.time.addEvent({
      delay: 250,
      loop: true,
      callback: (t) => {
        const stillSpawning = spawned < count && !spawnTimer.hasDispatched;
        if (!stillSpawning && this.enemies.length === 0) {
          t.remove(false);
          this.runningWave = false;
          this.wave++;
          this.events.emit("state", this.getState());
        }
        if (this.baseHp <= 0) t.remove(false);
      }
    });
  }

  spawnEnemy() {
    const start = this.gridCenter(this.path[0].x, this.path[0].y);
    const enemy = {
      x: start.x, y: start.y,
      speed: 65 + this.wave * 2,
      hp: 30 + this.wave * 8,
      maxHp: 30 + this.wave * 8,
      waypoint: 1,
      radius: 13,
      reward: 12 + Math.floor(this.wave * 2),
    };
    enemy.gfx = this.add.circle(enemy.x, enemy.y, enemy.radius, 0xd05c5c, 1);
    this.enemies.push(enemy);
  }

  update(_, dtMs) {
    const dt = Math.min(0.033, dtMs / 1000);

    // Move enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      const wp = this.path[en.waypoint];
      if (!wp) {
        // reached base
        en.gfx.destroy();
        this.enemies.splice(i, 1);
        this.baseHp -= 1;
        this.events.emit("state", this.getState());
        continue;
      }
      const p = this.gridCenter(wp.x, wp.y);
      const dx = p.x - en.x, dy = p.y - en.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) en.waypoint++;
      else {
        en.x += (dx / (dist || 1)) * en.speed * dt;
        en.y += (dy / (dist || 1)) * en.speed * dt;
        en.gfx.setPosition(en.x, en.y);
      }
    }

    // Towers shoot
    for (const t of this.towers) {
      t.cd -= dt;
      if (t.cd > 0) continue;

      let best = null, bestD = Infinity;
      for (const en of this.enemies) {
        const d = Math.hypot(en.x - t.x, en.y - t.y);
        if (d <= t.range && d < bestD) { best = en; bestD = d; }
      }
      if (best) {
        this.shoot(t, best);
        t.cd = 1 / t.fireRate;
      }
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.gfx.setPosition(b.x, b.y);

      // collide
      let hit = null;
      for (const en of this.enemies) {
        const d = Math.hypot(en.x - b.x, en.y - b.y);
        if (d <= en.radius + b.r) { hit = en; break; }
      }
      if (hit) {
        hit.hp -= b.dmg;
        b.gfx.destroy();
        this.bullets.splice(i, 1);

        if (hit.hp <= 0) {
          this.gold += hit.reward;
          this.events.emit("state", this.getState());
          hit.gfx.destroy();
          const idx = this.enemies.indexOf(hit);
          if (idx >= 0) this.enemies.splice(idx, 1);
        }
      }
    }
  }

  shoot(t, en) {
    const dx = en.x - t.x, dy = en.y - t.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 300;
    const bullet = {
      x: t.x, y: t.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      dmg: t.dmg,
      r: 4
    };
    bullet.gfx = this.add.circle(bullet.x, bullet.y, bullet.r, 0xf2f2ff, 1);
    this.bullets.push(bullet);
  }
}

class UIScene extends Phaser.Scene {
  constructor() {
    super("ui");
  }

  create() {
    const gameScene = this.scene.get("game");

    const pad = 10;
    this.panel = this.add.rectangle(0, 0, 420, 46, 0x000000, 0.35).setOrigin(0, 0);

    this.txt = this.add.text(pad, pad, "", {
      fontFamily: "system-ui, Arial",
      fontSize: "18px",
      color: "#ffffff"
    });

    this.btnWave = this.add.text(360, 10, "Lancer vague", {
      fontFamily: "system-ui",
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#1a2040",
      padding: { left: 10, right: 10, top: 6, bottom: 6 }
    }).setInteractive({ useHandCursor: true });

    this.btnWave.on("pointerdown", () => gameScene.startWave());

    // Listen state updates
    gameScene.events.on("state", (s) => {
      this.txt.setText(`Vague: ${s.wave}   Or: ${s.gold}   Base HP: ${s.hp}`);
      this.btnWave.setAlpha(s.running || s.hp <= 0 ? 0.5 : 1);
      this.btnWave.disableInteractive();
      if (!s.running && s.hp > 0) this.btnWave.setInteractive({ useHandCursor: true });
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 768,
  height: 480,
  parent: document.body,
  scene: [MenuScene, GameScene, UIScene],
};

new Phaser.Game(config);
