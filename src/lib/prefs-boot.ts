// Server-safe: no "use client". The layout inlines this before first paint so the
// saved theme, text size and font do not flash on load.
export const STORAGE_KEY = "rumbo:prefs:v1";

export const PREFS_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"{}");var e=document.documentElement;if(p.lang)e.lang=p.lang;if(p.theme&&p.theme!=="system")e.dataset.theme=p.theme;if(p.text)e.dataset.text=p.text;e.dataset.dyslexia=String(!!p.dyslexia);e.dataset.lowdata=String(!!p.lowData);if(p.motion==="reduce")e.dataset.motion="reduce"}catch(_){}})();`;
