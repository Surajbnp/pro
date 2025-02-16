import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[200px] flex items-center justify-center flex-col space-y-4">
          <div className="text-center">
            <h3 className="text-[18px] font-medium text-accent">
              Something went wrong
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-btn4 rounded-[6px] text-[14px]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
