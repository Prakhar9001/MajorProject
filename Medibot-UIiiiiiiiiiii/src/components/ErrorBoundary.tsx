import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary: ${this.props.label}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertTriangle size={26} className="text-red-400" />
          </div>
          <div>
            <p className="font-bold text-white text-base">{this.props.label ?? 'Something went wrong'}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">{this.state.message}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-5 py-2 bg-[#1A1C23] border border-white/10 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
