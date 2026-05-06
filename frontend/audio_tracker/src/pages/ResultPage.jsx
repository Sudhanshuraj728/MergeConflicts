import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ResultCard from "../components/ResultCard";
import ConfidenceBar from "../components/ConfidenceBar";

const ALT_MATCHES = [
  { song: "Perfect", artist: "Ed Sheeran", confidence: 0.71 },
  { song: "Castle on the Hill", artist: "Ed Sheeran", confidence: 0.58 },
  { song: "Photograph", artist: "Ed Sheeran", confidence: 0.44 },
];

export default function ResultPage({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { result, fileName } = location.state || {};

  useEffect(() => {
    if (!result) { navigate("/home"); return; }
    const t = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(t);
  }, [result, navigate]);

  const saveResult = () => {
    if (saved) return;
    const key = `audiomatch_history_${user.email}`;
    const history = JSON.parse(localStorage.getItem(key) || "[]");
    history.unshift({ ...result, timestamp: Date.now(), fileName });
    localStorage.setItem(key, JSON.stringify(history));
    setSaved(true);
  };

  if (!result) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        {loading ? (
          <div className="card">
            <Loader />
            {fileName && <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: -16, marginBottom: 16 }}>File: {fileName}</p>}
          </div>
        ) : (
          <div>
            <div className="animate-fadeUp" style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ fontFamily: "Syne,sans-serif", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Match Found</span>
              </div>
              <ResultCard result={result} />
            </div>

            {/* Alternate matches */}
            <div className="animate-fadeUp" style={{ animationDelay: "0.1s", opacity: 0, marginTop: 20 }}>
              <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Other Possible Matches
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALT_MATCHES.map((m, i) => (
                  <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{m.song}</p>
                        <p style={{ color: "var(--muted)", fontSize: 12 }}>{m.artist}</p>
                      </div>
                    </div>
                    <ConfidenceBar value={m.confidence} />
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="animate-fadeUp" style={{ animationDelay: "0.2s", opacity: 0, display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => navigate("/home")}
                style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.target.style.borderColor = "#9584c0"}
                onMouseLeave={e => e.target.style.borderColor = "var(--border)"}>
                ← Try Another
              </button>
              <button className="btn-primary" onClick={saveResult} disabled={saved} style={{ flex: 1, padding: "14px" }}>
                {saved ? "✓ Saved to History" : "Save Result"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}