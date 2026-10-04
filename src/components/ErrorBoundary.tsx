import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Penangkap error render.
 * Tanpa ini, satu kesalahan data akan membuat seluruh halaman putih.
 * Layar ini membantu pengguna memulihkan tanpa kehilangan akun.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('LaundryKu error:', error, info.componentStack)
  }

  private clearLocalData = () => {
    try {
      window.localStorage.removeItem('laundryku.state.v1')
      window.localStorage.removeItem('laundryku.draft.v1')
    } catch {
      // storage diblokir
    }
    window.location.href = '/login'
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger-light">
            <AlertTriangle size={30} className="text-danger" />
          </span>
          <h1 className="text-xl font-extrabold text-slate-800">
            Halaman Tidak Dapat Ditampilkan
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Terjadi kesalahan saat menampilkan halaman ini. Data lama di browser mungkin
            sudah tidak sesuai dengan versi aplikasi terbaru.
          </p>
          <pre className="mt-4 max-h-24 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs break-words text-slate-600">
            {error.message}
          </pre>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              onClick={this.clearLocalData}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              <RotateCcw size={16} /> Reset Data & Kembali ke Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RefreshCw size={16} /> Muat Ulang
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
            >
              <Home size={16} /> Beranda
            </a>
          </div>
        </div>
      </div>
    )
  }
}