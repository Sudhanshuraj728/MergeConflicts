import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const users = JSON.parse(localStorage.getItem("audiomatch_users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { setError("Invalid email or password."); return; }
    onLogin(user);
    navigate("/home");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#7c6aad,#9584c0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
            AudioMatch <span style={{ color: "#9584c0" }}>AI</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Sign in to identify songs instantly</p>
        </div>

        <div className="card animate-fadeUp" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</label>
              <input className="input-field" style={{ marginTop: 6 }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Password</label>
              <input className="input-field" style={{ marginTop: 6 }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 13, background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>}
            <button className="btn-primary" type="submit" style={{ marginTop: 4, width: "100%", padding: "14px" }}>Sign In</button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#9584c0", textDecoration: "none", fontWeight: 500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}