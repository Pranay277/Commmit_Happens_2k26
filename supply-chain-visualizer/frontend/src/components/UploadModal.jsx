import { useState, useRef } from "react";
import { CloudUpload, FileJson, CheckCircle2, XCircle } from "lucide-react";
import { uploadSbom } from "../api/client";

/* ─── ALL LOGIC BELOW IS UNTOUCHED ─── */
export default function UploadModal({ onUpload, onLoadingChange, onError }) {
  const [file, setFile] = useState(null);
  const [localSuccess, setLocalSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  /* unchanged handler */
  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setLocalSuccess("");
    if (onError) onError("");
  };

  /* unchanged handler */
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

  /* visual-only drag state handlers */
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setLocalSuccess("");
      if (onError) onError("");
    }
  };

  return (
    <div
      className="w-full flex justify-center px-6 md:px-12"
      style={{ paddingTop: 32, paddingBottom: 8 }}
    >
      {/* ── Upload card ── */}
      <div
        className="surface-card w-full max-w-lg"
        style={{ padding: "32px 32px 28px" }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Analyze SBOM
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Upload a CycloneDX JSON to map dependencies and detect vulnerabilities.
          </p>
        </div>

        {/* ── Drop zone ── VISUAL WRAPPER ONLY, real input catches clicks ── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer select-none"
          style={{
            minHeight: 160,
            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
            background: isDragging
              ? "var(--accent-glow, rgba(14,165,233,0.06))"
              : "var(--bg-surface-2)",
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          {/* Hidden real input — covers entire area natively */}
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
              zIndex: 10,
            }}
          />

          {file ? (
            <>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)" }}
              >
                <FileJson size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {file.name}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {(file.size / 1024).toFixed(1)} KB — ready to analyze
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <CloudUpload size={20} style={{ color: "var(--text-muted)" }} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Drop your CycloneDX JSON here
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Analyze button ── */}
        <button
          onClick={handleUpload}
          disabled={!file}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: file ? "var(--accent)" : "var(--bg-surface-2)",
            color: file ? "#fff" : "var(--text-muted)",
            border: "none",
            cursor: file ? "pointer" : "not-allowed",
            transition: "background 0.2s, color 0.2s",
            boxShadow: file ? "0 1px 6px var(--accent-glow)" : "none",
          }}
          onMouseEnter={(e) => {
            if (file) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (file) e.currentTarget.style.background = "var(--accent)";
          }}
        >
          Analyze SBOM
        </button>

        {/* ── Success inline alert ── */}
        {localSuccess && (
          <div
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#10b981",
            }}
          >
            <CheckCircle2 size={14} />
            {localSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
