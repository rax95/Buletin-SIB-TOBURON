import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi kesalahan saat memuat data.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      let friendlyMessage =
        'Terjadi kendala saat menghubungkan ke layanan data buletin. Silakan coba muat ulang tampilan.';
      if (this.state.errorMessage.includes('Quota exceeded')) {
        friendlyMessage =
          'Kuota harian pembacaan database telah tercapai dan akan diperbarui kembali besok.';
      } else if (
        this.state.errorMessage.includes('Missing or insufficient permissions')
      ) {
        friendlyMessage =
          'Akses data tidak diizinkan untuk akun atau sesi saat ini. Pastikan Anda masuk dengan akun admin terverifikasi untuk melakukan perubahan.';
      }

      return (
        <div className="min-h-screen bg-[#F9F8F6] text-[#171614] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E4DFD7] rounded-2xl p-8">
            <div className="flex items-center gap-3 text-[#1B3B6F] mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="text-2xl font-semibold">Kendala Koneksi Buletin</h1>
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed mb-6">
              {friendlyMessage}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3B6F] text-white text-sm font-medium rounded-lg hover:bg-[#132B52] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E4DFD7] text-[#171614] text-sm font-medium rounded-lg hover:bg-[#EFECE7] transition-colors cursor-pointer"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
