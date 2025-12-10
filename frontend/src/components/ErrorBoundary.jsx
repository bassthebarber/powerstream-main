import React from "react";

/**
 * Global Error Boundary for PowerStream
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of a blank screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error("🚨 PowerStream Error Boundary caught an error:");
    console.error("Error:", error);
    console.error("Component Stack:", errorInfo?.componentStack);

    // Store error info for display
    this.setState({ errorInfo });

    // Optional: Send to error reporting service
    // reportErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              PowerStream encountered an unexpected error. Don't worry, your data is safe.
            </p>

            <div style={styles.buttons}>
              <button style={styles.primaryButton} onClick={this.handleReload}>
                🔄 Reload Page
              </button>
              <button style={styles.secondaryButton} onClick={this.handleGoHome}>
                🏠 Go Home
              </button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Dev Only)</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline styles for the error UI (no external CSS dependency)
const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
    border: "1px solid rgba(255, 184, 77, 0.2)",
    borderRadius: "16px",
    padding: "48px 32px",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  },
  icon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "900",
    background: "linear-gradient(90deg, #ffb84d, #ffda5c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "12px",
  },
  message: {
    color: "#888",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 24px",
    background: "#ffb84d",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  secondaryButton: {
    padding: "12px 24px",
    background: "transparent",
    color: "#ffb84d",
    border: "1px solid rgba(255, 184, 77, 0.4)",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  details: {
    marginTop: "32px",
    textAlign: "left",
  },
  summary: {
    color: "#ffb84d",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  errorText: {
    background: "rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px",
    color: "#ff6b6b",
    fontSize: "12px",
    overflow: "auto",
    maxHeight: "200px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};

export default ErrorBoundary;



