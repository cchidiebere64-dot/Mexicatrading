import React from "react";

/**
 * Catches render errors so a broken component shows a readable message
 * instead of a blank white screen.
 *
 * Wrap the whole app in App.jsx:
 *   <ErrorBoundary><Routes>...</Routes></ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("💥 Render error:", error, info);
    this.setState({ info });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const msg = this.state.error?.message || String(this.state.error);
    const stack = this.state.info?.componentStack || "";

    return (
      <div style={{
        minHeight: "100vh",
        background: "#0E1013",
        color: "rgba(255,255,255,.92)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          <p style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 10, letterSpacing: "2px", textTransform: "uppercase",
            color: "#B4553F", marginBottom: 10,
          }}>
            Something broke
          </p>

          <h1 style={{ fontSize: 26, fontWeight: 400, marginBottom: 14, lineHeight: 1.2 }}>
            This page failed to load
          </h1>

          <div style={{
            border: "1px solid rgba(255,255,255,.08)",
            borderLeft: "2px solid #B4553F",
            padding: 16,
            marginBottom: 16,
          }}>
            <p style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 12, lineHeight: 1.6,
              color: "#B4553F", wordBreak: "break-word",
            }}>
              {msg}
            </p>
          </div>

          {stack && (
            <details style={{ marginBottom: 20 }}>
              <summary style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase",
                color: "rgba(255,255,255,.35)", cursor: "pointer", marginBottom: 10,
              }}>
                Where it happened
              </summary>
              <pre style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 11, lineHeight: 1.6,
                color: "rgba(255,255,255,.5)",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                border: "1px solid rgba(255,255,255,.08)",
                padding: 14, maxHeight: 260, overflowY: "auto",
              }}>
                {stack.trim()}
              </pre>
            </details>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1, padding: "13px 0",
                fontFamily: "ui-monospace, monospace",
                fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase",
                background: "#3F8F5F", color: "#fff",
                border: "1px solid #3F8F5F", cursor: "pointer",
              }}>
              Reload
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                flex: 1, padding: "13px 0",
                fontFamily: "ui-monospace, monospace",
                fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase",
                background: "transparent", color: "rgba(255,255,255,.55)",
                border: "1px solid rgba(255,255,255,.12)", cursor: "pointer",
              }}>
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
