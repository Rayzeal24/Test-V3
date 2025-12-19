const KEY = "tdclash_save_v1";

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveGame(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function makeDefaultSave() {
  return {
    firstLaunchDone: false,
    player: {
      name: "",
      createdAt: Date.now(),
    },
    settings: {
      language: "fr",
      sound: true,
    },
    progress: {
      levelUnlocked: 1,
      stars: {}, // { "1": 3, "2": 2 ... }
    },
  };
}
