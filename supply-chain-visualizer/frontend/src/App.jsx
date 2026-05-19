import { useState } from "react";
import UploadModal from "./components/UploadModal";
import RiskSummary from "./components/RiskSummary";
import DependencyGraph from "./components/DependencyGraph";

export default function App() {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = (result) => {
    setGraphData(result);
    const hasVulns = (result.nodes || []).some(
      (n) => n.data && n.data.severity && n.data.severity !== "none"
    );
    if (!hasVulns) {
      setError("Zero vulnerabilities detected in current scope.");
    } else {
      setError("");
    }
  };

  const handleError = (msg) => {
    setError(msg);
    setGraphData(null);
  };

  const handleInsightGenerated = (nodeId, insight) => {
    setGraphData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: (prev.nodes || []).map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, aiInsight: insight } } : n
        ),
      };
    });
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <UploadModal
        onUpload={handleUpload}
        onLoadingChange={setIsLoading}
        onError={handleError}
      />

      {isLoading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "4px solid #e2e8f0",
              borderTopColor: "#1e293b",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: "#475569", fontSize: 15 }}>
            Analyzing dependencies...
          </p>
        </div>
      )}

      {error && graphData && (
        <p
          style={{
            textAlign: "center",
            color: "#16a34a",
            fontSize: 15,
            fontWeight: 600,
            margin: 0,
            padding: "8px 0",
          }}
        >
          {error}
        </p>
      )}

      {error && !graphData && (
        <div
          style={{
            maxWidth: 500,
            margin: "16px auto",
            padding: "12px 20px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#b91c1c",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {graphData && (
        <>
          <RiskSummary data={graphData} />
          <DependencyGraph data={graphData} onInsightGenerated={handleInsightGenerated} />
        </>
      )}
    </div>
  );
}
