const KEY = "tdpolitaria_save_v1";

/* =========================
   SAVE SYSTEM
========================= */
function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGame(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function defaultSave() {
  return {
    firstLaunchDone: false,
    player: { name: "" },
    settings: {
      language: "fr",
      sound: true,
      music: true
    },
    progress: { levelUnlocked: 1, stars: {} }
  };
}

function mount(html) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = html;
}

/* =========================
   ORIENTATION
========================= */
function applyOrientationClass() {
  const isLandscape = window.innerWidth > window.innerHeight;
  document.body.classList.toggle("is-landscape", isLandscape);
  document.body.classList.toggle("is-portrait", !isLandscape);
}

/* =========================
   HOME MENU
========================= */
function homeMenuUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

  const eyeSrc = encodeURI(
    "./images/main/20251219_1614_Mystical Stone Eye_simple_compose_01kcvjsfygeqw9jx9smt6fk25j.png"
  );

  mount(`
    <div class="home">
      <div class="topbar">
        <div class="logo">
          <div class="logo-top">${t.titleTop}</div>
          <div class="logo-bottom">${t.titleBottom}</div>
        </div>

        <button id="btnSettings" class="iconBtn" title="${t.settings}">⚙️</button>
      </div>

      <div class="center">
        <button id="btnPlay" class="eyeBtn" aria-label="${t.play}">
          <div class="eyeWrap" id="eyeWrap" aria-hidden="true">
            <img src="${eyeSrc}" class="eyeBase" alt="">
            <div class="eyeIris"></div>
          </div>
        </button>
      </div>
    </div>
  `);

  applyOrientationClass();
  setupEyeBlink();

  document.getElementById("btnSettings").onclick = () => openSettings(save);

  document.getElementById("btnPlay").onclick = () => {
    if (!save.firstLaunchDone) firstLaunchUI(save);
    else menuUI(save);
  };
}

/* =========================
   EYE BLINK ONLY
========================= */
function setupEyeBlink() {
  const eye = document.getElementById("eyeWrap");
  if (!eye) return;

  clearTimeout(window._blinkT);

  function loop() {
    window._blinkT = setTimeout(() => {
      eye.classList.remove("blink");
      void eye.offsetWidth;
      eye.classList.add("blink");
      loop();
    }, 6000 + Math.random() * 5000);
  }
  loop();
}

/* =========================
   SETTINGS MODAL
========================= */
function closeSettings() {
  document.getElementById("settingsBackdrop")?.remove();
  document.getElementById("settingsModal")?.remove();
}

function openSettings(save) {
  closeSettings();
  const t = i18n(save.settings.language);

  const backdrop = document.createElement("div");
  backdrop.id = "settingsBackdrop";
  backdrop.className = "modal-backdrop";
  backdrop.onclick = closeSettings;

  const modal = document.createElement("div");
  modal.id = "settingsModal";
  modal.className = "modal";
  modal.innerHTML = `
    <h3>${t.settings}</h3>

    <div class="modal-row">
      <label>${t.music}</label>
      <input class="switch" type="checkbox" ${save.settings.music ? "checked" : ""} id="swMusic">
    </div>

    <div class="modal-row">
      <label>${t.sound}</label>
      <input class="switch" type="checkbox" ${save.settings.sound ? "checked" : ""} id="swSound">
    </div>

    <div class="modal-row">
      <label>${t.language}</label>
      <button id="btnLang" class="modalBtn">${save.settings.language.toUpperCase()}</button>
    </div>

    <div class="modal-actions">
      <button id="btnReset" class="modalBtn danger">${t.reset}</button>
      <button id="btnClose" class="modalBtn">${t.close}</button>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  modal.onclick = e => e.stopPropagation();

  modal.querySelector("#btnClose").onclick = closeSettings;

  modal.querySelector("#swMusic").onchange = e => {
    save.settings.music = e.target.checked;
    saveGame(save);
  };

  modal.querySelector("#swSound").onchange = e => {
    save.settings.sound = e.target.checked;
    saveGame(save);
  };

  modal.querySelector("#btnLang").onclick = () => {
    save.settings.language = save.settings.language === "fr" ? "en" : "fr";
    saveGame(save);
    closeSettings();
    homeMenuUI(save);
  };

  modal.querySelector("#btnReset").onclick = () => {
    localStorage.removeItem(KEY);
    closeSettings();
    boot();
  };
}

/* =========================
   FIRST LAUNCH
========================= */
function firstLaunchUI(save) {
  const t = i18n(save.settings.language);

  mount(`
    <div class="card">
      <h1 class="title">${t.welcome}</h1>
      <p class="sub">${t.welcomeSub}</p>
      <button id="start" class="btn">${t.start}</button>
    </div>
  `);

  document.getElementById("start").onclick = () => {
    save.firstLaunchDone = true;
    saveGame(save);
    homeMenuUI(save);
  };
}

/* =========================
   MENU PLACEHOLDER
========================= */
function menuUI(save) {
  const t = i18n(save.settings.language);

  mount(`
    <div class="card">
      <h1 class="title">${t.menu}</h1>
      <button id="home" class="btn">${t.home}</button>
    </div>
  `);

  document.getElementById("home").onclick = () => homeMenuUI(save);
}

/* =========================
   I18N
========================= */
function i18n(lang) {
  const fr = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "POLITARIA",
    play: "Jouer",
    settings: "Paramètres",
    music: "Musique",
    sound: "Sons",
    language: "Langue",
    reset: "Réinitialiser",
    close: "Fermer",
    welcome: "Bienvenue !",
    welcomeSub: "Configuration initiale.",
    start: "Commencer",
    menu: "Menu",
    home: "Accueil"
  };

  const en = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "POLITARIA",
    play: "Play",
    settings: "Settings",
    music: "Music",
    sound: "Sound",
    language: "Language",
    reset: "Reset",
    close: "Close",
    welcome: "Welcome!",
    welcomeSub: "Initial setup.",
    start: "Start",
    menu: "Menu",
    home: "Home"
  };

  return lang === "en" ? en : fr;
}

/* =========================
   BOOT
========================= */
function boot() {
  let save = loadSave();
  if (!save) {
    save = defaultSave();
    saveGame(save);
  }
  applyOrientationClass();
  homeMenuUI(save);
}

boot();

