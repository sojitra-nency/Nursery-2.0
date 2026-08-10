/**
 * The blocking `<head>` script that resolves light/dark before first paint.
 *
 * Shared by both root layouts (the language chooser and the localized site) so the
 * two can't disagree about the storage key or the resolution order — a mismatch
 * would flash the wrong mode when crossing between them.
 */

export const THEME_STORAGE_KEY = "nursery-theme";

/** localStorage choice wins; otherwise follow the visitor's OS preference. */
export const AUTO_MODE_SCRIPT =
  "(function(){try{var s=localStorage.getItem('" +
  THEME_STORAGE_KEY +
  "');" +
  "var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;" +
  "document.documentElement.dataset.mode=d?'dark':'light';}catch(e){}})();";
