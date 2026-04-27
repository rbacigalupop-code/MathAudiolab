import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export interface UserProfile {
  id: string;
  userId: string;
  nombre: string;
  edad: number;
  createdAt: string;
  stats: {
    nivel: number;
    rachaGlobal: number;
    mejorRacha: number;
    weak_points: Record<string, any>;
    unlocked_effects: string[];
    sesiones: Array<{ fecha: string; correctas: number; intentos: number }>;
  };
}

export function useProfileManager(userId: string) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los perfiles del usuario
  const loadProfiles = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const parsedProfiles = (data || []).map((p: any) => ({
        ...p,
        stats: typeof p.stats === "string" ? JSON.parse(p.stats) : p.stats || getDefaultStats(),
      }));

      setProfiles(parsedProfiles);

      // Auto-seleccionar el primer perfil si existe
      if (parsedProfiles.length > 0) {
        setActiveProfile(parsedProfiles[0]);
      }

      setError(null);
    } catch (err) {
      console.error("Error cargando perfiles:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Crear un nuevo perfil
  const createProfile = useCallback(
    async (nombre: string, edad: number) => {
      if (!userId) {
        setError("Usuario no autenticado");
        return null;
      }

      try {
        const newProfile: Partial<UserProfile> = {
          userId,
          nombre,
          edad,
          createdAt: new Date().toISOString(),
          stats: getDefaultStats(),
        };

        const { data, error: err } = await supabase
          .from("user_profiles")
          .insert([newProfile])
          .select()
          .single();

        if (err) throw err;

        const profile = {
          ...data,
          stats: typeof data.stats === "string" ? JSON.parse(data.stats) : data.stats,
        };

        setProfiles([profile, ...profiles]);
        setActiveProfile(profile);
        setError(null);

        return profile;
      } catch (err) {
        console.error("Error creando perfil:", err);
        setError(err instanceof Error ? err.message : "Error al crear perfil");
        return null;
      }
    },
    [userId, profiles]
  );

  // Actualizar estadísticas de un perfil
  const updateProfileStats = useCallback(
    async (profileId: string, newStats: Partial<UserProfile["stats"]>) => {
      if (!userId) return;

      try {
        const mergedStats = {
          ...activeProfile?.stats,
          ...newStats,
        };

        const { error: err } = await supabase
          .from("user_profiles")
          .update({ stats: mergedStats })
          .eq("id", profileId)
          .eq("user_id", userId);

        if (err) throw err;

        // Actualizar local state
        const updatedProfiles = profiles.map((p) =>
          p.id === profileId ? { ...p, stats: mergedStats } : p
        );
        setProfiles(updatedProfiles);

        if (activeProfile?.id === profileId) {
          setActiveProfile({ ...activeProfile, stats: mergedStats });
        }

        setError(null);
      } catch (err) {
        console.error("Error actualizando perfil:", err);
        setError(err instanceof Error ? err.message : "Error al actualizar");
      }
    },
    [userId, activeProfile, profiles]
  );

  // Seleccionar un perfil activo
  const selectProfile = useCallback((profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      localStorage.setItem("activeProfileId", profileId);
    }
  }, [profiles]);

  // Eliminar un perfil
  const deleteProfile = useCallback(
    async (profileId: string) => {
      if (!userId) return;

      try {
        const { error: err } = await supabase
          .from("user_profiles")
          .delete()
          .eq("id", profileId)
          .eq("user_id", userId);

        if (err) throw err;

        const updated = profiles.filter((p) => p.id !== profileId);
        setProfiles(updated);

        if (activeProfile?.id === profileId) {
          setActiveProfile(updated[0] || null);
          localStorage.removeItem("activeProfileId");
        }

        setError(null);
      } catch (err) {
        console.error("Error eliminando perfil:", err);
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    },
    [userId, profiles, activeProfile]
  );

  // Cargar perfiles al montar
  useEffect(() => {
    loadProfiles();
  }, [userId, loadProfiles]);

  // Restaurar perfil activo de localStorage
  useEffect(() => {
    if (profiles.length > 0 && !activeProfile) {
      const savedId = localStorage.getItem("activeProfileId");
      const profile = savedId ? profiles.find((p) => p.id === savedId) : profiles[0];
      if (profile) {
        setActiveProfile(profile);
      }
    }
  }, [profiles, activeProfile]);

  return {
    profiles,
    activeProfile,
    loading,
    error,
    createProfile,
    selectProfile,
    deleteProfile,
    updateProfileStats,
    loadProfiles,
  };
}

function getDefaultStats() {
  return {
    nivel: 1,
    rachaGlobal: 0,
    mejorRacha: 0,
    weak_points: {},
    unlocked_effects: [],
    sesiones: [],
  };
}
