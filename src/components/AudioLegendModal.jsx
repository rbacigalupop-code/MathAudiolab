import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BAND_METADATA } from "../constants/bandMetadata";
import { useTextToSpeech } from "../hooks/useTextToSpeech";

/**
 * AudioLegendModal - Explica cómo los sonidos se aplican a las operaciones matemáticas
 * Muestra información por banda con:
 * - Explicación del audio (cómo suena)
 * - Video/ejemplo visual
 * - Botón para escuchar la explicación de la foca
 * - Pistas progresivas
 */
const AudioLegendModal = ({ isOpen, onClose }) => {
  const [selectedBanda, setSelectedBanda] = useState("mcr");
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const bandas = [
    {
      id: "mcr",
      name: "My Chemical Romance",
      icon: "🤘",
      concept: "Potencias (Octavas Ascendentes)",
    },
    {
      id: "bunkers",
      name: "Los Bunkers",
      icon: "🎵",
      concept: "División (Grupos Rítmicos)",
    },
    {
      id: "twice",
      name: "Twice",
      icon: "💃",
      concept: "Multiplicación (Escala Victoriosa)",
    },
    {
      id: "blackpink",
      name: "Blackpink",
      icon: "🔥",
      concept: "Multiplicación (Energía Explosiva)",
    },
  ];

  const getBandData = (bandId) => {
    return BAND_METADATA[bandId];
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const bandData = getBandData(selectedBanda);
      if (bandData && bandData.audioExplanation) {
        const text = `La foca explica: ${bandData.audioExplanation}`;
        speak(text, "es", 0.9);
      }
    }
  };

  const currentBand = getBandData(selectedBanda);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 p-6 flex items-center justify-between rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🎵 Cómo Funcionan los Sonidos
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Cada operación tiene su propia "firma sonora"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white text-2xl hover:rotate-90 transition-transform duration-300"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Selector de Bandas */}
            <div className="flex gap-2 flex-wrap">
              {bandas.map((banda) => (
                <button
                  key={banda.id}
                  onClick={() => setSelectedBanda(banda.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    selectedBanda === banda.id
                      ? "bg-orange-500 text-white shadow-lg scale-105"
                      : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  }`}
                >
                  {banda.icon} {banda.name}
                </button>
              ))}
            </div>

            {/* Información de la Banda */}
            {currentBand && (
              <motion.div
                key={selectedBanda}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                {/* Concepto y BPM */}
                <div>
                  <h3 className="text-lg font-bold text-orange-400 mb-2">
                    📍 {currentBand.concept}
                  </h3>
                  <p className="text-slate-300">
                    <strong>Canción:</strong> {currentBand.exampleTrack}
                  </p>
                  <p className="text-slate-300">
                    <strong>BPM:</strong> {currentBand.bpm} (Pulso rítmico)
                  </p>
                </div>

                {/* Explicación del Audio */}
                <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-orange-500">
                  <h4 className="text-orange-400 font-bold mb-2">🎧 Cómo Suena:</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {currentBand.audioExplanation}
                  </p>
                </div>

                {/* Pista de Audio General */}
                <div className="bg-blue-900/30 p-3 rounded-lg border-l-4 border-blue-400">
                  <p className="text-blue-300 italic">
                    💡 <strong>Pista:</strong> {currentBand.audioHint}
                  </p>
                </div>

                {/* Botón Hablar */}
                <motion.button
                  onClick={handleSpeak}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSpeaking
                      ? "bg-red-600 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      🔊 Escuchando... (clic para detener)
                    </>
                  ) : (
                    <>
                      🎤 Escucha a la Foca Explicar
                    </>
                  )}
                </motion.button>

                {/* Pistas Progresivas */}
                <div className="space-y-2">
                  <h4 className="text-green-400 font-bold text-sm">
                    📚 Pistas si te Atoras:
                  </h4>
                  <div className="space-y-2">
                    {currentBand.progressiveHints &&
                      currentBand.progressiveHints.map((hint, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-green-900/30 p-3 rounded border-l-4 border-green-400"
                        >
                          <p className="text-green-300 text-sm">
                            <strong>Pista {idx + 1}:</strong> {hint}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Pedagogía */}
                <div className="bg-purple-900/30 p-3 rounded-lg border-l-4 border-purple-400">
                  <h5 className="text-purple-300 font-bold text-sm mb-1">
                    🎓 Para Recordar:
                  </h5>
                  <p className="text-purple-200 text-sm">
                    {currentBand.pedagogyTip}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Resumen General */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 rounded-lg border border-slate-600">
              <h4 className="text-orange-400 font-bold mb-2">⚡ Resumen Rápido:</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>
                  🎵 <strong>MCR (Potencias):</strong> Notas que suben de octava
                  → Frecuencia se duplica → Exponencial
                </li>
                <li>
                  🎵 <strong>Bunkers (División):</strong> Grupos rítmicos iguales
                  → Reparte en partes iguales
                </li>
                <li>
                  🎵 <strong>Twice (Multiplicación):</strong> Escala victoriosa
                  → Acumulación y éxito
                </li>
                <li>
                  🎵 <strong>Blackpink (Multiplicación):</strong> Energía explosiva
                  → Poder multiplicado
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-800 border-t border-slate-700 p-4 text-center text-slate-400 text-sm rounded-b-xl">
            💡 Los sonidos están diseñados para ayudarte a SENTIR la matemática,
            no solo calcularla.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioLegendModal;
