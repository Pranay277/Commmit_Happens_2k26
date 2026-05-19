import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { X, Sparkles, Loader2, ShieldAlert, Package, Hash, Tag, BarChart2, FileText } from "lucide-react";

import { fetchAiInsight } from "../api/client";
import { severityColors } from "../constants/severityColors";

/* ─── Markdown renderer — styled to match design system ─── */
const mdComponents = {
  p: ({ children }) => (
    <p style={{ margin: "0 0 8px", lineHeight: 1.75, color: "#475569", fontSize: 13 }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 18, margin: "0 0 8px" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: 18, margin: "0 0 8px" }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 4, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "#0F172A", fontWeight: 700 }}>{children}</strong>
  ),
  code: ({ children }) => (
    <code
      style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        background: "rgba(59,130,246,0.08)",
        padding: "1px 5px",
        borderRadius: 4,
        color: "#2563EB",
      }}
    >
      {children}
    </code>
  ),
};

/* ─── Small label+value field row ─── */
function InfoRow({ icon: Icon, label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        {Icon && <Icon size={10} />}
        {label}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NODE INSPECTOR — all AI fetch logic and state is UNTOUCHED
   ═══════════════════════════════════════════════════════════════════════════ */
export default function NodeInspector({ nodeData, nodeId, onClose, onInsightGenerated }) {
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  /* unchanged effect */
  useEffect(() => {
    setAiInsight(null);
    setLoading(false);
  }, [nodeData]);

  if (!nodeData) return null;

  const color = severityColors[nodeData.severity] || severityColors.none;
  const hasVuln = nodeData.severity && nodeData.severity !== "none";

  /* unchanged async handler */
  const handleGenerateInsight = async () => {
    setLoading(true);
    setAiInsight(null);
    try {
      const context = {
        package: nodeData.label,
        severity: nodeData.severity,
        cve_id: nodeData.cve || "",
        description: nodeData.description || "",
      };
      const result = await fetchAiInsight(context);
      const insight = result.ai_insight || "AI insight unavailable";
      setAiInsight(insight);
      if (onInsightGenerated) {
        onInsightGenerated(nodeId, insight);
      }
    } catch {
      setAiInsight(
        "AI insight generation timed out. Please try refreshing or check local system resources."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Backdrop (mobile) ── */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 19,
          display: "none", // shown via media query if needed; desktop uses side-sheet
        }}
      />

      {/* ── Side-sheet panel ── */}
      <div
        className="shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "400px",
          maxHeight: "calc(100% - 32px)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-surface)",
          fontFamily: "var(--font-sans)",
          overflowY: "auto",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "var(--bg-surface)",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Node Details
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-muted)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px", flex: 1 }}>
          {/* Severity badge header */}
          {hasVuln && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#fff",
                background: color,
                marginBottom: 16,
              }}
            >
              <ShieldAlert size={10} />
              {nodeData.severity}
            </div>
          )}

          <InfoRow icon={Package} label="Package">
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                wordBreak: "break-word",
              }}
            >
              {nodeData.label}
            </p>
          </InfoRow>

          <InfoRow icon={Tag} label="Version">
            <code
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 12,
                color: "var(--text-secondary)",
                background: "var(--bg-surface-2)",
                padding: "2px 8px",
                borderRadius: 6,
                display: "inline-block",
              }}
            >
              {nodeData.version}
            </code>
          </InfoRow>

          <InfoRow icon={Hash} label="CVE ID">
            <p
              style={{
                fontSize: 13,
                color: nodeData.cve ? "#EF4444" : "var(--text-muted)",
                fontFamily: nodeData.cve ? "ui-monospace, monospace" : "inherit",
                fontWeight: nodeData.cve ? 600 : 400,
              }}
            >
              {nodeData.cve || "None"}
            </p>
          </InfoRow>

          <InfoRow icon={BarChart2} label="Risk Score">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: color,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {nodeData.riskScore ?? "0"}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/&nbsp;10</span>
            </div>
          </InfoRow>

          <InfoRow icon={FileText} label="Description">
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              {nodeData.description || "No description available"}
            </p>
          </InfoRow>

          {/* ── AI Insight section ── */}
          {hasVuln && (
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                <Sparkles size={10} style={{ color: "var(--accent)" }} />
                AI Security Insight
              </div>

              {/* Generate button */}
              {!aiInsight && !loading && (
                <button
                  onClick={handleGenerateInsight}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    background: "var(--accent)",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "background 0.15s, transform 0.1s",
                    boxShadow: "0 1px 6px var(--accent-glow)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--accent-hover)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--accent)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Sparkles size={14} />
                  Generate AI Insight
                </button>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "14px 16px",
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Loader2
                      size={13}
                      style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }}
                    />
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                      AI is thinking…
                    </span>
                  </div>
                  <div className="skeleton" style={{ height: 10, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "85%" }} />
                  <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "70%" }} />
                </div>
              )}

              {/* Result */}
              {aiInsight && (
                <div
                  className="break-words"
                  style={{
                    background: "rgba(59,130,246,0.04)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    borderLeft: "4px solid #3B82F6",
                    borderRadius: 10,
                    padding: "14px 16px",
                    lineHeight: 1.6,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  <ReactMarkdown components={mdComponents}>{aiInsight}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
