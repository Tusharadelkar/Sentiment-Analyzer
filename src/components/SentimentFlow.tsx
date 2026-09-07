"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { SentenceAnalysis } from "@/lib/gemini";

interface SentimentFlowProps {
  sentences: SentenceAnalysis[];
}

const CustomDot = (props: { cx?: number; cy?: number; payload?: SentenceAnalysis }) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color =
    payload.sentiment === "positive"
      ? "#10b981"
      : payload.sentiment === "negative"
      ? "#ef4444"
      : "#f59e0b";
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={1.5} />;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: SentenceAnalysis }>; label?: string | number }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const color =
      item.sentiment === "positive" ? "#10b981" : item.sentiment === "negative" ? "#ef4444" : "#f59e0b";
    return (
      <div style={{
        background: "#1a1b2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "10px 14px",
        maxWidth: 280,
        fontSize: "0.8125rem",
      }}>
        <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
          Sentence {Number(label) + 1}
        </div>
        <div style={{ color: "#f1f5f9", marginBottom: 6, lineHeight: 1.4 }}>
          &ldquo;{item.text.slice(0, 80)}{item.text.length > 80 ? "…" : ""}&rdquo;
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{
            background: color + "20",
            color,
            border: `1px solid ${color}40`,
            borderRadius: 20,
            padding: "2px 8px",
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
          }}>
            {item.sentiment}
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>
            Score: <strong style={{ color }}>{item.score > 0 ? "+" : ""}{item.score.toFixed(2)}</strong>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SentimentFlow({ sentences }: SentimentFlowProps) {
  const data = sentences.map((s, i) => ({
    index: i,
    score: s.score,
    text: s.text,
    sentiment: s.sentiment,
    emotion: s.emotion,
    confidence: s.confidence,
  }));

  // Moving average for trend line
  const windowSize = 3;
  const trendData = data.map((d, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const avg = window.reduce((sum, w) => sum + w.score, 0) / window.length;
    return { ...d, trend: avg };
  });

  return (
    <div style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="posGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="negGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="index"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `S${v + 1}`}
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="url(#posGradient)"
            fillOpacity={1}
            isAnimationActive
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: "#a78bfa" }}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#a78bfa"
            strokeWidth={2.5}
            dot={false}
            strokeDasharray="0"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 2, background: "rgba(255,255,255,0.2)", display: "inline-block" }} />
          Sentence Score
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 2.5, background: "#a78bfa", display: "inline-block" }} />
          Trend Line
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          Positive
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          Negative
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
          Neutral
        </span>
      </div>
    </div>
  );
}
