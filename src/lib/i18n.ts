"use client";
// Interface text. Feature names and descriptions live in config/features.ts.
// To add a language: add it to LANGS, add a column here, and add it to L10n
// in config/features.ts.
import type { Lang } from "@/config/features";
import { usePrefs } from "./prefs";
import { accountStrings } from "./strings-account";

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
];

const base = {
  skip: { en: "Skip to content", es: "Saltar al contenido" },
  menu: { en: "Menu", es: "Menú" },
  closeMenu: { en: "Close menu", es: "Cerrar menú" },
  more: { en: "More", es: "Más" },
  home: { en: "Home", es: "Inicio" },
  searchFeatures: { en: "Search every feature", es: "Buscar cualquier función" },
  searchHint: { en: "Try “GPA” or “pomodoro”", es: "Prueba “GPA” o “pomodoro”" },
  noMatches: { en: "Nothing matches that. Try another word.", es: "No hay resultados. Prueba con otra palabra." },
  pinned: { en: "Pinned", es: "Fijados" },
  pinnedEmpty: { en: "Tap the star on any feature to pin it here.", es: "Toca la estrella de cualquier función para fijarla aquí." },
  pin: { en: "Pin to top", es: "Fijar arriba" },
  unpin: { en: "Unpin", es: "Quitar de fijados" },
  collapseSidebar: { en: "Collapse menu", es: "Contraer menú" },
  expandSidebar: { en: "Expand menu", es: "Expandir menú" },
  expandSection: { en: "Show", es: "Mostrar" },
  collapseSection: { en: "Hide", es: "Ocultar" },
  comingSoon: { en: "Coming soon", es: "Próximamente" },
  soonTitle: { en: "Not built yet", es: "Aún no está lista" },
  soonLead: { en: "Here is what it will do:", es: "Esto es lo que va a hacer:" },
  worksOffline: { en: "Will work with no internet.", es: "Va a funcionar sin internet." },
  backTo: { en: "Back to", es: "Volver a" },
  allTools: { en: "Everything in this section", es: "Todo lo de esta sección" },
  language: { en: "Language", es: "Idioma" },
  theme: { en: "Theme", es: "Tema" },
  themeSystem: { en: "Match my device", es: "Igual que mi dispositivo" },
  themeLight: { en: "Day", es: "Día" },
  themeDark: { en: "Night trail", es: "Noche" },
  switchTheme: { en: "Switch day or night", es: "Cambiar entre día y noche" },
  textSize: { en: "Text size", es: "Tamaño del texto" },
  textNormal: { en: "Normal", es: "Normal" },
  textLarge: { en: "Large", es: "Grande" },
  textXLarge: { en: "Extra large", es: "Muy grande" },
  dyslexia: { en: "Dyslexia-friendly font", es: "Letra para dislexia" },
  dyslexiaHelp: { en: "Switches every word to OpenDyslexic.", es: "Cambia todo el texto a OpenDyslexic." },
  lowData: { en: "Low data mode", es: "Ahorro de datos" },
  lowDataHelp: { en: "Turns off background textures and extras to save data.", es: "Quita texturas y adornos para gastar menos datos." },
  motion: { en: "Reduce motion", es: "Menos movimiento" },
  motionHelp: { en: "Stops stamps, stitching and other small animations.", es: "Detiene los sellos, las puntadas y otras animaciones pequeñas." },
  resetPrefs: { en: "Reset to defaults", es: "Volver a lo original" },
  homeAsk: { en: "What are you looking for today?", es: "¿Qué estás buscando hoy?" },
  homePlaceholder: { en: "chess tournaments for middle schoolers near Edinburg", es: "torneos de ajedrez para secundaria cerca de Edinburg" },
  homeSearch: { en: "Search", es: "Buscar" },
  homeTry: { en: "Or start somewhere", es: "O empieza por aquí" },
  homeShortcuts: {
    en: "These are being built in order. The ones with a badge are not ready yet.",
    es: "Las estamos construyendo en orden. Las que tienen etiqueta todavía no están listas.",
  },
  guestNote: {
    en: "You are using the app as a guest. What you save stays on this device.",
    es: "Estás usando la app como invitado. Lo que guardes se queda en este dispositivo.",
  },
  appearance: { en: "Appearance and access", es: "Apariencia y accesibilidad" },
  built: { en: "Ready", es: "Lista" },
  stylesheetHidden: { en: "Style guide", es: "Guía de estilo" },
} as const;

const dict = { ...base, ...accountStrings };

export type Key = keyof typeof dict;

export function translate(lang: Lang, key: Key): string {
  return dict[key][lang];
}

export function useLang(): Lang {
  return usePrefs().lang;
}

/** Interface strings in the student's language. */
export function useT() {
  const lang = useLang();
  return (key: Key) => dict[key][lang];
}
