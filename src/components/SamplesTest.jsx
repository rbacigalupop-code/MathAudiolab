import { useState, useRef } from "react";
import * as Tone from "tone";

export default function SamplesTest({ onBack }) {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);
  const samplerRef = useRef(null);

  const INSTRUMENTOS = {
    "bass-electric": {
      label: "🎸 Bajo eléctrico",
      cdns: [
        "https://cdn.jsdelivr.net/npm/tonejs-instrument-bass-electric@1.1.4/",
        "https://nbrosowsky.github.io/tonejs-instruments/samples/bass-electric/",
        "https://storage.googleapis.com/magentadata/js/soundfont/sgm_plus/",
      ],
      samples: { C2: "C2.mp3", G2: "G2.mp3", D3: "D3.mp3", A3: "A3.mp3" },
    },
    "piano": {
      label: "🎹 Piano",
      cdns: [
        "https://tonejs.github.io/audio/salamander/",
        "https://cdn.jsdelivr.net/npm/@tonejs/piano/",
      ],
      samples: { C2: "C2.mp3", C4: "C4.mp3" },
    },
    "guitar-acoustic": {
      label: "🎸 Guitarra acústica",
      cdns: [
        "https://cdn.jsdelivr.net/npm/tonejs-instrument-guitar-acoustic@1.1.4/",
        "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/",
        "https://storage.googleapis.com/magentadata/js/soundfont/sgm_plus/",
      ],
      samples: { G2: "G2.mp3", C3: "C3.mp3", E3: "E3.mp3", G3: "G3.mp3" },
    },
  };

  const testInstrument = async (key, inst) => {
    const result = { name: inst.label, cdns: [] };

    for (const cdnUrl of inst.cdns) {
      const cdnResult = { url: cdnUrl, status: "testing" };
      setResults((prev) => ({
        ...prev,
        [key]: { ...inst, cdns: [...inst.cdns.map((u) => (u === cdnUrl ? cdnResult : {})) || []] },
      }));

      try {
        const sampler = new Tone.Sampler(inst.samples, {
          baseUrl: cdnUrl,
          release: 0.5,
        });

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("timeout")), 6000);
          sampler.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          sampler.onerror = (e) => {
            clearTimeout(timeout);
            reject(e);
          };
        });

        cdnResult.status = "✅ Funcionando";
        cdnResult.color = "#22c55e";

        // Test play
        const t0 = Tone.now();
        sampler.triggerAttackRelease("C3", "4n", t0);

        sampler.dispose();
      } catch (e) {
        cdnResult.status = "❌ Error: " + e.message;
        cdnResult.color = "#ef4444";
      }

      setResults((prev) => ({ ...prev, [key]: result }));
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    await Tone.start();

    for (const [key, inst] of Object.entries(INSTRUMENTOS)) {
      await testInstrument(key, inst);
    }

    setTesting(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "#f97316", marginBottom: "10px" }}>🔍 Verificador de Samples</h1>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          Verifica que los samples de guitarra y bajo se cargan correctamente desde los CDNs.
        </p>

        <button
          onClick={runAllTests}
          disabled={testing}
          style={{
            background: testing ? "#334155" : "#f97316",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: testing ? "default" : "pointer",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          {testing ? "⏳ Probando..." : "▶️ Probar Samples"}
        </button>

        <div style={{ marginTop: "20px" }}>
          {Object.entries(results).map(([key, inst]) => (
            <div
              key={key}
              style={{
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                background: "#1e293b",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#f97316" }}>{inst.name || inst.label}</h2>
              {inst.cdns && inst.cdns.length > 0 ? (
                inst.cdns.map((cdn, i) => (
                  <div
                    key={i}
                    style={{
                      marginLeft: "20px",
                      padding: "10px",
                      background: "#0f172a",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      color: cdn.color || "#94a3b8",
                    }}
                  >
                    {cdn.status ? cdn.status : "⏳"}
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", wordBreak: "break-all" }}>
                      {cdn.url}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#64748b" }}>Sin probar aún</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "30px", padding: "15px", background: "#1e293b", borderRadius: "8px", fontSize: "14px" }}>
          <h3 style={{ marginTop: 0 }}>📋 Instrucciones:</h3>
          <ol style={{ lineHeight: "1.8" }}>
            <li>Haz clic en "Probar Samples"</li>
            <li>Espera a que se carguen los samples de cada CDN</li>
            <li>Los que digan ✅ están funcionando correctamente</li>
            <li>Haz clic en "← Volver" para regresar a la app</li>
            <li>Cambia de instrumento para probar el sonido</li>
            <li>Verifica que se escucha el audio en todos los modos</li>
          </ol>
        </div>

        <button
          onClick={onBack}
          style={{
            marginTop: "20px",
            background: "#1e293b",
            color: "#94a3b8",
            border: "1.5px solid #334155",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "700",
          }}
        >
          ← Volver a la App
        </button>
      </div>
    </div>
  );
}
