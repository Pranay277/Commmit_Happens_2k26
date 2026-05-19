import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileJson, FileText } from "lucide-react";

import { severityColors } from "../constants/severityColors";
import { layoutNodes } from "../utils/graphLayout";
import NodeInspector from "./NodeInspector";

/* ─── Severity legend data — visual only ─── */
const severityLabels = [
  { label: "Critical", key: "critical" },
  { label: "High", key: "high" },
  { label: "Medium", key: "medium" },
  { label: "Low", key: "low" },
  { label: "None", key: "none" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM PACKAGE NODE — visual card replacing default React Flow box
   Logic: Handle positions and data reading are unchanged
   ═══════════════════════════════════════════════════════════════════════════ */
function PackageNode({ data, selected }) {
  if (!data) return null;
  const borderColor = severityColors[data.severity] || severityColors.none;

  return (
    <div
      className="flex flex-col items-center justify-center text-center w-full"
      style={{
        background: "var(--node-bg)",
        border: `2px solid ${borderColor}`,
        borderRadius: 10,
        padding: "6px 12px",
        minWidth: 120,
        maxWidth: 160,
        textAlign: "center",
        boxShadow: selected
          ? `0 0 0 3px ${borderColor}40, var(--shadow-md)`
          : "var(--shadow-card)",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 16px ${borderColor}55, var(--shadow-md)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = selected
          ? `0 0 0 3px ${borderColor}40, var(--shadow-md)`
          : "var(--shadow-card)";
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className="font-semibold text-[13px] text-center w-full"
        style={{
          color: "var(--text-primary)",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {data.label}
      </div>
      <div
        className="text-[11px] text-center w-full"
        style={{
          color: "var(--text-muted)",
          fontFamily: "ui-monospace, monospace",
          marginTop: 2,
        }}
      >
        {data.version}
      </div>
      {data.severity && data.severity !== "none" && (
        <div className="flex justify-center w-full mt-1">
          <div
            style={{
              display: "inline-block",
              padding: "1px 7px",
              borderRadius: 99,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#fff",
              background: borderColor,
            }}
          >
            {data.severity === "moderate" ? "medium" : data.severity}
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { packageNode: PackageNode };

/* ═══════════════════════════════════════════════════════════════════════════
   INNER GRAPH — needs ReactFlowProvider to use useReactFlow
   All data handling, layout, state logic is unchanged
   ═══════════════════════════════════════════════════════════════════════════ */
function GraphInner({ data, onInsightGenerated }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { fitView } = useReactFlow();
  const dataSignatureRef = useRef("");

  /* layout effect — only re-runs when the graph structurally changes */
  useEffect(() => {
    if (!data) return;
    const nodes = data.nodes || [];
    const edges = data.edges || [];
    const edgeSig = edges.map((e) => e.source + e.target).sort().join(",");
    const signature = nodes.length + "-" + edges.length + "|" + edgeSig;
    if (signature === dataSignatureRef.current) return;
    dataSignatureRef.current = signature;

    const positioned = layoutNodes(nodes, edges);
    setNodes(positioned);
    setEdges(edges);
    setTimeout(() => fitView({ padding: 0.35, duration: 600 }), 50);
  }, [data, fitView]);

  /* unchanged node click handler */
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  /* unchanged insight propagation */
  const handleInsightGenerated = useCallback(
    (nodeId, insight) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, aiInsight: insight } } : n
        )
      );
      if (onInsightGenerated) onInsightGenerated(nodeId, insight);
    },
    [onInsightGenerated]
  );

  /* visual edge style — stable reference to avoid ReactFlow resets */
  const styledEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        style: { stroke: "var(--text-muted)", strokeWidth: 1.5 },
      })),
    [edges]
  );

  /* ── Export handlers (relocated from RiskSummary) ── */
  const rawNodes = data?.nodes || [];
  const vulnerableNodes = rawNodes.filter(
    (n) => n.data && n.data.severity && n.data.severity !== "none"
  );
  const totalDeps = rawNodes.length;
  const totalVulns = vulnerableNodes.length;
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  let highestRisk = 0;
  let cumulativeRisk = 0;
  for (const n of rawNodes) {
    const d = n.data || {};
    const sev = d.severity;
    if (sev && sev in severityCounts) severityCounts[sev]++;
    const rs = Number(d.riskScore) || 0;
    if (rs > highestRisk) highestRisk = rs;
    cumulativeRisk += rs;
  }
  cumulativeRisk = Number(cumulativeRisk.toFixed(1));
  const scanDate = new Date().toISOString();

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

  return (
    <div style={{ width: "100%", height: "calc(100vh - 200px)", minHeight: 600, position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--border)"
          gap={24}
          size={1}
          style={{ opacity: 0.5 }}
        />
        <Controls
          className="!bottom-10 !left-6 !z-10"
        />
      </ReactFlow>

      {/* ── Export buttons — top-left, balances legend ── */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <button
          onClick={exportJSON}
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
        >
          <FileJson size={14} />
          Export JSON
        </button>
        <button
          onClick={exportPDF}
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
        >
          <FileText size={14} />
          Export PDF
        </button>
      </div>

      {/* ── Severity legend — top-right, glassmorphic card ── */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "var(--shadow-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          minWidth: 130,
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 8,
          }}
        >
          Severity
        </p>
        <div className="space-y-1.5">
          {severityLabels.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: severityColors[s.key] }}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Node inspector side-sheet ── */}
      <NodeInspector
        nodeData={selectedNode ? selectedNode.data : null}
        nodeId={selectedNode ? selectedNode.id : null}
        onClose={() => setSelectedNode(null)}
        onInsightGenerated={handleInsightGenerated}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTED COMPONENT — wraps GraphInner in ReactFlowProvider
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DependencyGraph({ data, onInsightGenerated }) {
  return (
    <ReactFlowProvider>
      <GraphInner data={data} onInsightGenerated={onInsightGenerated} />
    </ReactFlowProvider>
  );
}
