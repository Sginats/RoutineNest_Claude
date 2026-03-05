"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Kid-friendly error boundary.
 * Shows a gentle "something went wrong" panel instead of a scary stack trace.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console only — no sensitive data sent externally
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="text-6xl" role="img" aria-label="Puzzled face">
            🤔
          </span>
          <h1 className="text-2xl font-extrabold text-foreground">
            Something went wrong
          </h1>
          <p className="max-w-sm text-lg text-muted-foreground">
            Don&apos;t worry — nothing is broken. Let&apos;s try again!
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-lg font-bold text-primary-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">🔄</span> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
