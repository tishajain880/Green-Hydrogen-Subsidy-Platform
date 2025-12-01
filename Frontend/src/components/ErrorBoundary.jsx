import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error in component tree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white border rounded-lg p-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <pre className="text-sm text-red-600 whitespace-pre-wrap break-words">
              {String(this.state.error)}
            </pre>
            <p className="mt-4 text-sm">
              Open the browser console for details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
