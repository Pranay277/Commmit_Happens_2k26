import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

import { fetchAiInsight } from "../api/client";
import { severityColors } from "../constants/severityColors";

const mdComponents = {
  p: ({ children }) => <p style={{ margin: "0 0 8px", lineHeight: 1.6 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: "0 0 8px" }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: "0 0 8px" }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ color: "#1e293b", fontWeight: 700 }}>{children}</strong>,
};

export default function NodeInspector({ nodeData, nodeId, onClose, onInsightGenerated }) {
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAiInsight(null);
    setLoading(false);
  }, [nodeData]);

  if (!nodeData) return null;

  const color = severityColors[nodeData.severity] || severityColors.none;
  const hasVuln = nodeData.severity && nodeData.severity !== "none";

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
      setAiInsight("AI insight generation timed out. Please try refreshing or check local system resources.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 320,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: 20,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        zIndex: 10,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <strong style={{ fontSize: 16 }}>Node Details</strong>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#64748b",
          }}
        >
          &times;
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Package
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{nodeData.label}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Version
        </div>
        <div style={{ fontSize: 14 }}>{nodeData.version}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Severity
        </div>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            backgroundColor: color,
          }}
        >
          {nodeData.severity}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          CVE ID
        </div>
        <div style={{ fontSize: 14 }}>{nodeData.cve || "None"}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Risk Score
        </div>
        <div style={{ fontSize: 14 }}>{nodeData.riskScore ?? "0"}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Description
        </div>
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
          {nodeData.description || "No description available"}
        </div>
      </div>

      {hasVuln && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            AI Security Insight
          </div>

          {!aiInsight && !loading && (
            <button
              onClick={handleGenerateInsight}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                transition: "transform 0.15s, box-shadow 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.25)";
              }}
            >
              Generate AI Insight
            </button>
          )}

          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "12px 16px",
                background: "#f3f4f6",
                border: "1px dashed #d1d5db",
                borderRadius: 8,
                color: "#4b5563",
                fontSize: 13,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid #9ca3af",
                  borderTopColor: "#4b5563",
                  borderRadius: "50%",
                  animation: "insp-spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes insp-spin { to { transform: rotate(360deg) } }`}</style>
              AI is thinking...
            </div>
          )}

          {aiInsight && (
            <div
              style={{
                background: "linear-gradient(135deg, #f5f3ff 0%, #edf2f7 100%)",
                border: "1px solid #e9d5ff",
                borderRadius: 8,
                padding: 16,
                fontSize: 13,
                color: "#3730a3",
                lineHeight: 1.6,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <ReactMarkdown components={mdComponents}>
                {aiInsight}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
