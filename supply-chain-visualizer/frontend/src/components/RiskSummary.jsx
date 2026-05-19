import {
  AlertTriangle,
  Flame,
  AlertCircle,
  Info,
  ShieldAlert,
  Layers,
  TrendingUp,
  Activity,
} from "lucide-react";

/* ─── ALL COMPUTATION LOGIC IS UNTOUCHED ─── */
export default function RiskSummary({ data }) {
  if (!data || !data.nodes) return null;

  const totalDeps = data.nodes.length;
  const vulnerableNodes = data.nodes.filter(
    (n) => n.data && n.data.severity && n.data.severity !== "none"
  );
  const totalVulns = vulnerableNodes.length;

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  let highestRisk = 0;
  let cumulativeRisk = 0;

  for (const n of data.nodes) {
    const d = n.data || {};
    const sev = d.severity;
    if (sev && sev in severityCounts) severityCounts[sev]++;
    const rs = Number(d.riskScore) || 0;
    if (rs > highestRisk) highestRisk = rs;
    cumulativeRisk += rs;
  }
  cumulativeRisk = Number(cumulativeRisk.toFixed(1));

  /* export handlers moved to DependencyGraph canvas */

  /* ── VISUAL ONLY: metric card config ── */
  const metricCards = [
    {
      label: "Total Dependencies",
      value: totalDeps,
      icon: Layers,
      bg: "var(--bg-surface-2)",
      border: "var(--border)",
      iconColor: "var(--text-muted)",
      textColor: "var(--text-primary)",
    },
    {
      label: "Vulnerabilities",
      value: totalVulns,
      icon: ShieldAlert,
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.2)",
      iconColor: "#EF4444",
      textColor: "#EF4444",
    },
    {
      label: "Critical",
      value: severityCounts.critical,
      icon: Flame,
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.2)",
      iconColor: "#EF4444",
      textColor: "#EF4444",
    },
    {
      label: "High",
      value: severityCounts.high,
      icon: AlertTriangle,
      bg: "rgba(249,115,22,0.06)",
      border: "rgba(249,115,22,0.2)",
      iconColor: "#F97316",
      textColor: "#F97316",
    },
    {
      label: "Medium",
      value: severityCounts.medium,
      icon: AlertCircle,
      bg: "rgba(234,179,8,0.06)",
      border: "rgba(234,179,8,0.2)",
      iconColor: "#EAB308",
      textColor: "#CA8A04",
    },
    {
      label: "Low",
      value: severityCounts.low,
      icon: Info,
      bg: "rgba(59,130,246,0.06)",
      border: "rgba(59,130,246,0.2)",
      iconColor: "#3B82F6",
      textColor: "#3B82F6",
    },
    {
      label: "Highest Risk",
      value: highestRisk,
      icon: TrendingUp,
      bg: highestRisk >= 7
        ? "rgba(239,68,68,0.06)"
        : highestRisk >= 4
          ? "rgba(249,115,22,0.06)"
          : "var(--bg-surface-2)",
      border: highestRisk >= 7
        ? "rgba(239,68,68,0.2)"
        : highestRisk >= 4
          ? "rgba(249,115,22,0.2)"
          : "var(--border)",
      iconColor: highestRisk >= 7 ? "#EF4444" : highestRisk >= 4 ? "#F97316" : "var(--text-muted)",
      textColor: highestRisk >= 7 ? "#EF4444" : highestRisk >= 4 ? "#F97316" : "var(--text-primary)",
    },
    {
      label: "Cumulative Risk",
      value: cumulativeRisk,
      icon: Activity,
      bg: cumulativeRisk >= 10
        ? "rgba(239,68,68,0.06)"
        : cumulativeRisk >= 5
          ? "rgba(249,115,22,0.06)"
          : "var(--bg-surface-2)",
      border: cumulativeRisk >= 10
        ? "rgba(239,68,68,0.2)"
        : cumulativeRisk >= 5
          ? "rgba(249,115,22,0.2)"
          : "var(--border)",
      iconColor: cumulativeRisk >= 10 ? "#EF4444" : cumulativeRisk >= 5 ? "#F97316" : "var(--text-muted)",
      textColor: cumulativeRisk >= 10 ? "#EF4444" : cumulativeRisk >= 5 ? "#F97316" : "var(--text-primary)",
    },
  ];

  return (
    <div
      className="px-6 md:px-12"
      style={{
        paddingTop: 24,
        paddingBottom: 24,
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center mb-5">
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Security Posture
        </h2>
      </div>

      {/* ── Metrics Grid ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3 w-full"
      >
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="rounded-xl px-5 py-4 flex flex-col items-center justify-center text-center"
            style={{
              background: m.bg,
              border: `1px solid ${m.border}`,
              minHeight: 105,
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.03)";
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {m.label}
              </span>
              <m.icon size={16} style={{ color: m.iconColor, opacity: 0.9 }} />
            </div>
            <div className="mt-3 text-center">
              <span
                className="text-3xl font-bold tabular-nums leading-none tracking-tight"
                style={{ color: m.textColor }}
              >
                {m.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
