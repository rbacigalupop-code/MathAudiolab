// Escala de Sol Mayor
export const SOL = [
  { t: "G2", e: "Sol" },
  { t: "A2", e: "La" },
  { t: "B2", e: "Si" },
  { t: "C3", e: "Do" },
  { t: "D3", e: "Re" },
  { t: "E3", e: "Mi" },
  { t: "F#3", e: "Fa#" },
  { t: "G3", e: "Sol" },
  { t: "A3", e: "La" },
  { t: "B3", e: "Si" },
  { t: "C4", e: "Do" },
  { t: "D4", e: "Re" },
  { t: "E4", e: "Mi" },
  { t: "G4", e: "Sol" },
];

// Colores por tabla de multiplicación
export const TC = {
  1: "#f87171",
  2: "#fb923c",
  3: "#fbbf24",
  4: "#a3e635",
  5: "#34d399",
  6: "#22d3ee",
  7: "#60a5fa",
  8: "#818cf8",
  9: "#c084fc",
  10: "#f472b6",
};

export function notaPara(tabla, factor) {
  return SOL[((tabla * factor - 1) % SOL.length)];
}

export const NIVELES = [
  { id: 1, label: "Nivel 1", desc: "Tablas 1–3", tablas: [1, 2, 3], grupos: true, pista: true },
  { id: 2, label: "Nivel 2", desc: "Tablas 2–5", tablas: [2, 3, 4, 5], grupos: true, pista: true },
  { id: 3, label: "Nivel 3", desc: "Tablas 4–7", tablas: [4, 5, 6, 7], grupos: false, pista: true },
  { id: 4, label: "Nivel 4", desc: "Tablas 6–10", tablas: [6, 7, 8, 9, 10], grupos: false, pista: false },
  { id: 5, label: "Nivel 5", desc: "Todas", tablas: [2, 3, 4, 5, 6, 7, 8, 9, 10], grupos: false, pista: false },
];

export const ACIERTOS_PARA_SUBIR = 8;

export const NIVELES_DIVISION = [
  { id: 1, label: "Nivel 1", desc: "Dividendos 6-12, divisores 2-3", minDiv: 6, maxDiv: 12, minDsr: 2, maxDsr: 3 },
  { id: 2, label: "Nivel 2", desc: "Dividendos 12-20, divisores 2-5", minDiv: 12, maxDiv: 20, minDsr: 2, maxDsr: 5 },
  { id: 3, label: "Nivel 3", desc: "Dividendos 20-50, divisores 2-7", minDiv: 20, maxDiv: 50, minDsr: 2, maxDsr: 7 },
  { id: 4, label: "Nivel 4", desc: "Dividendos 50-100, divisores 2-10", minDiv: 50, maxDiv: 100, minDsr: 2, maxDsr: 10 },
  { id: 5, label: "Nivel 5", desc: "Dividendos 50-100 (con residuo), divisores 2-10", minDiv: 50, maxDiv: 100, minDsr: 2, maxDsr: 10 },
];

export const DIVISION_COLORS = [
  "#ef4444", // Rojo
  "#f97316", // Naranja
  "#eab308", // Amarillo
  "#22c55e", // Verde
  "#06b6d4", // Cian
  "#3b82f6", // Azul
  "#8b5cf6", // Púrpura
  "#ec4899", // Rosa
  "#f43f5e", // Rojo profundo
  "#d946ef", // Magenta
];

export const educationalManual = [
  {
    id: "L01",
    materia: "Multiplicación",
    titulo: "Tabla del 7 con Seven Nation Army",
    ejemploMusical: "Rock — White Stripes",
    descripcion: "El riff principal de 'Seven Nation Army' tiene 7 notas que se repiten. Si lo cantas mientras practicas la tabla del 7, las multiplicaciones se quedan grabadas como una canción.",
    config: { modo: "ejercicios", nivel: 4, tabla: 7, instrumento: "bass-electric" },
  },
  {
    id: "L02",
    materia: "Multiplicación",
    titulo: "Tabla del 4 con ritmo Pop",
    ejemploMusical: "Pop — 4/4",
    descripcion: "Casi toda la música pop usa compases de 4 tiempos. La tabla del 4 es contar grupos de 4 beats.",
    config: { modo: "ejercicios", nivel: 2, tabla: 4, instrumento: "piano" },
  },
  {
    id: "L03",
    materia: "Potencias",
    titulo: "Potencias de 2 — Octavas",
    ejemploMusical: "Rock progresivo",
    descripcion: "Cada vez que duplicas la frecuencia de una nota, subes una octava. Las potencias de 2 son literalmente octavas musicales.",
    config: { modo: "potencias", nivel: 1, base: 2, instrumento: "bass-electric" },
  },
];
