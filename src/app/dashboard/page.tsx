"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { AnalysisResult } from "@/lib/gemini";
import KPICard from "@/components/KPICard";
import SentenceBreakdown from "@/components/SentenceBreakdown";
import GaugeChart from "@/components/GaugeChart";
import "./dashboard.css";

// Dynamically import chart components to avoid SSR issues
const EmotionRadar = dynamic(() => import("@/components/EmotionRadar"), { ssr: false });
const SentimentFlow = dynamic(() => import("@/components/SentimentFlow"), { ssr: false });

// Pie chart imports
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SENTIMENT_COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#f59e0b",
};

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b"];

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a1b2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: "0.8125rem",
        color: "#f1f5f9"
      }}>
        <strong style={{ color: payload[0].payload.color }}>{payload[0].name}</strong>: {payload[0].value.toFixed(1)}%
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filename, setFilename] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("siq_auth");
    if (!auth) { router.push("/"); return; }

    const stored = sessionStorage.getItem("siq_result");
    const storedFile = sessionStorage.getItem("siq_filename");
    if (!stored) { router.push("/upload"); return; }

    setResult(JSON.parse(stored));
    setFilename(storedFile || "conversation.txt");
    setProvider(sessionStorage.getItem("siq_provider") || "gemini");
    setMounted(true);
  }, [router]);

  if (!mounted || !result) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p>Loading analysis…</p>
      </div>
    );
  }

  const { kpis, sentences, summary, highlights } = result;

  const getProviderName = (p: string) => {
    if (p === "openai") return "OpenAI";
    if (p === "groq") return "Groq";
    if (p === "nvidia") return "NVIDIA NIM";
    return "Google Gemini";
  };

  const pieData = [
    { name: "Positive", value: kpis.positiveRatio * 100, color: SENTIMENT_COLORS.positive },
    { name: "Negative", value: kpis.negativeRatio * 100, color: SENTIMENT_COLORS.negative },
    { name: "Neutral", value: kpis.neutralRatio * 100, color: SENTIMENT_COLORS.neutral },
  ];

  const escalationColor =
    kpis.escalationRisk === "Low" ? "#10b981" : kpis.escalationRisk === "Medium" ? "#f59e0b" : "#ef4444";
  const escalationBadge = kpis.escalationRisk === "Low" ? "positive" : kpis.escalationRisk === "Medium" ? "neutral" : "negative";

  const overallColor =
    kpis.overallSentiment === "Positive" ? "#10b981" : kpis.overallSentiment === "Negative" ? "#ef4444" : "#f59e0b";
  const overallBadge = kpis.overallSentiment === "Positive" ? "positive" : kpis.overallSentiment === "Negative" ? "negative" : "neutral";

  const driftIcon = kpis.sentimentDrift === "Improving" ? "up" : kpis.sentimentDrift === "Declining" ? "down" : "stable";

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
            <div className="filename-chip">
              <span>📄</span>
              <span>{filename}</span>
            </div>
            <button
              className="btn btn-ghost"
              style={{ padding: "8px 16px", fontSize: "0.8125rem" }}
              onClick={() => router.push("/upload")}
            >
              ↩ New Analysis
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="container">

          {/* ── HERO BANNER ── */}
          <div className={`overall-banner animate-slide-up ${kpis.overallSentiment.toLowerCase()}`}>
            <div className="banner-left">
              <div className="banner-emoji">
                {kpis.overallSentiment === "Positive" ? "😊" : kpis.overallSentiment === "Negative" ? "😟" : "😐"}
              </div>
              <div>
                <div className="banner-label">Overall Sentiment</div>
                <div className="banner-value" style={{ color: overallColor }}>
                  {kpis.overallSentiment}
                </div>
                <div className="banner-sub">
                  Confidence: {(Math.abs(kpis.sentimentScore) * 100).toFixed(0)}% • {kpis.sentenceCount} sentences analyzed
                </div>
              </div>
            </div>
            <div className="banner-right">
              <div className="banner-badges">
                <span className={`badge badge-${overallBadge}`}>
                  🎯 {kpis.overallSentiment}
                </span>
                <span className={`badge badge-${escalationBadge}`}>
                  ⚡ {kpis.escalationRisk} Risk
                </span>
                <span className="badge badge-info">
                  🌡️ {kpis.conversationTone}
                </span>
                <span className="badge badge-info">
                  {kpis.sentimentDrift === "Improving" ? "📈" : kpis.sentimentDrift === "Declining" ? "📉" : "➡️"} {kpis.sentimentDrift}
                </span>
              </div>
              <div className="banner-word-count">
                <span>📊 {kpis.wordCount} words analyzed</span>
              </div>
            </div>
          </div>

          {/* ── ROW 1: Gauge + Pie + Emotion Radar ── */}
          <div className="dash-grid-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Sentiment Gauge */}
            <div className="dash-card glass-card">
              <div className="section-header">
                <div className="section-icon">🎯</div>
                <div>
                  <div className="section-title">Sentiment Score</div>
                  <div className="section-subtitle">Range: −1 (Negative) to +1 (Positive)</div>
                </div>
              </div>
              <GaugeChart score={kpis.sentimentScore} label="Sentiment Score" />
            </div>

            {/* Sentiment Pie */}
            <div className="dash-card glass-card">
              <div className="section-header">
                <div className="section-icon">🥧</div>
                <div>
                  <div className="section-title">Sentiment Distribution</div>
                  <div className="section-subtitle">Sentence breakdown by type</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Emotion Radar */}
            <div className="dash-card glass-card">
              <div className="section-header">
                <div className="section-icon">🧬</div>
                <div>
                  <div className="section-title">Emotion Breakdown</div>
                  <div className="section-subtitle">Dominant: {kpis.dominantEmotion}</div>
                </div>
              </div>
              <EmotionRadar emotions={kpis.emotionBreakdown} />
            </div>
          </div>

          {/* ── ROW 2: KPI Cards ── */}
          <div className="section-label animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <span>📋</span> Key Performance Indicators
          </div>
          <div className="kpi-grid animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <KPICard
              icon="💬"
              title="Sentiment Score"
              value={kpis.sentimentScore > 0 ? `+${kpis.sentimentScore.toFixed(2)}` : kpis.sentimentScore.toFixed(2)}
              subtitle="Overall conversation score"
              color={overallColor}
              trend={driftIcon as "up" | "down" | "stable"}
            />
            <KPICard
              icon="✅"
              title="Positive Sentences"
              value={`${(kpis.positiveRatio * 100).toFixed(0)}%`}
              subtitle={`${Math.round(kpis.positiveRatio * kpis.sentenceCount)} of ${kpis.sentenceCount} sentences`}
              color="#10b981"
              progress={kpis.positiveRatio * 100}
            />
            <KPICard
              icon="❌"
              title="Negative Sentences"
              value={`${(kpis.negativeRatio * 100).toFixed(0)}%`}
              subtitle={`${Math.round(kpis.negativeRatio * kpis.sentenceCount)} of ${kpis.sentenceCount} sentences`}
              color="#ef4444"
              progress={kpis.negativeRatio * 100}
            />
            <KPICard
              icon="🌡️"
              title="Escalation Risk"
              value={kpis.escalationRisk}
              subtitle="Based on sentiment patterns"
              color={escalationColor}
              badge={kpis.escalationRisk}
              badgeColor={escalationBadge as "positive" | "negative" | "neutral"}
            />
            <KPICard
              icon="⭐"
              title="Customer Satisfaction"
              value={`${kpis.customerSatisfaction}/5`}
              subtitle="Estimated CSAT score"
              color="#fbbf24"
              progress={kpis.customerSatisfaction * 20}
            />
            <KPICard
              icon="🎭"
              title="Dominant Emotion"
              value={kpis.dominantEmotion}
              subtitle="Primary detected emotion"
              color="#a78bfa"
            />
            <KPICard
              icon="🏆"
              title="Resolution Likelihood"
              value={`${kpis.resolutionLikelihood.toFixed(0)}%`}
              subtitle="Probability of positive resolution"
              color="#34d399"
              progress={kpis.resolutionLikelihood}
            />
            <KPICard
              icon="📈"
              title="Sentiment Drift"
              value={kpis.sentimentDrift}
              subtitle="Trend over conversation"
              color={kpis.sentimentDrift === "Improving" ? "#10b981" : kpis.sentimentDrift === "Declining" ? "#ef4444" : "#f59e0b"}
              trend={driftIcon as "up" | "down" | "stable"}
            />
            <KPICard
              icon="💼"
              title="Conversation Tone"
              value={kpis.conversationTone.split(" ")[0]}
              subtitle={kpis.conversationTone}
              color="#60a5fa"
            />
            <KPICard
              icon="📊"
              title="Avg Sentence Score"
              value={kpis.avgSentimentScore > 0 ? `+${kpis.avgSentimentScore.toFixed(2)}` : kpis.avgSentimentScore.toFixed(2)}
              subtitle="Mean per sentence"
              color={kpis.avgSentimentScore > 0 ? "#10b981" : "#ef4444"}
            />
          </div>

          {/* Key Topics */}
          <div className="dash-card glass-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="section-header">
              <div className="section-icon">🏷️</div>
              <div>
                <div className="section-title">Key Topics Discussed</div>
                <div className="section-subtitle">Identified from conversation context</div>
              </div>
            </div>
            <div className="topics-list">
              {kpis.keyTopics.map((topic, i) => (
                <div key={i} className="topic-chip">
                  <span className="topic-num">{i + 1}</span>
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* ── ROW 3: Sentiment Flow ── */}
          <div className="dash-card glass-card animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <div className="section-header">
              <div className="section-icon">📈</div>
              <div>
                <div className="section-title">Sentiment Flow</div>
                <div className="section-subtitle">Sentiment progression across the conversation with moving average trend</div>
              </div>
            </div>
            <SentimentFlow sentences={sentences} />
          </div>

          {/* ── ROW 4: Sentence Breakdown ── */}
          <div className="dash-card glass-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="section-header">
              <div className="section-icon">🔍</div>
              <div>
                <div className="section-title">Sentence-Level Analysis</div>
                <div className="section-subtitle">
                  Click any sentence to expand details • Filter by sentiment
                </div>
              </div>
            </div>
            <SentenceBreakdown sentences={sentences} />
          </div>

          {/* ── ROW 5: AI Summary + Highlights ── */}
          <div className="dash-grid-2 animate-slide-up" style={{ animationDelay: "0.35s" }}>
            {/* Summary */}
            <div className="dash-card glass-card">
              <div className="section-header">
                <div className="section-icon">🤖</div>
                <div>
                  <div className="section-title">AI Conversation Summary</div>
                  <div className="section-subtitle">Generated by {getProviderName(provider)} AI</div>
                </div>
              </div>
              <div className="summary-text">
                {summary.split("\n\n").map((para, i) => (
                  <p key={i} style={{ marginBottom: i < summary.split("\n\n").length - 1 ? 14 : 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="dash-card glass-card">
              <div className="section-header">
                <div className="section-icon">✨</div>
                <div>
                  <div className="section-title">Key Insights</div>
                  <div className="section-subtitle">Critical findings from the analysis</div>
                </div>
              </div>
              <div className="highlights-list">
                {highlights.map((h, i) => (
                  <div key={i} className="highlight-item">
                    <div className="highlight-num">{i + 1}</div>
                    <div className="highlight-text">{h}</div>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div className="quick-stats">
                <div className="quick-stat">
                  <div className="quick-stat-value" style={{ color: "#10b981" }}>{kpis.wordCount}</div>
                  <div className="quick-stat-label">Words</div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-value" style={{ color: "#a78bfa" }}>{kpis.sentenceCount}</div>
                  <div className="quick-stat-label">Sentences</div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-value" style={{ color: "#fbbf24" }}>{kpis.keyTopics.length}</div>
                  <div className="quick-stat-label">Topics</div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-value" style={{ color: "#60a5fa" }}>6</div>
                  <div className="quick-stat-label">Emotions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dashboard-footer">
            <span>Powered by <strong>{getProviderName(provider)} AI</strong></span>
            <span>•</span>
            <span>SentimentIQ v1.0</span>
            <span>•</span>
            <button
              className="btn btn-primary"
              style={{ padding: "10px 20px", fontSize: "0.875rem" }}
              onClick={() => router.push("/upload")}
            >
              ↩ New Analysis
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
