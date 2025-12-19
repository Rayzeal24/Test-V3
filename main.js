const KEY = "tdclash_save_v1";

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
    settings: { language: "fr", sound: true },
    progress: { levelUnlocked: 1, stars: {} }
  };
}

function mount(html) {
  document.getElementById("app").innerHTML = html;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* =========================
   CLASH-LIKE MENU
========================= */
function homeMenuUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

  mount(`
    <div class="home">
      <div class="topbar">
        <div class="logo">
          <div class="logo-top">${t.titleTop}</div>
          <div class="logo-bottom">${t.titleBottom}</div>
        </div>

        <button id="btnAudio" class="iconBtn" title="${t.audio}">
          ♪
        </button>
      </div>

      <div class="center">
        <button id="btnPlay" class="playBtn" aria-label="${t.play}">
          <div class="playOuter">
            <div class="playMetal"></div>
            <div class="playWood"></div>
            <div class="playTriangle"></div>
          </div>
        </button>
      </div>

      <div class="bottombar">
        <button id="btnHelp" class="smallBtn">?</button>
        <button id="btnLang" class="smallBtn">${lang.toUpperCase()}</button>
        <button id="btnReset" class="smallBtn danger">⟲</button>
      </div>

      <div class="hintLine">
        <span>${t.hint.replace("{name}", escapeHtml(save.player.name || t.guest))}</span>
      </div>
    </div>
  `);

  // Inject CSS for the menu (keep GitHub pages simple)
  injectHomeCssOnce();

  // Audio toggle
  const btnAudio = document.getElementById("btnAudio");
  const setAudioUI = () => {
    btnAudio.classList.toggle("off", !save.settings.sound);
    btnAudio.textContent = save.settings.sound ? "♪" : "🔇";
  };
  setAudioUI();

  btnAudio.onclick = () => {
    save.settings.sound = !save.settings.sound;
    saveGame(save);
    setAudioUI();
  };

  // Help
  document.getElementById("btnHelp").onclick = () => {
    toast(t.helpText);
  };

  // Lang toggle
  document.getElementById("btnLang").onclick = () => {
    save.settings.language = (save.settings.language === "fr") ? "en" : "fr";
    saveGame(save);
    homeMenuUI(save);
  };

  // Reset save
  document.getElementById("btnReset").onclick = () => {
    localStorage.removeItem(KEY);
    boot();
  };

  // Play -> first launch if not done, else go to real menu/game later
  document.getElementById("btnPlay").onclick = () => {
    if (!save.firstLaunchDone) {
      firstLaunchUI(save);
    } else {
      // Pour l’instant on affiche un mini menu
      menuUI(save);
    }
  };
}

/* =========================
   FIRST LAUNCH (ton écran)
========================= */
function firstLaunchUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

  mount(`
    <div class="card">
      <h1 class="title">${t.welcome}</h1>
      <p class="sub">${t.welcomeSub}</p>

      <div class="grid">
        <div>
          <label>${t.nickname}</label>
          <input id="name" maxlength="16" placeholder="${t.namePlaceholder}" value="${escapeHtml(save.player.name || "")}">
        </div>

        <div>
          <label>${t.language}</label>
          <div class="row" style="margin-top:8px">
            <div id="langFR" class="pill">FR</div>
            <div id="langEN" class="pill">EN</div>
          </div>
        </div>

        <div>
          <label>${t.sound}</label>
          <div class="row" style="margin-top:8px">
            <div id="sound" class="pill">ON</div>
          </div>
        </div>

        <div>
          <label>${t.action}</label>
          <div class="row" style="margin-top:8px">
            <div id="reset" class="pill danger">${t.resetSave}</div>
          </div>
        </div>
      </div>

      <div class="sep"></div>
      <button id="start" class="btn">${t.start}</button>
      <div class="small">${t.afterTip}</div>

      <div class="row" style="margin-top:10px">
        <div id="backHome" class="pill">${t.back}</div>
      </div>
    </div>
  `);

  const langFR = document.getElementById("langFR");
  const langEN = document.getElementById("langEN");
  const sound = document.getElementById("sound");

  function refresh() {
    langFR.classList.toggle("active", save.settings.language === "fr");
    langEN.classList.toggle("active", save.settings.language === "en");
    sound.textContent = save.settings.sound ? "ON" : "OFF";
    sound.classList.toggle("ok", !!save.settings.sound);
    sound.classList.toggle("danger", !save.settings.sound);
  }

  langFR.onclick = () => { save.settings.language = "fr"; saveGame(save); refresh(); };
  langEN.onclick = () => { save.settings.language = "en"; saveGame(save); refresh(); };
  sound.onclick  = () => { save.settings.sound = !save.settings.sound; saveGame(save); refresh(); };

  document.getElementById("reset").onclick = () => {
    localStorage.removeItem(KEY);
    boot();
  };

  document.getElementById("start").onclick = () => {
    const name = (document.getElementById("name").value || "").trim();
    save.player.name = name.length ? name : t.guest;
    save.firstLaunchDone = true;
    saveGame(save);
    homeMenuUI(save); // retour menu principal stylé
  };

  document.getElementById("backHome").onclick = () => {
    saveGame(save);
    homeMenuUI(save);
  };

  refresh();
}

/* =========================
   MENU PLACEHOLDER (après)
========================= */
function menuUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

  mount(`
    <div class="card">
      <h1 class="title">${t.menu}</h1>
      <p class="sub">${t.hello} <b>${escapeHtml(save.player.name)}</b> 👋</p>

      <div class="row">
        <div class="pill active">${t.language}: ${save.settings.language.toUpperCase()}</div>
        <div class="pill ${save.settings.sound ? "ok" : "danger"}">${t.sound}: ${save.settings.sound ? "ON" : "OFF"}</div>
        <div class="pill">${t.level}: ${save.progress.levelUnlocked}</div>
      </div>

      <div class="sep"></div>

      <button id="play" class="btn">${t.playSoon}</button>
      <div class="small">${t.nextStep}</div>

      <div class="sep"></div>
      <div class="row">
        <div id="home" class="pill">${t.home}</div>
        <div id="reset" class="pill danger">${t.resetSave}</div>
      </div>
    </div>
  `);

  document.getElementById("play").onclick = () => toast(t.playToast);
  document.getElementById("home").onclick = () => homeMenuUI(save);
  document.getElementById("reset").onclick = () => { localStorage.removeItem(KEY); boot(); };
}

/* =========================
   I18N
========================= */
function i18n(lang) {
  const fr = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "CLASH",
    audio: "Son",
    play: "Jouer",
    hint: "Appuie sur Play — {name}, prêt à défendre ?",
    helpText: "Clique Play pour commencer. Ensuite on ajoute les niveaux, les tours et les vagues.",
    welcome: "Bienvenue !",
    welcomeSub: "Configure ton profil (une seule fois). Tu pourras changer après.",
    nickname: "Pseudo",
    namePlaceholder: "Ex: Rayzeal",
    language: "Langue",
    sound: "Son",
    action: "Action",
    resetSave: "Reset Save",
    start: "Commencer",
    afterTip: "Astuce: après ça → menu principal → Play → jeu.",
    back: "Retour",
    guest: "Invité",
    menu: "Menu",
    hello: "Salut",
    level: "Niveau débloqué",
    playSoon: "Play (bientôt)",
    nextStep: "Prochaine étape: on code la map + placement tours + ennemis.",
    playToast: "Prochaine étape: on lance le vrai niveau (canvas) 😉",
    home: "Accueil",
  };

  const en = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "CLASH",
    audio: "Audio",
    play: "Play",
    hint: "Press Play — {name}, ready to defend?",
    helpText: "Click Play to start. Next we add levels, towers and waves.",
    welcome: "Welcome!",
    welcomeSub: "Set up your profile (one time). You can change it later.",
    nickname: "Nickname",
    namePlaceholder: "Ex: Rayzeal",
    language: "Language",
    sound: "Sound",
    action: "Action",
    resetSave: "Reset Save",
    start: "Start",
    afterTip: "Tip: then → home → Play → game.",
    back: "Back",
    guest: "Guest",
    menu: "Menu",
    hello: "Hello",
    level: "Unlocked level",
    playSoon: "Play (soon)",
    nextStep: "Next step: map + tower placement + enemies.",
    playToast: "Next: we launch the real level (canvas) 😉",
    home: "Home",
  };

  return lang === "en" ? en : fr;
}

/* =========================
   TOAST
========================= */
function toast(text) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "26px";
    el.style.transform = "translateX(-50%)";
    el.style.background = "rgba(0,0,0,.55)";
    el.style.border = "1px solid rgba(255,255,255,.18)";
    el.style.backdropFilter = "blur(6px)";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "12px";
    el.style.color = "#fff";
    el.style.zIndex = "99";
    el.style.fontFamily = "system-ui, Arial";
    el.style.fontSize = "14px";
    el.style.maxWidth = "min(560px, 92vw)";
    el.style.textAlign = "center";
    el.style.opacity = "0";
    el.style.transition = "opacity .15s ease";
  }
  el.textContent = text;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = "0"; }, 2200);
}

/* =========================
   HOME CSS (injected once)
========================= */
function injectHomeCssOnce() {
  if (document.getElementById("home-css")) return;
  const s = document.createElement("style");
  s.id = "home-css";
  s.textContent = `
    .home{
      width:min(760px, 94vw);
      height:min(520px, 78vh);
      position:relative;
      display:flex;
      flex-direction:column;
      justify-content:space-between;
      padding:10px;
    }

    .topbar{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:12px;
    }

    .logo{
      padding:10px 14px;
      border-radius:16px;
      background: linear-gradient(180deg, rgba(18,22,42,.75), rgba(18,22,42,.35));
      border: 1px solid rgba(255,255,255,.10);
      backdrop-filter: blur(6px);
      box-shadow: 0 12px 40px rgba(0,0,0,.25);
    }
    .logo-top{
      font-size:44px;
      font-weight:900;
      letter-spacing:1px;
      color: var(--gold);
      text-shadow: 0 6px 0 rgba(0,0,0,.35);
      line-height:1;
    }
    .logo-bottom{
      font-size:34px;
      font-weight:900;
      letter-spacing:3px;
      color:#fff;
      opacity:.92;
      line-height:1.05;
    }

    .iconBtn{
      width:54px;height:54px;
      border-radius:14px;
      border:1px solid rgba(255,255,255,.16);
      background: rgba(18,22,42,.55);
      color:#fff;
      font-size:22px;
      cursor:pointer;
      backdrop-filter: blur(6px);
      box-shadow: 0 10px 30px rgba(0,0,0,.22);
    }
    .iconBtn.off{opacity:.7}

    .center{
      display:grid;
      place-items:center;
      flex:1;
    }

    .playBtn{
      border:none;
      background:transparent;
      cursor:pointer;
      padding:0;
      transform: translateY(10px);
      transition: transform .12s ease;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,.35));
    }
    .playBtn:hover{ transform: translateY(6px) scale(1.02); }
    .playBtn:active{ transform: translateY(8px) scale(0.99); }

    .playOuter{
      width:190px;height:190px;
      border-radius:999px;
      position:relative;
      display:grid;
      place-items:center;
    }

    .playMetal{
      position:absolute; inset:0;
      border-radius:999px;
      background:
        radial-gradient(circle at 35% 30%, rgba(255,255,255,.45), transparent 45%),
        radial-gradient(circle at 65% 70%, rgba(0,0,0,.20), transparent 55%),
        linear-gradient(180deg, #b8c4d6, #7f8ea6);
      border: 8px solid rgba(0,0,0,.20);
    }

    .playWood{
      position:absolute;
      width:142px;height:142px;
      border-radius:999px;
      background:
        repeating-linear-gradient(90deg,
          rgba(0,0,0,.14) 0 6px,
          rgba(255,255,255,.04) 6px 12px
        ),
        radial-gradient(circle at 30% 30%, rgba(255,255,255,.22), transparent 50%),
        linear-gradient(180deg, #8b5a33, #5f3a1f);
      border: 6px solid rgba(0,0,0,.25);
      box-shadow: inset 0 10px 18px rgba(0,0,0,.18);
    }

    .playTriangle{
      width:0;height:0;
      border-top:22px solid transparent;
      border-bottom:22px solid transparent;
      border-left:40px solid rgba(255,255,255,.95);
      margin-left:10px;
      filter: drop-shadow(0 4px 0 rgba(0,0,0,.25));
    }

    .bottombar{
      display:flex;
      justify-content:center;
      gap:12px;
      padding-bottom:6px;
    }

    .smallBtn{
      width:58px;height:58px;
      border-radius:16px;
      border:1px solid rgba(255,255,255,.14);
      background: rgba(18,22,42,.55);
      color:#fff;
      font-size:18px;
      font-weight:900;
      cursor:pointer;
      backdrop-filter: blur(6px);
      box-shadow: 0 10px 30px rgba(0,0,0,.22);
    }
    .smallBtn.danger{ background: rgba(139,45,45,.75); }

    .hintLine{
      display:flex;
      justify-content:center;
      margin-top:4px;
      opacity:.9;
      font-size:13px;
      text-align:center;
    }
    .hintLine span{
      padding:8px 10px;
      border-radius:999px;
      background: rgba(0,0,0,.25);
      border:1px solid rgba(255,255,255,.10);
      backdrop-filter: blur(4px);
    }
  `;
  document.head.appendChild(s);
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

  // Si tu veux que le jeu démarre direct sur home menu:
  // on garde le menu clash-like comme écran d'accueil
  homeMenuUI(save);
}

boot();
