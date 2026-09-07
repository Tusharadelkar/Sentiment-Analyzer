"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { EmotionBreakdown } from "@/lib/gemini";

interface EmotionRadarProps {
  emotions: EmotionBreakdown;
}

const EMOTION_COLORS: Record<string, string> = {
  Joy: "#fbbf24",
  Anger: "#ef4444",
  Sadness: "#60a5fa",
  Fear: "#a78bfa",
  Surprise: "#fb923c",
  Disgust: "#4ade80",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; value: number } }> }) => {
  if (active && payload && payload.length) {
    const { subject, value } = payload[0].payload;
    return (
      <div style={{
        background: "#1a1b2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: "0.8125rem",
        color: "#f1f5f9"
      }}>
        <strong>{subject}</strong>: {value.toFixed(1)}%
      </div>
    );
  }
  return null;
};

export default function EmotionRadar({ emotions }: EmotionRadarProps) {
  const data = [
    { subject: "Joy", value: emotions.joy, fullMark: 100 },
    { subject: "Anger", value: emotions.anger, fullMark: 100 },
    { subject: "Sadness", value: emotions.sadness, fullMark: 100 },
    { subject: "Fear", value: emotions.fear, fullMark: 100 },
    { subject: "Surprise", value: emotions.surprise, fullMark: 100 },
    { subject: "Disgust", value: emotions.disgust, fullMark: 100 },
  ];

  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b));
  const dominantColor = EMOTION_COLORS[dominant.subject] || "#a78bfa";

  return (
    <div className="emotion-radar-wrapper">
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }}
          />
          <Radar
            name="Emotion"
            dataKey="value"
            stroke={dominantColor}
            fill={dominantColor}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="emotion-legend">
        {data.map(({ subject, value }) => (
          <div key={subject} className="emotion-item">
            <span className="emotion-dot" style={{ background: EMOTION_COLORS[subject] }} />
            <span className="emotion-name">{subject}</span>
            <span className="emotion-val">{value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .emotion-radar-wrapper { width: 100%; }
        .emotion-legend {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        .emotion-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
        }
        .emotion-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .emotion-name { color: var(--text-secondary); }
        .emotion-val { color: var(--text-primary); font-weight: 600; margin-left: auto; }
      `}</style>
    </div>
  );
}
