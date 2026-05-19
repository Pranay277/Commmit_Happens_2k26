import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { severityColors } from "../constants/severityColors";

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

  const metrics = [
    { label: "Total Dependencies", value: totalDeps, color: "#64748b" },
    { label: "Vulnerabilities", value: totalVulns, color: "#ef4444" },
    ...[
      { label: "Critical", key: "critical" },
      { label: "High", key: "high" },
      { label: "Medium", key: "medium" },
      { label: "Low", key: "low" },
    ].map((s) => ({
      label: s.label,
      value: severityCounts[s.key],
      color: severityColors[s.key],
    })),
    {
      label: "Highest Risk",
      value: highestRisk,
      color: highestRisk >= 7 ? "#ef4444" : highestRisk >= 4 ? "#f97316" : "#3b82f6",
    },
    {
      label: "Cumulative Risk",
      value: cumulativeRisk,
      color: cumulativeRisk >= 10 ? "#ef4444" : cumulativeRisk >= 5 ? "#f97316" : "#3b82f6",
    },
  ];

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
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
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
    for (const line of summaryLines) {
      doc.text(line, 14, sy);
      sy += 8;
    }

    const pdfTableRows = vulnerableNodes.map((node) => {
      const d = node.data || {};
      let pdfSummary = "";
      if (!d.aiInsight) {
        pdfSummary = "Insight not requested during session";
      } else {
        const fullInsight = d.aiInsight;
        const cleanInsight = fullInsight.replace(/[\*#_`]/g, '');
        const sentenceMatch = cleanInsight.match(/[^.!?]+[.!?](\s+[^.!?]+[.!?])?/);
        pdfSummary = sentenceMatch ? sentenceMatch[0].trim() : cleanInsight;
      }
      return [
        d.label,
        d.version,
        d.severity,
        d.cve || "—",
        String(d.riskScore ?? "0"),
        pdfSummary,
      ];
    });

    autoTable(doc, {
      startY: sy + 4,
      head: [["Package", "Version", "Severity", "CVE", "Risk Score", "AI Insight"]],
      body: pdfTableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: {
        5: { cellWidth: 60 },
      },
    });

    doc.save("sbom-security-report.pdf");
  };

  return (
    <div style={{ padding: "16px 24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              borderLeft: `4px solid ${m.color}`,
              background: "#fff",
              borderRadius: 8,
              padding: "14px 16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: 80,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={exportJSON}
          style={{
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: "#1e293b",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Export JSON
        </button>
        <button
          onClick={exportPDF}
          style={{
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            color: "#1e293b",
            background: "#fff",
            border: "2px solid #1e293b",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
