// App.jsx — IELTS Platform root: Login → Test Router
import { useState, useEffect } from "react";
import Variant1 from "./variants/Variant1";
import Variant2 from "./variants/Variant2";
import Variant3 from "./variants/Variant3";
import Variant4 from "./variants/Variant4";
import Variant5 from "./variants/Variant5";
// import Variant2 from "./variants/Variant2";  // add as you build them
// ... Variant3..7

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";

// ─── Login Page ───────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [dailyCode, setDailyCode] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, daily_code: dailyCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginBg}>
      <div style={styles.loginCard}>
        <div style={styles.loginLogo}>
          <span style={styles.loginLogoText}>IELTS</span>
          <span style={styles.loginLogoSub}>Exam Platform</span>
        </div>
        <h1 style={styles.loginTitle}>Sign in to your test</h1>
        <p style={styles.loginSub}>Enter your credentials and today's access code.</p>

        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <label style={styles.fieldLabel}>Email address</label>
          <input
            type="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={styles.fieldInput} placeholder="you@example.com"
          />

          <label style={styles.fieldLabel}>Password</label>
          <input
            type="password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={styles.fieldInput} placeholder="••••••••"
          />

          <label style={styles.fieldLabel}>Daily access code</label>
          <input
            type="text" required maxLength={8}
            value={dailyCode} onChange={(e) => setDailyCode(e.target.value.toUpperCase())}
            style={{ ...styles.fieldInput, textTransform: "uppercase", letterSpacing: 4, textAlign: "center", fontSize: 20, fontWeight: 700 }}
            placeholder="ABC123"
          />

          {error && <p style={styles.loginError}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? "Signing in…" : "Start Test →"}
          </button>
        </form>

        <p style={styles.loginFooter}>
          Your code is provided by your teacher on the day of the exam.
        </p>
      </div>
    </div>
  );
}

// ─── Test Router ──────────────────────────────────────────────
// Maps variantId → Component
const VARIANT_MAP = {
  1: Variant1,
  2: Variant2,
  3: Variant3,
  4: Variant4,
  5: Variant5,
  // 6: Variant6,
  // 7: Variant7,
};

function TestRouter({ user, token }) {
  const [sessionId, setSessionId] = useState(null);
  const [starting,  setStarting]  = useState(true);
  const [error,     setError]     = useState("");

  // Start or resume a session on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/sessions/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSessionId(data.sessionId);
      } catch (err) {
        setError(err.message);
      } finally {
        setStarting(false);
      }
    })();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('ielts_token');
    localStorage.removeItem('ielts_user');
    window.location.reload();
  };

  if (starting) return <LoadingScreen message="Preparing your test…" />;
  if (error)    return <ErrorScreen message={error} onRetry={handleLogout} />;
  if (!sessionId) return null;

  const VariantComponent = VARIANT_MAP[user.variantId];
  if (!VariantComponent) {
    return <ErrorScreen message={`Variant ${user.variantId} is not yet available.`} />;
  }

  return <VariantComponent sessionId={sessionId} token={token} user={user} />;
}

// ─── Root App ─────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("ielts_token"));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("ielts_user") || "null"); }
    catch { return null; }
  });

  const handleLogin = (tok, usr) => {
    localStorage.setItem("ielts_token", tok);
    localStorage.setItem("ielts_user",  JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  // Token expiry check (JWT lasts 4h; refresh page invalidates automatically)
  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <TestRouter user={user} token={token} />;
}

// ─── Utility screens ──────────────────────────────────────────
function LoadingScreen({ message }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#374151", fontSize: 16 }}>{message}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 12, textAlign: "center", maxWidth: 400, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ marginBottom: 12, color: "#1a1a2e" }}>Something went wrong</h2>
        <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
        <button onClick={onRetry || (() => window.location.reload())} style={{ padding: "10px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
          Sign out &amp; retry
        </button>
      </div>
    </div>
  );
}

// ─── Login styles (inline for self-containment) ───────────────
const styles = {
  loginBg: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    padding: 20,
  },
  loginCard: {
    background: "#fff", borderRadius: 16, padding: "48px 40px", width: "100%", maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  loginLogo: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 28 },
  loginLogoText: { fontSize: 28, fontWeight: 900, color: "#1a1a2e", letterSpacing: 2 },
  loginLogoSub:  { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  loginTitle: { fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 },
  loginSub:   { fontSize: 14, color: "#6b7280", marginBottom: 28, lineHeight: 1.5 },
  loginForm:  { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 2, marginTop: 10 },
  fieldInput: {
    padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 8,
    fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.15s",
  },
  loginError: { color: "#dc2626", fontSize: 14, background: "#fee2e2", padding: "10px 14px", borderRadius: 6, marginTop: 4 },
  loginBtn: {
    marginTop: 20, padding: "14px", background: "#1a1a2e", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer",
    transition: "all 0.15s",
  },
  loginFooter: { marginTop: 20, fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.5 },
};
