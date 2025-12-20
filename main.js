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
    settings: { language: "fr", sound: true },
    progress: { levelUnlocked: 1, stars: {} }
  };
}

function mount(html) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = html;
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
   ORIENTATION (LANDSCAPE HELP)
   -> Ajoute une classe au body: .is-landscape / .is-portrait
========================= */
function applyOrientationClass() {
  const isLandscape = window.innerWidth > window.innerHeight;
  document.body.classList.toggle("is-landscape", isLandscape);
  document.body.classList.toggle("is-portrait", !isLandscape);
}

/* =========================
   HOME MENU (POLITARIA)
========================= */
function homeMenuUI(save) {
  const lang = save.settings.language || "fr";
  const t = i18n(lang);

  // ton œil (chemin exact)
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

        <button id="btnAudio" class="iconBtn" title="${t.audio}">♪</button>
      </div>

      <div class="center">
        <!-- L’ŒIL REMPLACE LE BOUCLIER -->
        <button id="btnPlay" class="eyeBtn" aria-label="${t.play}">
          <div class="eyeWrap" id="eyeWrap" aria-hidden="true">
            <img src="${eyeSrc}" class="eyeBase" alt="">
            <div class="eyeIris" id="eyeIris"></div>
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

  // Orientation class (pour layout horizontal téléphone)
  applyOrientationClass();

  // Setup eye animations
  setupEyeFollow();
  setupEyeBlink();

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
    save.settings.language = save.settings.language === "fr" ? "en" : "fr";
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
   EYE FOLLOW (MOBILE + DESKTOP)
   - Pointer events + Touch
   - No duplicate bindings
========================= */
let _eyeBound = false;

function setupEyeFollow() {
  const eye = document.getElementById("eyeWrap");
  const iris = document.getElementById("eyeIris");
  if (!eye || !iris) return;

  // refs à jour après chaque re-render
  window._eyeRefs = { eye, iris };

  if (_eyeBound) return;
  _eyeBound = true;

  const MAX = 7;
  const SMOOTH = 0.15;

  let tx = 0, ty = 0;
  let x = 0, y = 0;
  let raf = 0;

  function tick() {
    raf = 0;
    const refs = window._eyeRefs;
    if (!refs || !refs.iris) return;

    x += (tx - x) * SMOOTH;
    y += (ty - y) * SMOOTH;

    refs.iris.style.transform =
      `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  }

  function requestTick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function getPoint(e) {
    // TouchEvent
    if (e && e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    // PointerEvent / MouseEvent
    return { x: e.clientX, y: e.clientY };
  }

  function move(e) {
    const refs = window._eyeRefs;
    if (!refs || !refs.eye) return;

    const p = getPoint(e);
    if (p.x == null || p.y == null) return;

    const r = refs.eye.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const dx = p.x - cx;
    const dy = p.y - cy;

    const a = Math.atan2(dy, dx);
    tx = Math.cos(a) * MAX;
    ty = Math.sin(a) * MAX;

    requestTick();
  }

  function reset() {
    tx = 0;
    ty = 0;
    requestTick();
  }

  // Desktop + Mobile (pointer)
  window.addEventListener("pointermove", move, { passive: true });

  // Fallback vieux iOS (au cas où)
  window.addEventListener("touchmove", move, { passive: true });

  // Reset
  window.addEventListener("blur", reset);
  document.addEventListener("mouseleave", reset);
  window.addEventListener("pointerleave", reset);

  // Orientation / resize => reset + update class
  window.addEventListener("resize", () => {
    applyOrientationClass();
    reset();
  }, { passive: true });

  window.addEventListener("orientationchange", () => {
    applyOrientationClass();
    reset();
  }, { passive: true });
}

/* =========================
   EYE BLINK
========================= */
function setupEyeBlink() {
  const eye = document.getElementById("eyeWrap");
  if (!eye) return;

  clearTimeout(window._blinkT);

  function loop() {
    window._blinkT = setTimeout(() => {
      eye.classList.remove("blink");
      void eye.offsetWidth; // reflow
      eye.classList.add("blink");
      loop();
    }, 6000 + Math.random() * 5000);
  }

  loop();
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

  applyOrientationClass();

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

  applyOrientationClass();

  document.getElementById("home").onclick = () => homeMenuUI(save);
}

/* =========================
   I18N
========================= */
function i18n(lang) {
  const fr = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "POLITARIA",
    audio: "Son",
    play: "Jouer",
    hint: "Appuie sur l’œil — {name}, prêt à défendre ?",
    helpText: "Clique sur l’œil pour commencer.",
    welcome: "Bienvenue !",
    welcomeSub: "Configuration initiale.",
    start: "Commencer",
    guest: "Invité",
    menu: "Menu",
    home: "Accueil"
  };

  const en = {
    titleTop: "TOWER DEFENSE",
    titleBottom: "POLITARIA",
    audio: "Audio",
    play: "Play",
    hint: "Click the eye — {name}, ready?",
    helpText: "Click the eye to start.",
    welcome: "Welcome!",
    welcomeSub: "Initial setup.",
    start: "Start",
    guest: "Guest",
    menu: "Menu",
    home: "Home"
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
      position:"fixed",
      left:"50%",
      bottom:"26px",
      transform:"translateX(-50%)",
      background:"rgba(0,0,0,.55)",
      border:"1px solid rgba(255,255,255,.18)",
      padding:"10px 12px",
      borderRadius:"12px",
      color:"#fff",
      zIndex:"99",
      opacity:"0",
      transition:"opacity .15s ease",
      maxWidth:"min(560px, 92vw)",
      textAlign:"center",
      fontFamily:"system-ui, Arial"
    });
  }
  el.textContent = text;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => el.style.opacity = "0", 2200);
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
