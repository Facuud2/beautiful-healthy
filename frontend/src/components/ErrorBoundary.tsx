import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF7F5] text-[#2A2421] p-6">
          <div className="luxury-card p-8 max-w-md text-center space-y-4">
            <h1 className="text-2xl font-semibold text-[#2A2421]">
              Ocurrió un inconveniente inesperado
            </h1>
            <p className="text-xs text-[#7D726D] font-mono break-all">
              {this.state.error?.message || "Error desconocido"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-xs"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
