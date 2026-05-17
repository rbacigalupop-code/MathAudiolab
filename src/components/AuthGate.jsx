import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ParentLoginModal } from "./ParentLoginModal";
import { ParentDashboard } from "./ParentDashboard";
import { ProfileSelector } from "./ProfileSelector";

/**
 * AuthGate: Route between student and parent modes
 * Sits after SplashScreen in app initialization flow
 *
 * Responsibilities:
 * 1. Check for existing parent session
 * 2. Show parent/student mode selector
 * 3. Route to ParentDashboard or ProfileSelector based on mode
 * 4. Signal back when a student profile is selected (MainApp is rendered by parent App.jsx)
 */
export default function AuthGate({ onProfileSelected }) {
  const { getParentSession } = useLocalStorage();

  // State
  const [parentSession, setParentSession] = useState(null);
  const [isParentMode, setIsParentMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for parent session on mount
  useEffect(() => {
    const checkParentSession = () => {
      const session = getParentSession();
      if (session) {
        setParentSession(session);
        setIsParentMode(true);
      }
      setIsLoading(false);
    };

    setTimeout(checkParentSession, 100);
  }, [getParentSession]);

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0f172a",
        }}
      >
        <div style={{ fontSize: "24px", color: "#f97316" }}>⏳</div>
      </motion.div>
    );
  }

  // If parent session exists, show ParentDashboard
  if (parentSession && isParentMode) {
    return (
      <ParentDashboard
        parentSession={parentSession}
        onSessionChange={(newSession) => {
          if (newSession) {
            setParentSession(newSession);
          } else {
            setParentSession(null);
            setIsParentMode(false);
            setShowLoginModal(false);
          }
        }}
      />
    );
  }

  // Default: Show mode selector
  return (
    <AnimatePresence mode="wait">
      {showLoginModal && isParentMode ? (
        <ParentLoginModal
          key="parent-login"
          isOpen={true}
          onClose={() => {
            setShowLoginModal(false);
            setIsParentMode(false);
          }}
          onLoginSuccess={(session) => {
            setParentSession(session);
            setShowLoginModal(false);
          }}
        />
      ) : (
        <motion.div
          key="mode-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#0f172a",
            padding: "clamp(16px, 5vw, 20px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 40,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <p
              style={{
                fontSize: "clamp(20px, 5vw, 28px)",
                fontWeight: 900,
                color: "#f1f5f9",
                margin: "0 0 12px 0",
              }}
            >
              🎓 MathAudioLab
            </p>

            <p
              style={{
                fontSize: "clamp(12px, 3vw, 14px)",
                color: "#94a3b8",
                margin: "0 0 20px 0",
              }}
            >
              ¿Eres estudiante o padre/madre?
            </p>

            {/* Toggle Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsParentMode(false);
                  setShowLoginModal(false);
                }}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: !isParentMode ? "2px solid #f97316" : "2px solid #334155",
                  background: !isParentMode ? "#f973161a" : "#1e293b",
                  color: !isParentMode ? "#f97316" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                👨‍🎓 Estudiante
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsParentMode(true);
                  setShowLoginModal(true);
                }}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: isParentMode ? "2px solid #f97316" : "2px solid #334155",
                  background: isParentMode ? "#f973161a" : "#1e293b",
                  color: isParentMode ? "#f97316" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                👨‍👩‍👧 Padre/Madre
              </motion.button>
            </div>
          </div>

          {/* Student Mode Content */}
          {!isParentMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: "100%" }}
            >
              <ProfileSelector
                onSelect={(profileId) => {
                  if (onProfileSelected) {
                    onProfileSelected(profileId);
                  }
                }}
              />
            </motion.div>
          )}

          {/* Parent Mode Message */}
          {isParentMode && !showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                color: "#94a3b8",
                maxWidth: 300,
              }}
            >
              <p style={{ fontSize: "14px", margin: "20px 0" }}>
                Haz clic en "Padre/Madre" para ingresar con tu cuenta
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Parent Login Modal */}
      {showLoginModal && isParentMode && !parentSession && (
        <ParentLoginModal
          key="parent-modal"
          isOpen={true}
          onClose={() => {
            setShowLoginModal(false);
            setIsParentMode(false);
          }}
          onLoginSuccess={(session) => {
            setParentSession(session);
            setShowLoginModal(false);
          }}
        />
      )}
    </AnimatePresence>
  );
}
