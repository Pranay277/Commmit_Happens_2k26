import { useState } from "react";
import { uploadSbom } from "../api/client";

export default function UploadModal({ onUpload, onLoadingChange, onError }) {
  const [file, setFile] = useState(null);
  const [localSuccess, setLocalSuccess] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setLocalSuccess("");
    if (onError) onError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    if (onLoadingChange) onLoadingChange(true);
    if (onError) onError("");
    setLocalSuccess("");

    try {
      const result = await uploadSbom(file);
      setLocalSuccess(result.message);
      if (onUpload) onUpload(result);
    } catch (err) {
      const msg = "Invalid SBOM format. Please upload a valid CycloneDX JSON.";
      if (onError) onError(msg);
    } finally {
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: 600,
        margin: "40px auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 8, color: "#1e293b" }}>Upload SBOM</h2>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
        Select a CycloneDX JSON file to analyze
      </p>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ marginBottom: 16 }}
      />
      <br />
      <button
        onClick={handleUpload}
        disabled={!file}
        style={{
          padding: "10px 28px",
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          background: file ? "#1e293b" : "#94a3b8",
          border: "none",
          borderRadius: 6,
          cursor: file ? "pointer" : "not-allowed",
        }}
      >
        Upload
      </button>
      {localSuccess && (
        <p style={{ color: "#16a34a", marginTop: 12, fontSize: 14 }}>
          {localSuccess}
        </p>
      )}
    </div>
  );
}
