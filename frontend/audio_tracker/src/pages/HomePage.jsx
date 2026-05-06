import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import Recorder from "../components/Recorder";
import WaveformPreview from "../components/WaveformPreview";

const MOCK_RESULTS = [
  { song: "Shape of You", artist: "Ed Sheeran", confidence: 0.92, album: "÷ (Divide)", year: "2017", genre: "Pop" },
  { song: "Blinding Lights", artist: "The Weeknd", confidence: 0.88, album: "After Hours", year: "2019", genre: "Synth-pop" },
  { song: "Levitating", artist: "Dua Lipa", confidence: 0.85, album: "Future Nostalgia", year: "2020", genre: "Pop" },
  { song: "Stay", artist: "The Kid LAROI & Justin Bieber", confidence: 0.79, album: "Stay", year: "2021", genre: "Pop" },
  { song: "Heat Waves", artist: "Glass Animals", confidence: 0.91, album: "Dreamland", year: "2020", genre: "Indie Pop" },
];

export default function HomePage({ user, onLogout }) {
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState("upload"); // upload | record
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [duration, setDuration] = useState("10");
  const navigate = useNavigate();

  const handleIdentify = () => {
    const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
    navigate("/result", { state: { result, fileName: file?.name } });
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={onLogout} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
        {/* Hero */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(149,132,192,0.1)", border: "1px solid rgba(149,132,192,0.2)", borderRadius: 99, padding: "6px 16px", marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: 12, color: "#9584c0", fontFamily: "Syne,sans-serif", fontWeight: 600 }}>LIVE · 50M+ Tracks in Database</span>
          </div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: "var(--text)", marginBottom: 12 }}>
            Identify Any Song<br />
            <span style={{ background: "linear-gradient(135deg,#7c6aad,#9584c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Instantly
            </span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 400, margin: "0 auto" }}>
            Upload an audio clip or record a snippet — AudioMatch AI does the rest.
          </p>
        </div>

        {/* Main card */}
        <div className="card animate-fadeUp" style={{ animationDelay: "0.15s", opacity: 0 }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 4, background: "var(--surface2)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[["upload", "Upload File", "↑"], ["record", "Record Audio", "⏺"]].map(([mode, label, icon]) => (
              <button key={mode} onClick={() => { setInputMode(mode); setFile(null); }}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                  background: inputMode === mode ? "var(--surface)" : "transparent",
                  color: inputMode === mode ? "var(--text)" : "var(--muted)",
                  boxShadow: inputMode === mode ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                }}>
                <span style={{ marginRight: 6 }}>{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* Input area */}
          {inputMode === "upload" ? (
            <UploadBox onFileSelect={setFile} selectedFile={file} />
          ) : (
            <div style={{ background: "var(--surface2)", borderRadius: 16, padding: "32px 24px", border: "1px solid var(--border)", textAlign: "center" }}>
              <Recorder onRecordingComplete={setFile} />
            </div>
          )}

          {/* Waveform preview */}
          {file && (
            <div style={{ marginTop: 16, background: "var(--surface2)", borderRadius: 12, padding: "12px 16px", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif" }}>PREVIEW</span>
                <span style={{ fontSize: 12, color: "#10b981" }}>Ready</span>
              </div>
              <WaveformPreview active={!!file} />
            </div>
          )}

          {/* Controls */}
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif", whiteSpace: "nowrap" }}>Clip Duration</span>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "DM Sans,sans-serif", flex: 1 }}>
                {["5", "10", "15", "30"].map(s => <option key={s} value={s} style={{ background: "var(--surface)" }}>{s}s</option>)}
              </select>
            </div>
            <button onClick={() => setNoiseReduction(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", border: `1px solid ${noiseReduction ? "rgba(149,132,192,0.4)" : "var(--border)"}`, borderRadius: 10, padding: "10px 16px", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: noiseReduction ? "linear-gradient(135deg,#7c6aad,#9584c0)" : "var(--border)", position: "relative", transition: "background 0.3s" }}>
                <div style={{ position: "absolute", top: 2, left: noiseReduction ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </div>
              <span style={{ fontSize: 12, color: noiseReduction ? "#9584c0" : "var(--muted)", fontFamily: "Syne,sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>Noise Reduction</span>
            </button>
          </div>

          <button className="btn-primary" disabled={!file} onClick={handleIdentify}
            style={{ marginTop: 20, width: "100%", padding: 16, fontSize: 16 }}>
            {file ? "⚡ Identify Song" : "Select audio to continue"}
          </button>
        </div>

        {/* Stats row */}
        <div className="animate-fadeUp" style={{ animationDelay: "0.25s", opacity: 0, display: "flex", gap: 16, marginTop: 24 }}>
          {[["50M+", "Songs indexed"], ["< 3s", "Match speed"], ["98%", "Accuracy rate"]].map(([val, label]) => (
            <div key={label} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg,#7c6aad,#9584c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}