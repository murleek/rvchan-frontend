import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorView from "../ErrorView";

type Props = { children: ReactNode };
type State = { error: Error | null; isDynamicError: boolean; stack: string };

class ErrorBoundary extends Component<Props, State> {
  state = { error: null as Error | null, isDynamicError: false, stack: "" };

  // Update state to render fallback UI
  static getDerivedStateFromError(error: Error) {
    console.error("Error caught by boundary:", error);
    let stack = error.stack || "";

    stack = stack
      ? stack.split("\n").slice(1, 6).join("\n") +
        `\n    ...${stack?.split("\n").length - 6} more lines`
      : "";

    let isDynamicError = false;
    if (error.message.includes("Failed to fetch dynamically imported module")) {
      isDynamicError = true;
    }
    return { error, isDynamicError, stack };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      if (this.state.isDynamicError) {
        return <ErrorView t="dynamicImportFailed" />;
      }
      // Fallback UI
      return (
        <ErrorView
          t="default"
          stack={
            <>
              <b>
                {this.state.error?.name}: {this.state.error?.message}
              </b>
              {"\n"}
              {this.state.stack}
            </>
          }
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
