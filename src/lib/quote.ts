import { QUOTES } from "@/data/explore";

/** The saying for a given day number (days since 1970). Same all day, a new one tomorrow, and every saying comes around. */
export const quoteOfDay = (day: number) => QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
export const todayNumber = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000); };
