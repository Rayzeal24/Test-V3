const KEY = "tdclash_save_v1";

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
   HOME MENU (CLASH-LIKE)
========================= */
function homeMenuUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

  mount(`
    <div class="home">

      <!-- ŒIL MYSTIQUE -->
      <div class="eyeWrap" id="eyeWrap">
        <img src="./images/main/task_01kcvg1rb3fcevk5d7mnwta9g3_1766154402_img_0.webp" class="eyeBase" alt="">
        <div class="eyeIris" id="eyeIris"></div>
      </div>

      <div class="topbar">
        <div class="logo">
          <div class="logo-top">${t.titleTop}</div>
          <div class="logo-bottom">${t.titleBottom}</div>
        </div>

        <button id="btnAudio" class="iconBtn" title="${t.audio}">♪</button>
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

  injectHomeCssOnce();
  setupEyeFollow();

  /* ===== Audio ===== */
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

  /* ===== Help ===== */
  document.getElementById("btnHelp").onclick = () => toast(t.helpText);

  /* ===== Lang ===== */
  document.getElementById("btnLang").onclick = () => {
    save.settings.language = (save.settings.language === "fr") ? "en" : "fr";
    saveGame(save);
    homeMenuUI(save);
  };

  /* ===== Reset ===== */
  document.getElementById("btnReset").onclick = () => {
    localStorage.removeItem(KEY);
    boot();
  };

  /* ===== Play ===== */
  document.getElementById("btnPlay").onclick = () => {
    if (!save.firstLaunchDone) firstLaunchUI(save);
    else menuUI(save);
  };
}

/* =========================
   ŒIL : FOLLOW MOUSE
========================= */
function setupEyeFollow(){
  const eye = document.getElementById("eyeWrap");
  const iris = document.getElementById("eyeIris");
  if(!eye || !iris) return;

  const MAX = 6;

  function move(e){
    const r = eye.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const ang = Math.atan2(dy, dx);

    const x = Math.cos(ang) * MAX;
    const y = Math.sin(ang) * MAX;

    iris.style.transform =
      `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }

  window.addEventListener("mousemove", move, { passive:true });
}

/* =========================
   FIRST LAUNCH
========================= */
function firstLaunchUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

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
    titleBottom: "CLASH",
    audio: "Son",
    play: "Jouer",
    hint: "Appuie sur Play — {name}, prêt à défendre ?",
    helpText: "Clique Play pour commencer.",
    welcome: "Bienvenue !",
    welcomeSub: "Configuration initiale.",
    start: "Commencer",
    guest: "Invité",
    menu: "Menu",
    home: "Accueil",
  };
  const en = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "CLASH",
    audio: "Audio",
    play: "Play",
    hint: "Press Play — {name}, ready?",
    helpText: "Click Play to start.",
    welcome: "Welcome!",
    welcomeSub: "Initial setup.",
    start: "Start",
    guest: "Guest",
    menu: "Menu",
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
    Object.assign(el.style,{
      position:"fixed",left:"50%",bottom:"26px",
      transform:"translateX(-50%)",
      background:"rgba(0,0,0,.55)",
      border:"1px solid rgba(255,255,255,.18)",
      padding:"10px 12px",borderRadius:"12px",
      color:"#fff",zIndex:"99",opacity:"0",
      transition:"opacity .15s ease"
    });
  }
  el.textContent = text;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.style.opacity="0",2200);
}

/* =========================
   CSS HOME (ONCE)
========================= */
function injectHomeCssOnce() {
  if (document.getElementById("home-css")) return;
  const s = document.createElement("style");
  s.id = "home-css";
  s.textContent = `
    .eyeWrap{
      position:absolute;
      right:24px;
      top:110px;
      width:220px;
      height:170px;
      pointer-events:none;
      filter: drop-shadow(0 18px 30px rgba(0,0,0,.35));
    }
    .eyeBase{width:100%;height:100%}
    .eyeIris{
      position:absolute;
      width:24px;height:24px;
      border-radius:999px;
      background:rgba(50,35,22,.55);
      left:50%;top:56%;
      transform:translate(-50%,-50%);
      filter:blur(.6px);
      transition:transform .12s ease-out;
      mix-blend-mode:multiply;
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
  homeMenuUI(save);
}

boot();
