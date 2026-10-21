export type ShapeId = "rectangle" | "square" | "triangle" | "circle" | "trapezoid" | "parallelogram" | "box" | "cube" | "cylinder" | "sphere" | "cone";
export interface Measure { key: string; en: string; es: string; value: number; formula: string }
export interface ShapeInfo { id: ShapeId; en: string; es: string; dims: { key: string; en: string; es: string }[]; solid: boolean }

const d = (key: string, en: string, es: string) => ({ key, en, es });
export const SHAPES: ShapeInfo[] = [
  { id: "rectangle", en: "Rectangle", es: "Rectángulo", solid: false, dims: [d("l", "length", "largo"), d("w", "width", "ancho")] },
  { id: "square", en: "Square", es: "Cuadrado", solid: false, dims: [d("s", "side", "lado")] },
  { id: "triangle", en: "Triangle", es: "Triángulo", solid: false, dims: [d("a", "side a", "lado a"), d("b", "side b (base)", "lado b (base)"), d("c", "side c", "lado c")] },
  { id: "circle", en: "Circle", es: "Círculo", solid: false, dims: [d("r", "radius", "radio")] },
  { id: "trapezoid", en: "Trapezoid", es: "Trapecio", solid: false, dims: [d("a", "top base", "base superior"), d("b", "bottom base", "base inferior"), d("h", "height", "altura"), d("c", "left side", "lado izquierdo"), d("e", "right side", "lado derecho")] },
  { id: "parallelogram", en: "Parallelogram", es: "Paralelogramo", solid: false, dims: [d("b", "base", "base"), d("h", "height", "altura"), d("s", "slanted side", "lado inclinado")] },
  { id: "box", en: "Rectangular prism", es: "Prisma rectangular", solid: true, dims: [d("l", "length", "largo"), d("w", "width", "ancho"), d("h", "height", "alto")] },
  { id: "cube", en: "Cube", es: "Cubo", solid: true, dims: [d("s", "edge", "arista")] },
  { id: "cylinder", en: "Cylinder", es: "Cilindro", solid: true, dims: [d("r", "radius", "radio"), d("h", "height", "altura")] },
  { id: "sphere", en: "Sphere", es: "Esfera", solid: true, dims: [d("r", "radius", "radio")] },
  { id: "cone", en: "Cone", es: "Cono", solid: true, dims: [d("r", "radius", "radio"), d("h", "height", "altura")] },
];

const m = (key: string, en: string, es: string, value: number, formula: string): Measure => ({ key, en, es, value, formula });
const AREA = ["area", "Area", "Área"] as const, PERI = ["perimeter", "Perimeter", "Perímetro"] as const;
const VOL = ["volume", "Volume", "Volumen"] as const, SURF = ["surface", "Surface area", "Área de superficie"] as const;

/** All the measurements for a shape. Returns null if any size is missing, not positive, or impossible (a triangle that cannot close). */
export function measure(shape: ShapeId, v: Record<string, number>): Measure[] | null {
  const need = SHAPES.find((s) => s.id === shape)!.dims;
  if (need.some((x) => !(v[x.key] > 0) || !Number.isFinite(v[x.key]))) return null;
  const PI = Math.PI;
  switch (shape) {
    case "rectangle": return [m(...AREA, v.l * v.w, "l × w"), m(...PERI, 2 * (v.l + v.w), "2 × (l + w)")];
    case "square": return [m(...AREA, v.s ** 2, "s²"), m(...PERI, 4 * v.s, "4 × s")];
    case "triangle": {
      const { a, b, c } = v;
      if (a + b <= c || a + c <= b || b + c <= a) return null;
      const s = (a + b + c) / 2;
      return [m(...AREA, Math.sqrt(s * (s - a) * (s - b) * (s - c)), "√(s(s−a)(s−b)(s−c)), s = (a+b+c)/2"), m(...PERI, a + b + c, "a + b + c")];
    }
    case "circle": return [m(...AREA, PI * v.r ** 2, "π × r²"), m("circumference", "Circumference", "Circunferencia", 2 * PI * v.r, "2 × π × r")];
    case "trapezoid": return [m(...AREA, ((v.a + v.b) / 2) * v.h, "(a + b) / 2 × h"), m(...PERI, v.a + v.b + v.c + v.e, "a + b + c + e")];
    case "parallelogram": return [m(...AREA, v.b * v.h, "b × h"), m(...PERI, 2 * (v.b + v.s), "2 × (b + s)")];
    case "box": return [m(...VOL, v.l * v.w * v.h, "l × w × h"), m(...SURF, 2 * (v.l * v.w + v.l * v.h + v.w * v.h), "2(lw + lh + wh)")];
    case "cube": return [m(...VOL, v.s ** 3, "s³"), m(...SURF, 6 * v.s ** 2, "6 × s²")];
    case "cylinder": return [m(...VOL, PI * v.r ** 2 * v.h, "π × r² × h"), m(...SURF, 2 * PI * v.r * (v.r + v.h), "2πr(r + h)")];
    case "sphere": return [m(...VOL, (4 / 3) * PI * v.r ** 3, "4/3 × π × r³"), m(...SURF, 4 * PI * v.r ** 2, "4 × π × r²")];
    case "cone": return [m(...VOL, (PI * v.r ** 2 * v.h) / 3, "π × r² × h / 3"), m(...SURF, PI * v.r * (v.r + Math.sqrt(v.r ** 2 + v.h ** 2)), "πr(r + √(r² + h²))")];
  }
}
