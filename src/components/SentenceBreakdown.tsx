"use client";

import type { SentenceAnalysis } from "@/lib/gemini";
import { useState } from "react";

interface SentenceBreakdownProps {
  sentences: SentenceAnalysis[];
}

const EMOTION_ICONS: Record<string, string> = {
  joy: "😊",
  anger: "😠",
  sadness: "😢",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
  neutral: "😐",
};

export default function SentenceBreakdown({ sentences }: SentenceBreakdownProps) {
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered =
    filter === "all" ? sentences : sentences.filter((s) => s.sentiment === filter);

  const getBarColor = (score: number) => {
    if (score > 0.15) return "#10b981";
    if (score < -0.15) return "#ef4444";
    return "#f59e0b";
  };

  const getSentimentBg = (sentiment: string) => {
    if (sentiment === "positive") return "rgba(16, 185, 129, 0.08)";
    if (sentiment === "negative") return "rgba(239, 68, 68, 0.08)";
    return "rgba(245, 158, 11, 0.08)";
  };

  const getSentimentBorder = (sentiment: string) => {
    if (sentiment === "positive") return "rgba(16, 185, 129, 0.25)";
    if (sentiment === "negative") return "rgba(239, 68, 68, 0.25)";
    return "rgba(245, 158, 11, 0.25)";
  };

  return (
    <div className="sb-wrapper">
      {/* Filter Tabs */}
      <div className="sb-filters">
        {(["all", "positive", "negative", "neutral"] as const).map((f) => (
          <button
            key={f}
            className={`sb-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="sb-count">
              {f === "all"
                ? sentences.length
                : sentences.filter((s) => s.sentiment === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Sentence List */}
      <div className="sb-list">
        {filtered.length === 0 && (
          <div className="sb-empty">No sentences match this filter.</div>
        )}
        {filtered.map((sentence, idx) => {
          const originalIdx = sentences.indexOf(sentence);
          const isExpanded = expanded === originalIdx;
          const color = getBarColor(sentence.score);
          const barWidth = `${Math.abs(sentence.score) * 100}%`;

          return (
            <div
              key={originalIdx}
              className={`sb-item${isExpanded ? " expanded" : ""}`}
              style={{
                background: getSentimentBg(sentence.sentiment),
                borderColor: getSentimentBorder(sentence.sentiment),
              }}
              onClick={() => setExpanded(isExpanded ? null : originalIdx)}
            >
              <div className="sb-item-header">
                <div className="sb-index">S{originalIdx + 1}</div>
                <div className="sb-text">{sentence.text}</div>
                <div className="sb-meta">
                  <span className="sb-emotion">
                    {EMOTION_ICONS[sentence.emotion?.toLowerCase() || "neutral"] || "💬"}
                  </span>
                  <span className="sb-score" style={{ color }}>
                    {sentence.score > 0 ? "+" : ""}
                    {sentence.score.toFixed(2)}
                  </span>
                  <span className={`sb-badge badge badge-${sentence.sentiment}`}>
                    {sentence.sentiment}
                  </span>
                  <span className="sb-chevron">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Score Bar */}
              <div className="sb-bar-container">
                <div className="sb-bar-track">
                  <div
                    className="sb-bar-fill"
                    style={{
                      width: barWidth,
                      background: color,
                      marginLeft: sentence.score < 0 ? "auto" : "0",
                      boxShadow: `0 0 8px ${color}60`,
                    }}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="sb-details">
                  <div className="sb-detail-row">
                    <span className="sb-detail-label">Primary Emotion</span>
                    <span className="sb-detail-value">
                      {EMOTION_ICONS[sentence.emotion?.toLowerCase() || "neutral"]} {sentence.emotion || "Neutral"}
                    </span>
                  </div>
                  <div className="sb-detail-row">
                    <span className="sb-detail-label">Confidence</span>
                    <span className="sb-detail-value">
                      {(sentence.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="sb-detail-row">
                    <span className="sb-detail-label">Sentiment Score</span>
                    <span className="sb-detail-value" style={{ color }}>
                      {sentence.score > 0 ? "+" : ""}{sentence.score.toFixed(3)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .sb-wrapper { width: 100%; }
        
        .sb-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .sb-filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .sb-filter-btn:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
        }
        
        .sb-filter-btn.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.4);
          color: #a78bfa;
        }
        
        .sb-count {
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 0 6px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        
        .sb-list { display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; padding-right: 4px; }
        
        .sb-item {
          border: 1px solid;
          border-radius: 10px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .sb-item:hover { filter: brightness(1.15); }
        
        .sb-item-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .sb-index {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          font-weight: 700;
          min-width: 24px;
          font-family: monospace;
        }
        
        .sb-text {
          flex: 1;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .sb-item.expanded .sb-text {
          white-space: normal;
          overflow: visible;
        }
        
        .sb-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        
        .sb-emotion { font-size: 1rem; }
        
        .sb-score {
          font-size: 0.8125rem;
          font-weight: 700;
          font-family: monospace;
          min-width: 44px;
          text-align: right;
        }
        
        .sb-badge { font-size: 0.65rem; }
        
        .sb-chevron {
          color: rgba(255,255,255,0.3);
          font-size: 0.65rem;
        }
        
        .sb-bar-container { margin-top: 8px; }
        .sb-bar-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
          display: flex;
        }
        .sb-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
          min-width: 4px;
        }
        
        .sb-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .sb-detail-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .sb-detail-label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        
        .sb-detail-value {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }
        
        .sb-empty {
          text-align: center;
          color: rgba(255,255,255,0.3);
          padding: 40px;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
