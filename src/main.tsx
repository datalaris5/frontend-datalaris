/**
 * Application Bootstrap
 * ---------------------
 * Entry point untuk aplikasi React.
 * Renders App ke DOM element dengan id="root".
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { queryClient } from "./lib/queryClient";

// Render aplikasi ke DOM
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      {/* DevTools hanya muncul di development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
