import { severityColors } from "../constants/severityColors";

export default function NodeInspector({ nodeData, onClose }) {
  if (!nodeData) return null;

  const color = severityColors[nodeData.severity] || severityColors.none;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 280,
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
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
          Package
        </div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{nodeData.label}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
          Version
        </div>
        <div style={{ fontSize: 14 }}>{nodeData.version}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
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
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
          CVE ID
        </div>
        <div style={{ fontSize: 14 }}>{nodeData.cve || "None"}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
          Risk Score
        </div>
        <div style={{ fontSize: 14 }}>{nodeData.riskScore ?? "0"}</div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
          Description
        </div>
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
          {nodeData.description || "No description available"}
        </div>
      </div>
    </div>
  );
}
