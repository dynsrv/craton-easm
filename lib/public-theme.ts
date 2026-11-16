/**
 * Runs before first paint on the public pages (landing, compliance guide, legal pages).
 * A visitor's saved choice wins; a first-time visitor gets the dark theme, not the system one.
 */
export const PUBLIC_THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem('craton-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'?'light':'dark'})()`;
