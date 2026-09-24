import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-screen flex items-center justify-center washi-bg p-4 text-[#161616] select-none">
          <div className="relative max-w-lg w-full bg-[#fcfbf9] border-2 border-black/30 rounded-xl p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Arcane Sigil / Icon */}
            <div className="w-16 h-16 rounded-full bg-black/5 border border-black/20 flex items-center justify-center mb-6 text-[var(--accent-ink)]">
              <AlertTriangle className="w-8 h-8 text-[var(--accent-ink)]" />
            </div>

            {/* Title in font-display */}
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#161616] tracking-wider mb-3">
              A Dark Curse Has Befallen This View
            </h1>

            {/* Subtitle & explanation */}
            <p className="font-serif text-[#444444] text-base leading-relaxed mb-6 max-w-md">
              An unexpected arcane rupture has disrupted the flow of this realm. Fear not, your adventurer’s chronicles remain intact within the archives.
            </p>

            {/* Error Message Details (if available) */}
            {this.state.error?.message && (
              <div className="w-full bg-white border border-[#141414]/15 rounded p-3 text-xs font-mono text-[#555555] mb-6 max-h-24 overflow-y-auto text-left break-words">
                {this.state.error.message}
              </div>
            )}

            {/* Reload Button */}
            <button
              onClick={this.handleReload}
              type="button"
              className="sumie-btn-primary px-6 py-2.5 text-sm"
            >
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
              <span>Reload Grimoire</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
