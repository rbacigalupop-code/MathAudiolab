import { useCallback, useRef } from "react";

/**
 * Hook para usar Web Speech API (Text-to-Speech)
 * Permite que la foca "hable" pistas y explicaciones
 * Soporta español e inglés
 *
 * Uso:
 * const { speak, stop, isSpeaking } = useTextToSpeech();
 * speak("Hola, soy la foca", "es");
 */
export function useTextToSpeech() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const utteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);

  /**
   * Hablar un texto
   * @param {string} text - Texto a reproducir
   * @param {string} lang - Idioma ("es" para español, "en" para inglés)
   * @param {number} rate - Velocidad (0.5 - 2.0, default 1)
   * @param {number} pitch - Tono (0.5 - 2.0, default 1)
   * @param {number} volume - Volumen (0 - 1, default 1)
   */
  const speak = useCallback(
    (text, lang = "es", rate = 0.95, pitch = 1, volume = 0.8) => {
      if (!synth) {
        console.warn("Web Speech API no soportado en este navegador");
        return;
      }

      // Cancelar si está hablando
      if (isSpeakingRef.current) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "es" ? "es-ES" : "en-US";
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
      };

      utterance.onerror = (event) => {
        console.error("Error en Text-to-Speech:", event.error);
        isSpeakingRef.current = false;
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [synth]
  );

  /**
   * Detener la reproducción de voz
   */
  const stop = useCallback(() => {
    if (synth && isSpeakingRef.current) {
      synth.cancel();
      isSpeakingRef.current = false;
    }
  }, [synth]);

  /**
   * Obtener el estado de si está hablando
   */
  const isSpeaking = isSpeakingRef.current;

  return {
    speak,
    stop,
    isSpeaking,
    isSupported: !!synth,
  };
}
