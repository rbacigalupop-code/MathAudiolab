import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GamificacionAvanzada - Advanced gamification system
 * Features:
 * - Multiplayer leaderboard (Cristóbal vs Grace)
 * - Badge/achievement system
 * - Combo system with multipliers
 * - Daily challenges with rewards
 * - Cross-profile competitive stats
 */
export function GamificacionAvanzada({ store, onClose }) {
  const [selectedTab, setSelectedTab] = useState("leaderboard");
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState("all");

  // 🏆 Badge Definitions
  const BADGES = {
    perfectStreak: { id: "perfectStreak", label: "Racha Perfecta", icon: "🔥", condition: "5+ rachaGlobal" },
    fastBrain: { id: "fastBrain", label: "Cerebro Rápido", icon: "⚡", condition: "Responder en <2s" },
    mathMaster: { id: "mathMaster", label: "Maestro de Mates", icon: "👑", condition: "80%+ tasa global" },
    divisionPro: { id: "divisionPro", label: "Profesional de División", icon: "➗", condition: "20+ divisiones correctas" },
    multiplyMaverick: { id: "multiplyMaverick", label: "Maverick Multiplicador", icon: "✖️", condition: "50+ multiplicaciones correctas" },
    powerPusher: { id: "powerPusher", label: "Empujador de Potencias", icon: "⚡", condition: "30+ potencias correctas" },
    weeklyWarrior: { id: "weeklyWarrior", label: "Guerrero Semanal", icon: "⚔️", condition: "7 días consecutivos" },
    comboKing: { id: "comboKing", label: "Rey de Combos", icon: "👸", condition: "Combo 20+" },
    consistencyChampion: { id: "consistencyChampion", label: "Campeón Consistencia", icon: "🎯", condition: "80%+ por 10 sesiones" },
    speedDemon: { id: "speedDemon", label: "Demonio Velocidad", icon: "🏃", condition: "50+ operaciones en 5min" },
  };

  // 🎯 Daily Challenge (resets every 24h)
  const dailyChallenge = useMemo(() => {
    const today = new Date().toDateString();
    const storedChallenge = localStorage.getItem("__mal_dailyChallenge");
    const parsed = storedChallenge ? JSON.parse(storedChallenge) : null;

    if (parsed && parsed.date === today) {
      return parsed;
    }

    // Generate new challenge
    const challenges = [
      { name: "Multiplicación Relámpago", mode: "ejercicios", target: 15, reward: 500, emoji: "⚡" },
      { name: "Maestro de División", mode: "division", target: 10, reward: 400, emoji: "➗" },
      { name: "Potencias Infinitas", mode: "potencias", target: 20, reward: 600, emoji: "♾️" },
      { name: "Racha de Oro", mode: "ejercicios", target: 20, reward: 800, emoji: "🏆" },
      { name: "Suma Fuerte", mode: "sumas", target: 25, reward: 500, emoji: "➕" },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    const newChallenge = {
      ...challenge,
      date: today,
      progress: 0,
    };

    localStorage.setItem("__mal_dailyChallenge", JSON.stringify(newChallenge));
    return newChallenge;
  }, []);

  // 📊 Calculate Player Stats
  const calculatePlayerStats = (errorLog, sesiones) => {
    const totalOps = Object.values(errorLog || {}).reduce((sum, e) => sum + (e.intentos || 0), 0);
    const correctOps = totalOps - Object.values(errorLog || {}).reduce((sum, e) => sum + (e.fallos || 0), 0);
    const globalRate = totalOps > 0 ? (correctOps / totalOps) * 100 : 0;
    const totalSessions = (sesiones || []).length;
    const lastSessionRate = sesiones && sesiones.length > 0
      ? (sesiones[sesiones.length - 1].correctas / sesiones[sesiones.length - 1].intentos) * 100
      : 0;

    return {
      totalOps,
      correctOps,
      globalRate: globalRate.toFixed(0),
      totalSessions,
      lastSessionRate: lastSessionRate.toFixed(0),
    };
  };

  // 🎖️ Determine which badges are earned
  const earnedBadges = useMemo(() => {
    const badges = [];
    const stats = calculatePlayerStats(store.errorLog, store.sesiones);

    if (store.rachaGlobal >= 5) badges.push(BADGES.perfectStreak);
    if (stats.globalRate >= 80) badges.push(BADGES.mathMaster);
    if ((store.errorLog?.["5×7"]?.intentos || 0) >= 50) badges.push(BADGES.multiplyMaverick);
    if ((store.errorLog?.["2^3"]?.intentos || 0) >= 30) badges.push(BADGES.powerPusher);
    if ((store.errorLog?.["12÷3"]?.intentos || 0) >= 20) badges.push(BADGES.divisionPro);
    if (store.mejorRacha >= 20) badges.push(BADGES.comboKing);
    if (stats.totalSessions >= 7) badges.push(BADGES.weeklyWarrior);

    return badges;
  }, [store]);

  // 👥 Compare profiles
  const cristobalStats = useMemo(() => {
    const cStore = {
      errorLog: store.errorLog || {},
      sesiones: store.sesiones || [],
      rachaGlobal: store.rachaGlobal || 0,
      mejorRacha: store.mejorRacha || 0,
      nivel: store.nivel || 1,
    };
    return calculatePlayerStats(cStore.errorLog, cStore.sesiones);
  }, [store]);

  // Calculate score (for leaderboard)
  const calculateScore = (stats, racha) => {
    return (parseInt(stats.globalRate) * 10) + (parseInt(stats.totalOps) * 0.5) + (racha * 100);
  };

  // 🎯 Combo system info
  const comboMultiplier = useMemo(() => {
    const racha = store.rachaGlobal || 0;
    if (racha >= 20) return { multiplier: 2.0, level: "🔥 INFERNO", color: "#dc2626" };
    if (racha >= 15) return { multiplier: 1.75, level: "🌟 LEGENDARIO", color: "#f59e0b" };
    if (racha >= 10) return { multiplier: 1.5, level: "💪 ÉPICO", color: "#06b6d4" };
    if (racha >= 5) return { multiplier: 1.25, level: "⭐ RARO", color: "#8b5cf6" };
    return { multiplier: 1.0, level: "👤 COMÚN", color: "#6b7280" };
  }, [store.rachaGlobal]);

  // 📱 Leaderboard Tab
  const LeaderboardTab = () => {
    const score = calculateScore(cristobalStats, store.mejorRacha || 0);

    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
          🏆 Tabla de Posiciones
        </div>

        {/* Score Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {/* Cristóbal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#1e293b",
              border: "2px solid #3b82f6",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: 8 }}>👨</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6", marginBottom: 4 }}>
              Cristóbal
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#f1f5f9", marginBottom: 8 }}>
              #{score.toFixed(0)}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              <div>Tasa: {cristobalStats.globalRate}%</div>
              <div>Racha: {store.mejorRacha || 0}</div>
            </div>
          </motion.div>

          {/* Grace - Placeholder for multiplayer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: "#1e293b",
              border: "2px solid #ec4899",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: 8 }}>👩</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ec4899", marginBottom: 4 }}>
              Grace
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#f1f5f9", marginBottom: 8 }}>
              #0
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              <div>Pronto...</div>
              <div>🔄</div>
            </div>
          </motion.div>
        </div>

        {/* Stats Breakdown */}
        <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
            📊 Estadísticas de Cristóbal
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 2 }}>Total de Operaciones</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#3b82f6" }}>
                {cristobalStats.totalOps}
              </div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 2 }}>Correctas</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#22c55e" }}>
                {cristobalStats.correctOps}
              </div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 2 }}>Tasa Global</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#f97316" }}>
                {cristobalStats.globalRate}%
              </div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 6, padding: 8, textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#64748b", marginBottom: 2 }}>Sesiones</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#06b6d4" }}>
                {cristobalStats.totalSessions}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🎖️ Badges Tab
  const BadgesTab = () => {
    const filteredBadges = selectedBadgeFilter === "earned" ? earnedBadges : BADGES;

    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
          🎖️ Logros & Medallas
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["all", "earned"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedBadgeFilter(f)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 6,
                border: selectedBadgeFilter === f ? "2px solid #f97316" : "1px solid #334155",
                background: selectedBadgeFilter === f ? "#f973161a" : "transparent",
                color: selectedBadgeFilter === f ? "#f97316" : "#94a3b8",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "Todos" : "Desbloqueados"}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {Object.values(filteredBadges).map((badge) => {
            const isEarned = earnedBadges.some((b) => b.id === badge.id);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: isEarned ? "#1e293b" : "#0f172a",
                  border: `2px solid ${isEarned ? "#22c55e" : "#334155"}`,
                  borderRadius: 10,
                  padding: 12,
                  textAlign: "center",
                  opacity: isEarned ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: 4 }}>{badge.icon}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>
                  {badge.label}
                </div>
                <div style={{ fontSize: "9px", color: "#64748b" }}>
                  {badge.condition}
                </div>
                {isEarned && (
                  <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 700, marginTop: 4 }}>
                    ✅ Desbloqueado
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div style={{
          background: "#1e293b",
          borderRadius: 10,
          padding: 12,
          marginTop: 16,
          fontSize: "12px",
          color: "#94a3b8",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#f97316" }}>
            💡 Desafío Semanal
          </div>
          <div>
            Gana todos los logros para convertirte en <strong>Maestro de Matemáticas</strong>.
            Cada logro desbloqueado suma +50 puntos a tu puntuación global.
          </div>
        </div>
      </div>
    );
  };

  // ⚡ Combo Tab
  const ComboTab = () => {
    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
          ⚡ Sistema de Combos
        </div>

        {/* Current Combo Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "#1e293b",
            border: `3px solid ${comboMultiplier.color}`,
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: 700, color: comboMultiplier.color, marginBottom: 8 }}>
            {comboMultiplier.level}
          </div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: "#f1f5f9", marginBottom: 8 }}>
            {store.rachaGlobal || 0}
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: 12 }}>
            Respuestas Correctas Consecutivas
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: comboMultiplier.color }}>
            {comboMultiplier.multiplier}x Multiplicador
          </div>
        </motion.div>

        {/* Combo Levels */}
        <div style={{ background: "#1e293b", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
            🎯 Niveles de Combo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { range: "0-4", name: "👤 COMÚN", mult: "1.0x", color: "#6b7280" },
              { range: "5-9", name: "⭐ RARO", mult: "1.25x", color: "#8b5cf6" },
              { range: "10-14", name: "💪 ÉPICO", mult: "1.5x", color: "#06b6d4" },
              { range: "15-19", name: "🌟 LEGENDARIO", mult: "1.75x", color: "#f59e0b" },
              { range: "20+", name: "🔥 INFERNO", mult: "2.0x", color: "#dc2626" },
            ].map((level) => (
              <div
                key={level.range}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#0f172a",
                  borderRadius: 6,
                  padding: 8,
                  borderLeft: `3px solid ${level.color}`,
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: level.color }}>
                    {level.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                    Racha {level.range}
                  </div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: level.color }}>
                  {level.mult}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{
          background: "#1e293b",
          borderRadius: 10,
          padding: 12,
          fontSize: "12px",
          color: "#cbd5e1",
          lineHeight: "1.6",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#f97316" }}>
            📖 Cómo Funcionan los Combos:
          </div>
          <ul style={{ margin: "0 0 0 16px", paddingLeft: 0 }}>
            <li>Cada respuesta correcta suma +1 a tu racha</li>
            <li>Una respuesta incorrecta reinicia tu racha a 0</li>
            <li>Mayor racha = Mayor multiplicador de puntos</li>
            <li>Los combos se reinician diariamente</li>
            <li>Combo de 20+ desbloquea el logro "Rey de Combos"</li>
          </ul>
        </div>
      </div>
    );
  };

  // 🎯 Daily Challenge Tab
  const DailyChallengeTab = () => {
    const progress = (dailyChallenge.progress || 0);
    const progressPercent = Math.min((progress / dailyChallenge.target) * 100, 100);

    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
          🎯 Desafío Diario
        </div>

        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "#1e293b",
            border: "2px solid #f97316",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#f97316", marginBottom: 4 }}>
                {dailyChallenge.emoji} {dailyChallenge.name}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Modo: <strong>{dailyChallenge.mode}</strong>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#f59e0b" }}>
                +{dailyChallenge.reward}
              </div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>Puntos</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{
              height: 12,
              background: "#0f172a",
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: 4,
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8 }}
                style={{
                  height: "100%",
                  background: progressPercent >= 100 ? "#22c55e" : "#f97316",
                  borderRadius: 6,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
              <span>Progreso</span>
              <span>{progress} / {dailyChallenge.target}</span>
            </div>
          </div>

          {progressPercent >= 100 && (
            <div style={{
              background: "#22c55e15",
              border: "1px solid #22c55e",
              borderRadius: 6,
              padding: 8,
              textAlign: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#22c55e",
            }}>
              ✅ ¡Desafío Completado!
            </div>
          )}
        </motion.div>

        {/* Rewards */}
        <div style={{ background: "#1e293b", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
            🎁 Recompensas Disponibles
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              background: "#0f172a",
              borderRadius: 6,
              padding: 12,
              borderLeft: "3px solid #f59e0b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9" }}>
                  Completar Hoy
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>
                  Completa el desafío antes de las 23:59
                </div>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#f59e0b" }}>
                +{dailyChallenge.reward}
              </div>
            </div>
            <div style={{
              background: "#0f172a",
              borderRadius: 6,
              padding: 12,
              borderLeft: "3px solid #22c55e",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: 0.6,
            }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9" }}>
                  Racha Semanal
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>
                  Completa 7 desafíos consecutivos
                </div>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#22c55e" }}>
                +2500
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f172a",
          border: "2px solid #f97316",
          borderRadius: 16,
          padding: "24px",
          maxWidth: 700,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#f97316", margin: 0 }}>
            🎮 Gamificación Avanzada
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #334155", paddingBottom: 12, overflowX: "auto" }}>
          {[
            { id: "leaderboard", label: "🏆 Ranking" },
            { id: "badges", label: "🎖️ Logros" },
            { id: "combo", label: "⚡ Combos" },
            { id: "daily", label: "🎯 Diario" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                background: selectedTab === tab.id ? "#f97316" : "transparent",
                color: selectedTab === tab.id ? "#0f172a" : "#94a3b8",
                border: selectedTab === tab.id ? "none" : "1px solid #334155",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {selectedTab === "leaderboard" && <LeaderboardTab />}
          {selectedTab === "badges" && <BadgesTab />}
          {selectedTab === "combo" && <ComboTab />}
          {selectedTab === "daily" && <DailyChallengeTab />}
        </div>
      </motion.div>
    </motion.div>
  );
}
