import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-xl">
            <CardHeader className="bg-red-50 dark:bg-red-900/20 rounded-t-xl border-b border-red-100 dark:border-red-900/50">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
                <CardTitle>Terjadi Kesalahan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aplikasi mengalami masalah saat memuat. Kemungkinan koneksi
                terputus atau ada file yang gagal dimuat.
              </p>

              {this.state.error && (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}

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

    return this.props.children;
  }
}

export default ErrorBoundary;
