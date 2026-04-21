import { Component } from "react";

/**
 * Catches render-time errors anywhere below it and surfaces them visibly
 * instead of letting React blank the whole page. Dev-focused: in production
 * you'd probably want a friendlier fallback.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("[error-boundary] caught:", error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const err = this.state.error;
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "32px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#fff",
            background: "#0b0e24",
            overflow: "auto",
          }}
          role="alert"
        >
          <h1 style={{ color: "#fb7185", marginTop: 0 }}>Something crashed</h1>
          <p style={{ color: "#fde68a" }}>
            <strong>{err?.name || "Error"}:</strong> {err?.message || String(err)}
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "rgba(255,255,255,0.04)",
              padding: 16,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {err?.stack || ""}
          </pre>
          {this.state.info?.componentStack ? (
            <>
              <h3 style={{ marginTop: 24, color: "#a5f3fc" }}>Component stack</h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "rgba(255,255,255,0.04)",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {this.state.info.componentStack}
              </pre>
            </>
          ) : null}
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(34,211,238,0.15)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
