// Unit converter. Everything converts through a base unit; temperature has its own formulas.
export interface Unit { id: string; en: string; es: string; factor: number }
export interface Category { id: string; en: string; es: string; units: Unit[] }

const u = (id: string, en: string, es: string, factor: number): Unit => ({ id, en, es, factor });

export const CATEGORIES: Category[] = [
  { id: "length", en: "Length", es: "Longitud", units: [
    u("mm", "millimeters", "milímetros", 0.001), u("cm", "centimeters", "centímetros", 0.01), u("m", "meters", "metros", 1), u("km", "kilometers", "kilómetros", 1000),
    u("in", "inches", "pulgadas", 0.0254), u("ft", "feet", "pies", 0.3048), u("yd", "yards", "yardas", 0.9144), u("mi", "miles", "millas", 1609.344)] },
  { id: "mass", en: "Mass", es: "Masa", units: [
    u("mg", "milligrams", "miligramos", 0.000001), u("g", "grams", "gramos", 0.001), u("kg", "kilograms", "kilogramos", 1),
    u("oz", "ounces", "onzas", 0.028349523125), u("lb", "pounds", "libras", 0.45359237)] },
  { id: "volume", en: "Volume", es: "Volumen", units: [
    u("ml", "milliliters", "mililitros", 0.001), u("l", "liters", "litros", 1), u("tsp", "teaspoons (US)", "cucharaditas (EE. UU.)", 0.00492892159375),
    u("tbsp", "tablespoons (US)", "cucharadas (EE. UU.)", 0.01478676478125), u("floz", "fluid ounces (US)", "onzas líquidas (EE. UU.)", 0.0295735295625),
    u("cup", "cups (US)", "tazas (EE. UU.)", 0.2365882365), u("gal", "gallons (US)", "galones (EE. UU.)", 3.785411784)] },
  { id: "area", en: "Area", es: "Área", units: [
    u("cm2", "square centimeters", "centímetros cuadrados", 0.0001), u("m2", "square meters", "metros cuadrados", 1), u("ft2", "square feet", "pies cuadrados", 0.09290304),
    u("ac", "acres", "acres", 4046.8564224), u("ha", "hectares", "hectáreas", 10000)] },
  { id: "speed", en: "Speed", es: "Velocidad", units: [
    u("ms", "meters per second", "metros por segundo", 1), u("kmh", "kilometers per hour", "kilómetros por hora", 1 / 3.6), u("mph", "miles per hour", "millas por hora", 0.44704)] },
  { id: "time", en: "Time", es: "Tiempo", units: [
    u("s", "seconds", "segundos", 1), u("min", "minutes", "minutos", 60), u("h", "hours", "horas", 3600), u("d", "days", "días", 86400), u("wk", "weeks", "semanas", 604800)] },
  { id: "temp", en: "Temperature", es: "Temperatura", units: [u("C", "Celsius", "Celsius", 1), u("F", "Fahrenheit", "Fahrenheit", 1), u("K", "Kelvin", "Kelvin", 1)] },
];

export const findCategory = (id: string) => CATEGORIES.find((c) => c.id === id)!;

const toCelsius = (v: number, from: string) => (from === "F" ? ((v - 32) * 5) / 9 : from === "K" ? v - 273.15 : v);
const fromCelsius = (c: number, to: string) => (to === "F" ? (c * 9) / 5 + 32 : to === "K" ? c + 273.15 : c);

export function convert(value: number, category: string, from: string, to: string): number {
  if (category === "temp") return fromCelsius(toCelsius(value, from), to);
  const units = findCategory(category).units;
  const a = units.find((x) => x.id === from)!, b = units.find((x) => x.id === to)!;
  return (value * a.factor) / b.factor;
}

/** Short, readable number: no long tails of digits, no scientific notation for normal sizes. */
export function niceNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-6) return n.toExponential(4);
  return String(parseFloat(n.toPrecision(8)));
}
