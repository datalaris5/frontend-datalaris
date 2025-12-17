/**
 * React Query Client Configuration
 * --------------------------------
 * Konfigurasi global untuk TanStack React Query.
 *
 * Features:
 * - Automatic caching (5 menit)
 * - Auto retry on error
 * - Refetch on window focus
 * - Refetch on reconnect
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data selama 5 menit (stale time)
      staleTime: 5 * 60 * 1000,

      // Keep unused data di cache selama 10 menit
      gcTime: 10 * 60 * 1000,

      // Retry 1x on error dengan exponential backoff
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch saat user kembali ke window/tab
      refetchOnWindowFocus: true,

      // Refetch saat internet reconnect
      refetchOnReconnect: true,

      // Disable auto refetch on mount (use cache)
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations 1x
      retry: 1,
    },
  },
});
