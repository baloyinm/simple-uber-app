import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#1a1a2e', color: '#ef4444', minHeight: '100vh' }}>
          <h1 style={{ color: '#fbbf24', marginBottom: 16 }}>⚠ Application Error</h1>
          <pre style={{ background: '#0d1117', padding: 20, borderRadius: 8, overflowX: 'auto', fontSize: 13, lineHeight: 1.6, color: '#f87171' }}>
            {String(this.state.error)}
          </pre>
          <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: 20, padding: '10px 20px', background: '#fbbf24', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
