import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSupabaseAuth() {
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Intenta obtener sesión existente
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          setUserId(session.user.id);
          setIsReady(true);
          return;
        }

        // Si no hay sesión, crea una anónima
        const { data, error: signInError } = await supabase.auth.signInAnonymously();

        if (signInError) throw signInError;
        if (data.user?.id) {
          setUserId(data.user.id);
          setIsReady(true);
        }
      } catch (err) {
        console.error("Auth error:", err);
        // Fallback: generar userId local si Supabase falla
        const localUserId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(localUserId);
        setError(err.message);
        setIsReady(true);
      }
    };

    initAuth();
  }, []);

  return { userId, isReady, error };
}
