import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('Star Tap Legends Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('star_tap_player_state_v2');
      localStorage.removeItem('star_tap_player_state');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          {/* Cosmic Nebula Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-md w-full p-6 sm:p-8 bg-slate-900/95 border border-amber-500/40 ring-1 ring-amber-400/20 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col items-center text-center">
            {/* Top Laser Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-shimmer" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-4 shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-white tracking-tight uppercase mb-2">
              SISTEMA REINICIADO
            </h2>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Ocurrió una anomalía estelar inesperada durante la carga. Puedes reiniciar la aplicación o restablecer los datos locales si persiste.
            </p>

            {this.state.error && (
              <div className="w-full p-3 mb-6 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-300/90 text-left overflow-x-auto max-h-24 no-scrollbar">
                {this.state.error.message || 'Error de ejecución'}
              </div>
            )}

            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reiniciar Galaxia</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Restablecer Datos Locales</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
