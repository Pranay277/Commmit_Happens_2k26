import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import UploadModal from "./components/UploadModal";
import RiskSummary from "./components/RiskSummary";
import DependencyGraph from "./components/DependencyGraph";

/* ═══════════════════════════════════════════════════════════════════════════
   APP DASHBOARD — The main analysis workspace (route: /app)
   ═══════════════════════════════════════════════════════════════════════════ */
function Dashboard() {
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

  const isUploaded = !!graphData;

  return (
    <div
      className={`min-h-screen w-full ${!isUploaded ? "flex flex-col items-center justify-center" : ""}`}
      style={{
        fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
        background: "var(--bg-primary)",
      }}
    >
      {!isUploaded && (
        <UploadModal
          onUpload={handleUpload}
          onLoadingChange={setIsLoading}
          onError={handleError}
        />
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="w-9 h-9 rounded-full mb-3"
            style={{
              border: "3px solid var(--border)",
              borderTopColor: "var(--color-accent)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Analyzing dependencies...
          </p>
        </div>
      )}

      {error && graphData && (
        <p
          className="text-center text-sm font-semibold py-2"
          style={{ color: "#16a34a" }}
        >
          {error}
        </p>
      )}

      {error && !graphData && (
        <div
          className="max-w-md mx-auto my-4 px-5 py-3 rounded-lg text-center text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
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

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT APP — Router shell
   ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
