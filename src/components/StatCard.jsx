export function StatCard({ label, value, color = "#f97316", variant = "default" }) {
  const bgVariant = variant === "dark" ? "#1f0808" : "#1e293b";
  const borderVariant = variant === "dark" ? "#7f1d1d" : "#334155";

  return (
    <div
      style={{
        flex: 1,
        background: bgVariant,
        border: `1.5px solid ${borderVariant}`,
        borderRadius: 12,
        padding: "8px 10px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "clamp(8px, 1.2vw, 10px)", color: "#64748b", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 800, color }}>
        {value}
      </div>
    </div>
  );
}
