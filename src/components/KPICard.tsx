"use client";

interface KPICardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  trend?: "up" | "down" | "stable" | null;
  badge?: string;
  badgeColor?: "positive" | "negative" | "neutral" | "info";
  progress?: number; // 0-100
}

export default function KPICard({
  icon,
  title,
  value,
  subtitle,
  color = "#a78bfa",
  trend,
  badge,
  badgeColor = "info",
  progress,
}: KPICardProps) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "stable" ? "→" : null;
  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#f59e0b";

  return (
    <div className="kpi-card glass-card">
      <div className="kpi-top">
        <div className="kpi-icon" style={{ boxShadow: `0 0 20px ${color}30` }}>
          {icon}
        </div>
        {trendIcon && (
          <span className="kpi-trend" style={{ color: trendColor }}>
            {trendIcon}
          </span>
        )}
        {badge && (
          <span className={`badge badge-${badgeColor} kpi-badge`}>
            {badge}
          </span>
        )}
      </div>
      <div className="kpi-value" style={{ color }}>
        {value}
      </div>
      <div className="kpi-title">{title}</div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      {progress !== undefined && (
        <div className="kpi-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
              }}
            />
          </div>
          <span className="kpi-progress-label">{progress.toFixed(0)}%</span>
        </div>
      )}
      <style jsx>{`
        .kpi-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: default;
        }
        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .kpi-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .kpi-trend {
          font-size: 1.25rem;
          font-weight: 800;
        }
        .kpi-badge {
          font-size: 0.65rem !important;
        }
        .kpi-value {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .kpi-title {
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.55);
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .kpi-subtitle {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
        }
        .kpi-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .kpi-progress .progress-bar { flex: 1; }
        .kpi-progress-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          min-width: 32px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
