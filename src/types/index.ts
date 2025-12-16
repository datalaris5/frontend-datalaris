// Types - Export Utama
export * from "./api";

// Common component prop types
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
