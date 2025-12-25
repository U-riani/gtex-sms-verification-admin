const KEY = "user-advanced-filter-presets";

export function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function savePresets(presets) {
  localStorage.setItem(KEY, JSON.stringify(presets));
}
