
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

function firstLaunchUI(save) {
  mount(`
    <div class="card">
      <h1 class="title">Bienvenue !</h1>
      <p class="sub">Configure ton profil (une seule fois). Tu pourras changer après.</p>

      <div class="grid">
        <div>
          <label>Pseudo</label>
          <input id="name" maxlength="16" placeholder="Ex: Rayzeal" value="${escapeHtml(save.player.name || "")}">
        </div>

        <div>
          <label>Langue</label>
          <div class="row" style="margin-top:8px">
            <div id="langFR" class="pill">FR</div>
            <div id="langEN" class="pill">EN</div>
          </div>
        </div>

        <div>
          <label>Son</label>
          <div class="row" style="margin-top:8px">
            <div id="sound" class="pill">ON</div>
          </div>
        </div>

        <div>
          <label>Action</label>
          <div class="row" style="margin-top:8px">
            <div id="reset" class="pill danger">Reset Save</div>
          </div>
        </div>
      </div>

      <div class="sep"></div>
      <button id="start" class="btn">Commencer</button>
      <div class="small">Astuce: clique “Commencer” → menu → ensuite on ajoute Play / Level.</div>
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

  langFR.onclick = () => { save.settings.language = "fr"; refresh(); };
  langEN.onclick = () => { save.settings.language = "en"; refresh(); };
  sound.onclick  = () => { save.settings.sound = !save.settings.sound; refresh(); };

  document.getElementById("reset").onclick = () => {
    localStorage.removeItem(KEY);
    boot(); // redémarre
  };

  document.getElementById("start").onclick = () => {
    const name = (document.getElementById("name").value || "").trim();
    save.player.name = name.length ? name : "Invité";
    save.firstLaunchDone = true;
    saveGame(save);
    menuUI(save);
  };

  refresh();
}

function menuUI(save) {
  mount(`
    <div class="card">
      <h1 class="title">Menu</h1>
      <p class="sub">Salut <b>${escapeHtml(save.player.name)}</b> 👋</p>

      <div class="row">
        <div class="pill active">Langue: ${save.settings.language.toUpperCase()}</div>
        <div class="pill ${save.settings.sound ? "ok" : "danger"}">Son: ${save.settings.sound ? "ON" : "OFF"}</div>
        <div class="pill">Niveau débloqué: ${save.progress.levelUnlocked}</div>
      </div>

      <div class="sep"></div>

      <button id="play" class="btn">Play (bientôt)</button>
      <div class="small">Prochaine étape: écran Play + Canvas du jeu + placement tours.</div>

      <div class="sep"></div>
      <div class="row">
        <div id="backSetup" class="pill">Modifier profil</div>
        <div id="reset" class="pill danger">Reset Save</div>
      </div>
    </div>
  `);

  document.getElementById("play").onclick = () => {
    alert("Next: on code le vrai jeu (canvas) juste après 😉");
  };

  document.getElementById("backSetup").onclick = () => {
    save.firstLaunchDone = false;
    saveGame(save);
    firstLaunchUI(save);
  };

  document.getElementById("reset").onclick = () => {
    localStorage.removeItem(KEY);
    boot();
  };
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function boot() {
  let save = loadSave();
  if (!save) {
    save = defaultSave();
    saveGame(save);
  }

  if (!save.firstLaunchDone) firstLaunchUI(save);
  else menuUI(save);
}

boot();
