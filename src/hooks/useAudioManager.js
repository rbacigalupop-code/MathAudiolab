import { useRef, useCallback } from "react";
import * as Tone from "tone";

let samplerInstances = {};
let samplerPromises = {};
let usingFallback = {};
let distortionNode = null;
let masterVolume = null;
let rockModeActive = false;

export const INSTRUMENTOS = {
  "bass-electric": {
    label: "🎸 Bajo eléctrico",
    cdns: [
      "https://storage.googleapis.com/magentadata/js/soundfont/sgm_plus/",
      "https://cdn.jsdelivr.net/npm/tonejs-instrument-bass-electric@1.1.4/",
    ],
    samples: {
      E1:"E1.mp3",F1:"F1.mp3","F#1":"Fs1.mp3",G1:"G1.mp3","G#1":"Gs1.mp3",A1:"A1.mp3","A#1":"As1.mp3",B1:"B1.mp3",
      C2:"C2.mp3","C#2":"Cs2.mp3",D2:"D2.mp3","D#2":"Ds2.mp3",E2:"E2.mp3",F2:"F2.mp3","F#2":"Fs2.mp3",G2:"G2.mp3","G#2":"Gs2.mp3",A2:"A2.mp3","A#2":"As2.mp3",B2:"B2.mp3",
      C3:"C3.mp3","C#3":"Cs3.mp3",D3:"D3.mp3","D#3":"Ds3.mp3",E3:"E3.mp3",F3:"F3.mp3","F#3":"Fs3.mp3",G3:"G3.mp3","G#3":"Gs3.mp3",A3:"A3.mp3",
    },
    eq: { low: 2, mid: 0, high: -3 },
  },
  "piano": {
    label: "🎹 Piano",
    cdns: [
      "https://tonejs.github.io/audio/salamander/",
      "https://cdn.jsdelivr.net/npm/@tonejs/piano/",
    ],
    samples: {
      A0:"A0.mp3",C1:"C1.mp3","D#1":"Ds1.mp3","F#1":"Fs1.mp3",
      A1:"A1.mp3",C2:"C2.mp3","D#2":"Ds2.mp3","F#2":"Fs2.mp3",
      A2:"A2.mp3",C3:"C3.mp3","D#3":"Ds3.mp3","F#3":"Fs3.mp3",
      A3:"A3.mp3",C4:"C4.mp3","D#4":"Ds4.mp3","F#4":"Fs4.mp3",
      A4:"A4.mp3",C5:"C5.mp3","D#5":"Ds5.mp3","F#5":"Fs5.mp3",
      A5:"A5.mp3",C6:"C6.mp3",
    },
    eq: { low: -2, mid: 0, high: 1 },
  },
  "guitar-acoustic": {
    label: "🎸 Guitarra acústica",
    cdns: [
      "https://storage.googleapis.com/magentadata/js/soundfont/sgm_plus/",
      "https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic@1.1.4/",
    ],
    samples: {
      E2:"E2.mp3",F2:"F2.mp3","F#2":"Fs2.mp3",G2:"G2.mp3","G#2":"Gs2.mp3",A2:"A2.mp3","A#2":"As2.mp3",B2:"B2.mp3",
      C3:"C3.mp3","C#3":"Cs3.mp3",D3:"D3.mp3","D#3":"Ds3.mp3",E3:"E3.mp3",F3:"F3.mp3","F#3":"Fs3.mp3",G3:"G3.mp3","G#3":"Gs3.mp3",A3:"A3.mp3","A#3":"As3.mp3",B3:"B3.mp3",
      C4:"C4.mp3","C#4":"Cs4.mp3",D4:"D4.mp3",E4:"E4.mp3",
    },
    eq: { low: 0, mid: 1, high: 0 },
  },
};

function buildInstrumentSynth(instrumentType) {
  const eq = new Tone.EQ3({ low: 6, mid: -2, high: -8 });
  const vol = new Tone.Volume(-4);
  let config, filter;

  if (instrumentType === "bass-electric") {
    config = {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.8 },
    };
    filter = new Tone.Filter({ frequency: 400, type: "lowpass" });
  } else if (instrumentType === "guitar-acoustic") {
    config = {
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.5 },
    };
    filter = new Tone.Filter({ frequency: 8000, type: "highpass" });
  } else if (instrumentType === "piano") {
    config = {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 1.5 },
    };
    filter = new Tone.Filter({ frequency: 5000, type: "lowpass" });
  } else {
    config = {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 1.2 },
    };
    filter = new Tone.Filter({ frequency: 5000, type: "lowpass" });
  }

  const synth = new Tone.PolySynth(Tone.Synth, config);
  synth.connect(filter);
  filter.connect(eq);
  eq.connect(vol);
  vol.connect(getRockOutputNode());

  return {
    triggerAttackRelease: (note, dur, time) => synth.triggerAttackRelease(note, dur, time),
    _isFallback: true,
    _instrumentType: instrumentType,
  };
}

function buildFallbackSynth() {
  const eq = new Tone.EQ3({ low: 6, mid: -2, high: -8 });
  const vol = new Tone.Volume(-4);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 1.2 },
  });
  synth.connect(eq); eq.connect(vol); vol.connect(getRockOutputNode());
  return { triggerAttackRelease: (note, dur, time) => synth.triggerAttackRelease(note, dur, time), _isFallback: true };
}

function ensureMasterChain() {
  if (distortionNode) return;
  distortionNode = new Tone.Distortion({ distortion: 0, wet: 0 });
  masterVolume = new Tone.Volume(2); // Aumentar volumen general (+2dB)
  distortionNode.connect(masterVolume);
  masterVolume.toDestination();
}

function getRockOutputNode() {
  ensureMasterChain();
  return distortionNode;
}

function tryLoadSampler(cdnUrl, samples, eqConfig) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) { resolved = true; reject(new Error("timeout")); }
    }, 6000);

    try {
      const s = new Tone.Sampler(samples, {
        baseUrl: cdnUrl,
        release: 1.5,
        onload: () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          const eq = new Tone.EQ3(eqConfig);
          const vol = new Tone.Volume(-2);
          s.connect(eq); eq.connect(vol); vol.connect(getRockOutputNode());
          resolve(s);
        },
        onerror: (e) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          reject(e);
        }
      });
    } catch (e) {
      if (!resolved) { resolved = true; clearTimeout(timeout); reject(e); }
    }
  });
}

function getSamplerSync(currentInstrument) {
  if (samplerInstances[currentInstrument]) return Promise.resolve(samplerInstances[currentInstrument]);
  if (samplerPromises[currentInstrument]) return samplerPromises[currentInstrument];

  const config = INSTRUMENTOS[currentInstrument];
  samplerPromises[currentInstrument] = (async () => {
    for (const cdn of config.cdns) {
      try {
        const s = await tryLoadSampler(cdn, config.samples, config.eq);
        samplerInstances[currentInstrument] = s;
        usingFallback[currentInstrument] = false;
        console.log(`✓ Samples: ${cdn}`);
        return s;
      } catch (e) {
        console.warn(`✗ CDN: ${cdn}`, e.message);
      }
    }
    usingFallback[currentInstrument] = true;
    samplerInstances[currentInstrument] = buildInstrumentSynth(currentInstrument);
    console.log(`🎹 Synth: ${currentInstrument}`);
    return samplerInstances[currentInstrument];
  })();
  return samplerPromises[currentInstrument];
}

export function useAudioManager() {
  const timeoutsRef = useRef([]);

  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const playBass = useCallback(async (note, dur = "4n", time, currentInstrument) => {
    const s = await getSamplerSync(currentInstrument);
    s.triggerAttackRelease(note, dur, time);
  }, []);

  const playVictory = useCallback(async (currentInstrument) => {
    const s = await getSamplerSync(currentInstrument);
    const t0 = Tone.now();

    // Agregar distorsión si es guitarra
    ensureMasterChain();
    const wasDistortion = distortionNode.distortion;
    const wasWet = distortionNode.wet.value;

    if (currentInstrument === "guitar-acoustic") {
      distortionNode.distortion = 0.6;
      distortionNode.wet.value = 0.7;
    }

    [["G2","8n"],["B2","8n"],["D3","8n"],["G3","4n"]].forEach(([n,d],i) => s.triggerAttackRelease(n, d, t0 + i*0.18));

    // Restaurar distorsión anterior después de la secuencia
    setTimeout(() => {
      distortionNode.distortion = wasDistortion;
      distortionNode.wet.value = wasWet;
    }, 1000);
  }, []);

  const playLevelUp = useCallback(async (currentInstrument) => {
    const s = await getSamplerSync(currentInstrument);
    const t0 = Tone.now();
    [["G2","8n"],["C3","8n"],["E3","8n"],["G3","8n"],["C4","4n"]].forEach(([n,d],i) => s.triggerAttackRelease(n, d, t0 + i*0.15));
  }, []);

  const playError = useCallback(async (currentInstrument) => {
    const s = await getSamplerSync(currentInstrument);
    const t0 = Tone.now();
    s.triggerAttackRelease("C3", "32n", t0);
    s.triggerAttackRelease("C#3", "32n", t0 + 0.08);
  }, []);

  const playLoseLife = useCallback(async (currentInstrument) => {
    const s = await getSamplerSync(currentInstrument);
    const t0 = Tone.now();
    [["G2","16n"],["F2","16n"],["E2","8n"]].forEach(([n,d],i) => s.triggerAttackRelease(n, d, t0 + i*0.18));
  }, []);

  const playDivisionSuccess = useCallback(async (currentInstrument, divisor, itemsPerGrupo) => {
    const s = await getSamplerSync(currentInstrument);
    const t0 = Tone.now();
    const baseNotes = ["E3", "G3", "B3", "D4", "E4"];
    const STEP = 0.12;
    let time = t0;
    for (let g = 0; g < divisor; g++) {
      for (let i = 0; i < itemsPerGrupo; i++) {
        const noteIdx = (g * itemsPerGrupo + i) % baseNotes.length;
        s.triggerAttackRelease(baseNotes[noteIdx], "16n", time);
        time += STEP;
      }
      time += STEP * 0.5;
    }
    s.triggerAttackRelease("E4", "4n", time);
  }, []);

  const setRockMode = useCallback((active) => {
    ensureMasterChain();
    rockModeActive = active;
    if (active) {
      distortionNode.distortion = 0.4;
      distortionNode.wet.value = 0.5;
    } else {
      distortionNode.distortion = 0;
      distortionNode.wet.value = 0;
    }
  }, []);

  /**
   * Set synchronized BPM for the Tone.Transport
   * Allows audio playback to sync with external video BPM
   * @param {number} bpm - Beats per minute (typically 60-180)
   * @returns {number} Beats per second for reference
   */
  const setSyncedBPM = useCallback((bpm) => {
    if (bpm < 40 || bpm > 240) {
      console.warn(`[BPM] Invalid BPM value: ${bpm}, clamping to valid range`);
      bpm = Math.max(40, Math.min(240, bpm));
    }
    try {
      Tone.Transport.bpm.value = bpm;
      return bpm / 60;  // Return beats per second
    } catch (e) {
      console.error("[BPM] Failed to set BPM:", e);
      return bpm / 60;
    }
  }, []);

  /**
   * Calculate dynamic note step duration based on BPM and note value
   * Used for rhythm-synchronized audio playback
   * @param {number} bpm - Beats per minute
   * @param {string} noteValue - Tone.js note value ("4n", "8n", "16n", "32n")
   * @returns {number} Step duration in seconds
   */
  const calculateStep = useCallback((bpm, noteValue = "8n") => {
    const beatDuration = 60 / bpm;  // Duration of one beat in seconds

    // Standard subdivisions based on note value
    const subdivisions = {
      "1n": 1,      // Whole note (4 beats)
      "2n": 2,      // Half note (2 beats)
      "4n": 4,      // Quarter note (1 beat)
      "8n": 8,      // Eighth note (1/2 beat)
      "16n": 16,    // Sixteenth note (1/4 beat)
      "32n": 32,    // Thirty-second note (1/8 beat)
    };

    const subdivisionFactor = subdivisions[noteValue] || 8;
    return beatDuration / subdivisionFactor;
  }, []);

  /**
   * Get the current BPM from Tone.Transport
   * @returns {number} Current BPM value
   */
  const getSyncedBPM = useCallback(() => {
    return Tone.Transport.bpm.value;
  }, []);

  return {
    playBass, playVictory, playLevelUp, playError, playLoseLife, playDivisionSuccess, setRockMode,
    getRockModeActive: () => rockModeActive,
    getSamplerSync,
    getUsingFallback: (instrumento) => instrumento ? usingFallback[instrumento] : Object.values(usingFallback).some(v => v),
    scheduleTimeout,
    cleanup,
    setSyncedBPM,
    calculateStep,
    getSyncedBPM,
    Tone,
  };
}
