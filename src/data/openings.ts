// Well-known beginner opening lines, in standard algebraic notation. The tests replay every line with a move validator.
export interface Opening { id: string; en: string; es: string; side: "w" | "b"; moves: string[]; idea: { en: string; es: string } }

export const OPENINGS: Opening[] = [
  { id: "italian", en: "Italian Game", es: "Apertura italiana", side: "w", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4"],
    idea: { en: "Develop your pieces fast, aim the bishop at f7, and fight for the center with c3 and d4.", es: "Desarrolla tus piezas rápido, apunta el alfil a f7 y pelea por el centro con c3 y d4." } },
  { id: "ruy", en: "Ruy Lopez", es: "Apertura española (Ruy López)", side: "w", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"],
    idea: { en: "Pressure the knight that guards the e5 pawn, then castle early to keep your king safe.", es: "Presiona al caballo que protege el peón de e5 y enroca pronto para cuidar a tu rey." } },
  { id: "qg", en: "Queen's Gambit", es: "Gambito de dama", side: "w", moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O"],
    idea: { en: "Offer a pawn to pull Black's d-pawn away and take more control of the center.", es: "Ofrece un peón para alejar el peón de d de las negras y controlar más el centro." } },
  { id: "london", en: "London System", es: "Sistema Londres", side: "w", moves: ["d4", "d5", "Bf4", "Nf6", "e3", "e6", "Nf3", "c5", "c3", "Nc6"],
    idea: { en: "A simple setup you can play against almost anything: bishop out early, solid pawns, easy plan.", es: "Un esquema sencillo que sirve contra casi todo: alfil afuera temprano, peones sólidos y un plan fácil." } },
  { id: "sicilian", en: "Sicilian Defense", es: "Defensa siciliana", side: "b", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    idea: { en: "Fight back from move one by trading your c-pawn for White's d-pawn. It leads to sharp, active games.", es: "Pelea desde la primera jugada cambiando tu peón de c por el peón de d de las blancas. Da partidas activas y tensas." } },
  { id: "french", en: "French Defense", es: "Defensa francesa", side: "b", moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4", "e5", "c5", "a3", "Bxc3+"],
    idea: { en: "Build a solid pawn chain and strike back at White's center with c5.", es: "Arma una cadena de peones sólida y contraataca el centro blanco con c5." } },
  { id: "caro", en: "Caro-Kann Defense", es: "Defensa Caro-Kann", side: "b", moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6"],
    idea: { en: "Very solid: support d5 with the c-pawn, and bring your light-squared bishop out before closing the pawns.", es: "Muy sólida: apoya d5 con el peón de c y saca tu alfil de casillas claras antes de cerrar los peones." } },
];
