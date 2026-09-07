"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("siq_auth", "true");
      localStorage.setItem("siq_user", username);
      router.push("/upload");
    } else {
      setError("Invalid credentials. Try admin / admin123");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-animated" />
      <div className="login-wrapper">
        {/* Logo top */}
        <div className="login-logo">
          <div className="logo-icon">🧠</div>
          <span>SentimentIQ</span>
        </div>

        <div className="login-card glass-card animate-scale-in">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-desc">
              Sign in to analyze conversation sentiment with AI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  className="input-field input-with-icon"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field input-with-icon input-with-end-icon"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-end-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error animate-fade-in">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <span>🚀</span> Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="demo-hint">
            <span className="demo-icon">💡</span>
            <span>Demo credentials: <code>admin</code> / <code>admin123</code></span>
          </div>
        </div>

        {/* Features preview */}
        <div className="login-features">
          {[
            { icon: "🎯", label: "Sentence-level analysis" },
            { icon: "🧬", label: "Emotion detection" },
            { icon: "📊", label: "Interactive KPI dashboard" },
            { icon: "🤖", label: "Powered by Gemini AI" },
          ].map(({ icon, label }) => (
            <div key={label} className="feature-chip">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
