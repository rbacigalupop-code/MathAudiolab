import { useState, useCallback } from "react";

const STORE_KEY = "__mal_cristobal_v1";
const SCHEMA_VERSION = 1;

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
};

export function useLocalStorage() {
  const [store, setStore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
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
      localStorage.setItem(STORE_KEY, JSON.stringify(newStore));
      setStore(newStore);
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }, []);

  const updateStore = useCallback((updater) => {
    setStore((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveStore(next);
      return next;
    });
  }, [saveStore]);

  return { store, updateStore };
}
