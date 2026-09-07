"use client";

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/gemini";
import "./upload.css";

const SAMPLE_TEXT = `Agent: Thank you for calling SupportLine, my name is Sarah. How can I help you today?
Customer: Hi Sarah, I've been having trouble with my billing. I was charged twice for the same subscription.
Agent: I'm really sorry to hear that. That must be frustrating. Let me look into this for you right away.
Customer: I noticed it on my credit card statement this morning. It's the second month in a row this has happened.
Agent: I completely understand your concern. I can see the duplicate charge on your account. I'll process a full refund immediately.
Customer: Oh wow, that's great! How long will it take?
Agent: The refund will appear within 3-5 business days. I'll also add a note to ensure this doesn't happen again.
Customer: That's really reassuring. Thank you so much for resolving this quickly.
Agent: Of course! Is there anything else I can help you with today?
Customer: No, that's everything. You've been very helpful, Sarah. I'm much happier now.
Agent: Wonderful! Thank you for bringing this to our attention. Have a great day!`;

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [provider, setProvider] = useState("gemini");

  useEffect(() => {
    const auth = localStorage.getItem("siq_auth");
    if (!auth) router.push("/");
  }, [router]);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".txt")) {
      setError("Please upload a .txt file");
      return;
    }
    if (f.size > 500 * 1024) {
      setError("File too large (max 500KB)");
      return;
    }
    setError("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview((e.target?.result as string) || "");
    reader.readAsText(f);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const loadSample = () => {
    const blob = new Blob([SAMPLE_TEXT], { type: "text/plain" });
    const sampleFile = new File([blob], "sample_conversation.txt", { type: "text/plain" });
    handleFile(sampleFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setProgress(10);
    setProgressLabel("Uploading file…");

    const steps = [
      { p: 25, label: "Parsing conversation…" },
      { p: 50, label: "Analyzing sentiment with AI…" },
      { p: 75, label: "Detecting emotions…" },
      { p: 90, label: "Generating KPIs…" },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].p);
        setProgressLabel(steps[stepIdx].label);
        stepIdx++;
      }
    }, 1200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("provider", provider);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Analysis failed");
      }

      const body = await res.json();
      const result: AnalysisResult = body.data;

      setProgress(100);
      setProgressLabel("Done! Redirecting…");

      // Store result
      sessionStorage.setItem("siq_result", JSON.stringify(result));
      sessionStorage.setItem("siq_filename", body.filename);
      sessionStorage.setItem("siq_provider", provider);

      await new Promise((r) => setTimeout(r, 600));
      router.push("/dashboard");
    } catch (err) {
      clearInterval(interval);
      setError((err as Error).message || "Analysis failed. Please try again.");
      setLoading(false);
      setProgress(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("siq_auth");
    router.push("/");
  };

  return (
    <>
      <div className="bg-animated" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="logo">
            <div className="logo-icon">🧠</div>
            SentimentIQ
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              👤 admin
            </span>
            <button className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: "0.8125rem" }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="upload-main">
        <div className="container">
          {/* Page Header */}
          <div className="upload-hero animate-slide-up">
            <div className="upload-hero-badge badge badge-info">
              <span>🤖</span> AI-Powered Analysis
            </div>
            <h1 className="upload-title">
              Analyze Conversation<br />
              <span className="gradient-text">Sentiment</span>
            </h1>
            <p className="upload-subtitle">
              Upload a phone call transcript (.txt) and get deep sentiment insights,
              emotion detection, and actionable KPIs in seconds.
            </p>
          </div>

          <div className="upload-layout">
            {/* Upload Zone */}
            <div className="upload-section animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div
                id="upload-dropzone"
                className={`upload-dropzone${dragging ? " dragging" : ""}${file ? " has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt"
                  style={{ display: "none" }}
                  onChange={handleChange}
                  id="file-input"
                />

                {!file ? (
                  <div className="dropzone-empty">
                    <div className="dropzone-icon">📄</div>
                    <div className="dropzone-title">Drop your .txt file here</div>
                    <div className="dropzone-subtitle">or click to browse</div>
                    <div className="dropzone-hint">Supports conversation transcripts up to 500KB</div>
                  </div>
                ) : (
                  <div className="file-preview-header">
                    <div className="file-icon">📝</div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{(file.size / 1024).toFixed(1)} KB • {preview.split(/[.!?]+/).filter(s => s.trim().length > 10).length} sentences</div>
                    </div>
                    <button
                      className="file-remove"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(""); }}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Sample */}
              {!file && (
                <button className="sample-btn" onClick={loadSample}>
                  <span>✨</span> Try with sample conversation
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="upload-error animate-fade-in">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Provider Selection */}
              {file && !loading && (
                <div className="provider-select animate-fade-in" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Provider:</span>
                  <select 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value)}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: 6, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  >
                    <option value="gemini">Google Gemini 1.5 Flash</option>
                    <option value="openai">OpenAI GPT-4o-mini</option>
                    <option value="groq">Groq (Llama 3.1 8B)</option>
                    <option value="nvidia">NVIDIA NIM (Llama 3.1 8B)</option>
                  </select>
                </div>
              )}

              {/* Analyze Button */}
              {file && !loading && (
                <button
                  id="analyze-btn"
                  className="btn btn-primary analyze-btn animate-fade-in"
                  onClick={handleAnalyze}
                >
                  <span>🔍</span> Analyze Sentiment
                </button>
              )}

              {/* Progress */}
              {loading && (
                <div className="upload-progress animate-fade-in">
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: "var(--gradient-primary)",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  <div className="progress-meta">
                    <span className="progress-label">{progressLabel}</span>
                    <span className="progress-pct">{progress}%</span>
                  </div>
                  <div className="progress-steps">
                    {["Upload", "Parse", "Analyze", "KPIs", "Done"].map((step, i) => (
                      <div
                        key={step}
                        className={`progress-step${progress >= (i + 1) * 20 ? " done" : progress >= i * 20 ? " active" : ""}`}
                      >
                        <div className="step-dot" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {preview && (
              <div className="preview-panel glass-card animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="section-header">
                  <div className="section-icon">📋</div>
                  <div>
                    <div className="section-title">File Preview</div>
                    <div className="section-subtitle">{preview.split("\n").length} lines</div>
                  </div>
                </div>
                <div className="preview-text">{preview}</div>
              </div>
            )}
          </div>

          {/* Feature Cards */}
          <div className="feature-grid animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {[
              { icon: "🎯", title: "Sentence Analysis", desc: "Every sentence scored individually from −1 to +1 with emotion tagging" },
              { icon: "🧬", title: "Emotion Detection", desc: "Detects joy, anger, sadness, fear, surprise & disgust with radar visualization" },
              { icon: "📊", title: "10+ KPIs", desc: "Escalation risk, CSAT estimate, sentiment drift, tone classification & more" },
              { icon: "📝", title: "AI Summary", desc: "Gemini-generated conversation summary with key highlights & insights" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="feature-card glass-card">
                <div className="feature-card-icon">{icon}</div>
                <div className="feature-card-title">{title}</div>
                <div className="feature-card-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
