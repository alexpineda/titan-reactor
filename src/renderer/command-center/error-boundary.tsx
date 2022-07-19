import React from "react";

class ErrorBoundary extends React.Component {
  override state: { error: Error | undefined } = { error: undefined };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  override render() {
    if (this.state.error) {
      return (
        <>
          There was an error with this plugin:{" "}
          {this.state.error instanceof Error
            ? this.state.error.message
            : "unknown"}{" "}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
