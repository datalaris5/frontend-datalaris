/**
 * ErrorBoundary
 * -------------
 * Komponen React Class yang menangkap error di child components.
 * Mencegah seluruh aplikasi crash jika terjadi error.
 *
 * Cara pakai (di App.tsx):
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * Saat terjadi error:
 * - Menampilkan UI fallback yang user-friendly
 * - Mencatat error ke console (bisa diintegrasikan ke error reporting service)
 * - Menyediakan tombol reload untuk mencoba lagi
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Tipe untuk props
interface ErrorBoundaryProps {
  children: ReactNode;
}

// Tipe untuk state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Dipanggil saat ada error di child component
   * Mengupdate state untuk trigger render fallback UI
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Dipanggil setelah error ditangkap
   * Bisa digunakan untuk logging ke error reporting service (Sentry, dll)
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  /**
   * Handler untuk tombol reload
   * Memuat ulang halaman untuk mencoba recovery
   */
  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    // Jika ada error, tampilkan fallback UI
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-xl">
            {/* Header dengan warna merah untuk indikasi error */}
            <CardHeader className="bg-red-50 dark:bg-red-900/20 rounded-t-xl border-b border-red-100 dark:border-red-900/50">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle>Terjadi Kesalahan</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Pesan error yang user-friendly */}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aplikasi mengalami masalah saat memuat. Kemungkinan koneksi
                terputus atau ada file yang gagal dimuat.
              </p>

              {/* Detail teknis error (untuk debugging) */}
              {this.state.error && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}

              {/* Tombol reload */}
              <Button
                onClick={this.handleReload}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Muat Ulang Halaman
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Jika tidak ada error, render children seperti biasa
    return this.props.children;
  }
}

export default ErrorBoundary;
