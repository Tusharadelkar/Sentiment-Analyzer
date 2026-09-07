"use client";

import { useEffect, useRef } from "react";

interface GaugeChartProps {
  score: number; // -1 to 1
  label?: string;
}

export default function GaugeChart({ score, label }: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 240;
    canvas.width = size;
    canvas.height = size * 0.65;

    const cx = size / 2;
    const cy = size * 0.62;
    const radius = size * 0.40;
    const startAngle = Math.PI;
    const endAngle = 0;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.stroke();

    // Colored arc segments
    const segments = [
      { start: Math.PI, end: Math.PI * 1.25, color: "#ef4444" },
      { start: Math.PI * 1.25, end: Math.PI * 1.5, color: "#f97316" },
      { start: Math.PI * 1.5, end: Math.PI * 1.75, color: "#eab308" },
      { start: Math.PI * 1.75, end: Math.PI * 2, color: "#22c55e" },
    ];

    segments.forEach(({ start, end, color }) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, end);
      ctx.lineWidth = 20;
      ctx.lineCap = "butt";
      ctx.strokeStyle = color + "40";
      ctx.stroke();
    });

    // Needle position: score -1 = PI, score 0 = PI*1.5, score 1 = PI*2
    const normalizedScore = (score + 1) / 2; // 0 to 1
    const needleAngle = Math.PI + normalizedScore * Math.PI;

    // Active arc
    const activeColor = score > 0.2 ? "#22c55e" : score < -0.2 ? "#ef4444" : "#eab308";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, needleAngle);
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = activeColor;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1b2e";
    ctx.fill();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Needle line
    const needleLen = radius - 22;
    const nx = cx + Math.cos(needleAngle) * needleLen;
    const ny = cy + Math.sin(needleAngle) * needleLen;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Labels
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("-1", cx - radius + 4, cy + 4);
    ctx.fillText("0", cx, cy - radius + 10);
    ctx.fillText("+1", cx + radius - 4, cy + 4);
  }, [score]);

  const getColor = () => {
    if (score > 0.2) return "#22c55e";
    if (score < -0.2) return "#ef4444";
    return "#eab308";
  };

  return (
    <div className="gauge-wrapper">
      <canvas ref={canvasRef} className="gauge-canvas" />
      <div className="gauge-score" style={{ color: getColor() }}>
        {score > 0 ? "+" : ""}
        {score.toFixed(2)}
      </div>
      {label && <div className="gauge-label">{label}</div>}
      <style jsx>{`
        .gauge-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .gauge-canvas {
          width: 100%;
          max-width: 240px;
          height: auto;
        }
        .gauge-score {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-top: -8px;
        }
        .gauge-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
