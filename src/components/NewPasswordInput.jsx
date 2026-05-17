import { useState } from "react";

/**
 * Reusable password input component with show/hide toggle
 * Used in ParentLoginModal and other auth forms
 */
export function NewPasswordInput({
  value,
  onChange,
  placeholder = "Contraseña",
  onKeyPress,
  error,
  label = "Contraseña:"
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#94a3b8",
            display: "block",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "12px 40px 12px 12px",
            borderRadius: 8,
            border: error ? "2px solid #dc2626" : "2px solid #334155",
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

        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 12,
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>

      {error && (
        <div
          style={{
            fontSize: "11px",
            color: "#dc2626",
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          fontSize: "10px",
          color: "#64748b",
          marginTop: 4,
        }}
      >
        Mínimo 6 caracteres
      </div>
    </div>
  );
}
