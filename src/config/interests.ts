import type { L10n } from "./features";

export interface Interest { id: string; name: L10n }
const i = (id: string, en: string, es: string): Interest => ({ id, name: { en, es } });

export const INTERESTS: Interest[] = [
  i("chess", "Chess", "Ajedrez"), i("soccer", "Soccer", "Fútbol"), i("basketball", "Basketball", "Básquetbol"),
  i("baseball", "Baseball and softball", "Béisbol y softbol"), i("medicine", "Medicine", "Medicina"),
  i("nursing", "Nursing and health", "Enfermería y salud"), i("coding", "Coding", "Programación"),
  i("robotics", "Robotics", "Robótica"), i("engineering", "Engineering", "Ingeniería"),
  i("science", "Science", "Ciencias"), i("math", "Math", "Matemáticas"), i("art", "Art", "Arte"),
  i("music", "Music", "Música"), i("dance", "Dance", "Baile"), i("theater", "Theater", "Teatro"),
  i("film", "Film and video", "Cine y video"), i("photo", "Photography", "Fotografía"),
  i("law", "Law", "Derecho"), i("debate", "Debate and speaking", "Debate y oratoria"),
  i("business", "Business", "Negocios"), i("animals", "Animals", "Animales"),
  i("environment", "Environment", "Medio ambiente"), i("writing", "Writing", "Escritura"),
  i("volunteering", "Volunteering", "Voluntariado"), i("gaming", "Gaming", "Videojuegos"),
  i("cooking", "Cooking", "Cocina"), i("fashion", "Fashion", "Moda"), i("teaching", "Teaching", "Enseñanza"),
  i("trades", "Trades and building", "Oficios y construcción"), i("aviation", "Aviation", "Aviación"),
  i("cars", "Cars and mechanics", "Autos y mecánica"), i("history", "History", "Historia"),
  i("languages", "Languages", "Idiomas"), i("first-responders", "Police, fire and EMS", "Policía, bomberos y paramédicos"),
];

export const INTEREST_IDS = new Set(INTERESTS.map((x) => x.id));
export const INTEREST_MIN = 3;
export const INTEREST_MAX = 10;
