import { useState } from "react";
import { uploadSbom } from "../api/client";

export default function UploadModal() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setSuccessMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const result = await uploadSbom(file);
      setSuccessMessage(result.message);
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Upload failed";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h2>Upload SBOM</h2>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <button onClick={handleUpload} disabled={isLoading || !file}>
        {isLoading ? "Uploading..." : "Upload"}
      </button>
      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
