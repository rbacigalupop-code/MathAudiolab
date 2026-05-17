import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { NewPasswordInput } from "./NewPasswordInput";
import {
  validateEmail,
  validatePassword,
  validateParentName,
} from "../utils/PasswordUtils";

/**
 * Modal para login/registro de padres
 */
export function ParentLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { loginParent, registerParent, assignStudentToParent, getProfiles } =
    useLocalStorage();

  // Form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allProfiles, setAllProfiles] = useState([]);

  // Load profiles on mount
  useEffect(() => {
    const profiles = getProfiles();
    setAllProfiles(profiles);
  }, [getProfiles]);

  // Handle login
  const handleLogin = async () => {
    setError("");

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    setIsLoading(true);

    // Attempt login
    const session = loginParent(email, password);
    if (session) {
      onLoginSuccess(session);
    } else {
      setError("Correo o contraseña incorrectos");
      setPassword("");
    }

    setIsLoading(false);
  };

  // Handle sign up
  const handleSignUp = async () => {
    setError("");

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    const nameValidation = validateParentName(name);
    if (!nameValidation.valid) {
      setError(nameValidation.error);
      return;
    }

    if (selectedStudents.length === 0) {
      setError("Selecciona al menos un estudiante");
      return;
    }

    setIsLoading(true);

    // Attempt registration
    const newParent = registerParent(email, password, name);
    if (newParent) {
      // Assign students to parent
      selectedStudents.forEach((studentId) => {
        assignStudentToParent(newParent.id, studentId);
      });

      // Auto-login after signup
      const session = loginParent(email, password);
      if (session) {
        onLoginSuccess(session);
      } else {
        setError("Error al crear cuenta. Intenta de nuevo.");
      }
    } else {
      setError("Este correo ya está registrado o error al crear cuenta");
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      isSignUp ? handleSignUp() : handleLogin();
    }
  };

  const isFormValid = () => {
    if (isSignUp) {
      return (
        email.trim() &&
        password.length >= 6 &&
        name.trim() &&
        selectedStudents.length > 0
      );
    }
    return email.trim() && password.length >= 6;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 2000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 2001,
            }}
          >
            <div
              style={{
                pointerEvents: "auto",
                background: "#0f172a",
                border: "2px solid #f97316",
                borderRadius: 16,
                padding: "clamp(16px, 5vw, 24px)",
                maxWidth: "clamp(280px, 90vw, 450px)",
                width: "100%",
                maxHeight: "clamp(300px, 85vh, 85vh)",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                WebkitOverflowScrolling: "touch",
              }}
            >
            {/* Header */}
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 900,
                color: "#f97316",
                margin: "0 0 8px 0",
              }}
            >
              {isSignUp ? "📝 Crear Cuenta Padre" : "🔐 Ingresar Padre/Madre"}
            </h2>

            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: "0 0 20px 0",
              }}
            >
              {isSignUp
                ? "Crea una cuenta para seguir el progreso de tus hijos"
                : "Ingresa con tu correo y contraseña"}
            </p>

            {/* Email Input */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Correo:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="padre@ejemplo.com"
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: error && error.includes("correo") ? "2px solid #dc2626" : "2px solid #334155",
                  background: "#1e293b",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  fontWeight: 700,
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = error ? "#dc2626" : "#f97316";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "#dc2626" : "#334155";
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 20 }}>
              <NewPasswordInput
                value={password}
                onChange={setPassword}
                onKeyPress={handleKeyPress}
                placeholder="Mínimo 6 caracteres"
                label="Contraseña:"
              />
            </div>

            {/* Name Input (Sign Up only) */}
            {isSignUp && (
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Nombre:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: Juan García"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: error && error.includes("nombre") ? "2px solid #dc2626" : "2px solid #334155",
                    background: "#1e293b",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    fontWeight: 700,
                    boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = error ? "#dc2626" : "#f97316";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? "#dc2626" : "#334155";
                  }}
                />
                <div
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    marginTop: 4,
                  }}
                >
                  {name.length}/50 caracteres
                </div>
              </div>
            )}

            {/* Student Selection (Sign Up only) */}
            {isSignUp && (
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Selecciona estudiantes:
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                    gap: 8,
                  }}
                >
                  {allProfiles.length > 0 ? (
                    allProfiles.map((profile) => (
                      <motion.button
                        key={profile.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (selectedStudents.includes(profile.id)) {
                            setSelectedStudents(
                              selectedStudents.filter((id) => id !== profile.id)
                            );
                          } else {
                            setSelectedStudents([...selectedStudents, profile.id]);
                          }
                          setError("");
                        }}
                        style={{
                          padding: "12px 8px",
                          borderRadius: 8,
                          border: selectedStudents.includes(profile.id)
                            ? "2px solid #f97316"
                            : "1px solid #334155",
                          background: selectedStudents.includes(profile.id)
                            ? "#f973161a"
                            : "#1e293b",
                          color: selectedStudents.includes(profile.id)
                            ? "#f97316"
                            : "#94a3b8",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontSize: "12px",
                          fontWeight: 700,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div style={{ fontSize: "20px" }}>{profile.emoji}</div>
                        <div>{profile.label.split(" ").slice(1).join(" ")}</div>
                      </motion.button>
                    ))
                  ) : (
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "12px",
                      }}
                    >
                      No hay estudiantes disponibles
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#dc262615",
                  border: "1px solid #dc2626",
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 16,
                  color: "#dc2626",
                  fontSize: "12px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Mode Toggle */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 20,
                paddingBottom: 20,
                borderBottom: "1px solid #334155",
              }}
            >
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setEmail("");
                  setPassword("");
                  setName("");
                  setSelectedStudents([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "12px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                {isSignUp
                  ? "¿Ya tienes cuenta? Ingresa"
                  : "¿No tienes cuenta? Registrate"}
              </button>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#94a3b8",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = "#94a3b8";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#334155";
                }}
              >
                Cancelar
              </button>
              <button
                onClick={isSignUp ? handleSignUp : handleLogin}
                disabled={!isFormValid() || isLoading}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background: !isFormValid() || isLoading ? "#64748b" : "#f97316",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: !isFormValid() || isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: !isFormValid() || isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (isFormValid() && !isLoading) {
                    e.currentTarget.style.background = "#ea580c";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFormValid() && !isLoading) {
                    e.currentTarget.style.background = "#f97316";
                  }
                }}
              >
                {isLoading ? (
                  <span>⏳ {isSignUp ? "Registrando..." : "Ingresando..."}</span>
                ) : (
                  <span>{isSignUp ? "✓ Registrarse" : "✓ Ingresar"}</span>
                )}
              </button>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
