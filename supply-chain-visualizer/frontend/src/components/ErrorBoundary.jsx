import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center px-6 py-24 text-center"
          style={{ background: "var(--bg-primary)" }}
        >
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertTriangle size={24} style={{ color: "#EF4444" }} />
          </div>
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {this.props.title || "Something went wrong"}
          </h2>
          <p
            className="text-sm max-w-md leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {this.props.message ||
              "Failed to render the dashboard. Please check if the SBOM format is valid and try uploading again."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="mt-6 px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            {this.props.resetLabel || "Try Again"}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
