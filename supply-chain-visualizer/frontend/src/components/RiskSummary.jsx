import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertTriangle,
  Flame,
  AlertCircle,
  Info,
  ShieldAlert,
  Layers,
  TrendingUp,
  Activity,
  FileJson,
  FileText,
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

  const scanDate = new Date().toISOString();

  const vulnerableTableRows = vulnerableNodes.map((n) => {
    const d = n.data || {};
    return [
      d.label,
      d.version,
      d.severity,
      d.cve || "—",
      String(d.riskScore ?? "0"),
      d.aiInsight || "Insight not requested during session",
    ];
  });

  /* unchanged export handlers */
  const exportJSON = () => {
    const report = {
      scanDate,
      summary: {
        totalDependencies: totalDeps,
        totalVulnerabilities: totalVulns,
        bySeverity: { ...severityCounts },
        highestRisk,
        cumulativeRisk,
      },
      vulnerableDependencies: vulnerableNodes.map((n) => {
        const d = n.data || {};
        return {
          package: d.label,
          version: d.version,
          severity: d.severity,
          cve: d.cve || null,
          riskScore: d.riskScore ?? 0,
          aiInsight: d.aiInsight || "Insight not requested during session",
        };
      }),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sbom-security-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SBOM Security Risk Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date(scanDate).toLocaleDateString()}`, 14, 32);
    doc.setFontSize(13);
    doc.text("Summary", 14, 46);
    doc.setFontSize(11);
    let sy = 54;
    const summaryLines = [
      `Total Dependencies: ${totalDeps}`,
      `Total Vulnerabilities: ${totalVulns}`,
      `Critical: ${severityCounts.critical} | High: ${severityCounts.high} | Medium: ${severityCounts.medium} | Low: ${severityCounts.low}`,
      `Highest Risk Score: ${highestRisk} | Cumulative Risk: ${cumulativeRisk}`,
    ];
    for (const line of summaryLines) { doc.text(line, 14, sy); sy += 8; }

    const pdfTableRows = vulnerableNodes.map((node) => {
      const d = node.data || {};
      let pdfSummary = "";
      if (!d.aiInsight) {
        pdfSummary = "Insight not requested during session";
      } else {
        const cleanInsight = d.aiInsight.replace(/[\*#_`]/g, "");
        const sentenceMatch = cleanInsight.match(/[^.!?]+[.!?](\s+[^.!?]+[.!?])?/);
        pdfSummary = sentenceMatch ? sentenceMatch[0].trim() : cleanInsight;
      }
      return [d.label, d.version, d.severity, d.cve || "—", String(d.riskScore ?? "0"), pdfSummary];
    });

    autoTable(doc, {
      startY: sy + 4,
      head: [["Package", "Version", "Severity", "CVE", "Risk Score", "AI Insight"]],
      body: pdfTableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 5: { cellWidth: 60 } },
    });
    doc.save("sbom-security-report.pdf");
  };

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
        paddingTop: 20,
        paddingBottom: 16,
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* ── Metrics Grid ── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
      >
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{
              background: m.bg,
              border: `1px solid ${m.border}`,
              minHeight: 80,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {m.label}
              </span>
              <m.icon size={13} style={{ color: m.iconColor, opacity: 0.8 }} />
            </div>
            <span
              className="text-2xl font-bold tabular-nums leading-none"
              style={{ color: m.textColor }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Export buttons ── */}
      <div className="flex items-center gap-2.5 mt-4">
        <button
          onClick={exportJSON}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{
            background: "var(--text-primary)",
            color: "var(--bg-surface)",
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <FileJson size={13} />
          Export JSON
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{
            background: "transparent",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--text-muted)";
            e.currentTarget.style.background = "var(--bg-surface-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <FileText size={13} />
          Export PDF
        </button>
      </div>
    </div>
  );
}
