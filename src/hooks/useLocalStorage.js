import { useState, useCallback } from "react";

const SCHEMA_VERSION = 1;
const PROFILE_KEY = "__mal_profile";

const INITIAL_STATE = {
  version: SCHEMA_VERSION,
  nivel: 1,
  tabla: 2,
  sesiones: [],
  erroresPorTabla: {},
  rachaGlobal: 0,
  mejorRacha: 0,
  weak_points: {},
  unlocked_effects: [],
  errorLog: {},  // New: granular error tracking
  preferencias: { zenMode: true },  // New: user preferences
};

/**
 * Get the current profile from localStorage
 * Defaults to "cristobal" if not set
 */
function getCurrentProfile() {
  try {
    return localStorage.getItem(PROFILE_KEY) || "cristobal";
  } catch {
    return "cristobal";
  }
}

/**
 * Get the storage key for the current profile
 */
function getStoreKey(profile) {
  return `__mal_${profile}_v1`;
}

export function useLocalStorage() {
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const storeKey = getStoreKey(profile);

  const [store, setStore] = useState(() => {
    try {
      const saved = localStorage.getItem(storeKey);
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      if (!parsed.version || parsed.version < SCHEMA_VERSION) {
        return { ...INITIAL_STATE, ...parsed };
      }
      return parsed;
    } catch {
      return INITIAL_STATE;
    }
  });

  const saveStore = useCallback((newStore) => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(newStore));
      setStore(newStore);
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }, [storeKey]);

  const updateStore = useCallback((updater) => {
    setStore((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveStore(next);
      return next;
    });
  }, [saveStore]);

  /**
   * Record an error/attempt for granular tracking
   * @param {string} op1 - First operand (e.g., "5" in "5×7")
   * @param {string} op2 - Second operand (e.g., "7" in "5×7")
   * @param {boolean} isCorrect - Whether the attempt was correct
   * @param {string} symbol - Mathematical operator ("×", "÷", "^")
   * @param {string} banda - Optional band name for analytics
   */
  const recordError = useCallback((op1, op2, isCorrect, symbol = "×", banda = null) => {
    setStore((prev) => {
      const key = `${op1}${symbol}${op2}`;
      const entry = prev.errorLog[key] || { intentos: 0, fallos: 0, lastAttempt: null };

      entry.intentos++;
      if (!isCorrect) entry.fallos++;
      entry.rate = entry.fallos / entry.intentos;
      entry.lastAttempt = Date.now();
      if (banda) entry.banda = banda;

      const next = {
        ...prev,
        errorLog: { ...prev.errorLog, [key]: entry }
      };

      saveStore(next);
      return next;
    });
  }, [saveStore]);

  /**
   * Get the most failed operations (weak points)
   * @param {number} limit - How many to return
   * @returns {Array} Operations sorted by error rate DESC
   */
  const getMostFailedOperations = useCallback((limit = 5) => {
    return Object.entries(store.errorLog)
      .map(([key, data]) => ({ key, ...data }))
      .filter(item => item.rate > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, limit);
  }, [store.errorLog]);

  /**
   * Switch to a different profile
   */
  const switchProfile = useCallback((newProfile) => {
    try {
      localStorage.setItem(PROFILE_KEY, newProfile);
      setProfile(newProfile);

      // Load data for new profile
      const newStoreKey = getStoreKey(newProfile);
      const saved = localStorage.getItem(newStoreKey);
      const newStore = saved ? JSON.parse(saved) : INITIAL_STATE;
      setStore(newStore);
    } catch (e) {
      console.warn("Profile switch error:", e);
    }
  }, []);

  return {
    store,
    updateStore,
    recordError,
    getMostFailedOperations,
    profile,
    switchProfile
  };
}
