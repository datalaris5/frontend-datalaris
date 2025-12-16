/**
 * Application Bootstrap
 * ---------------------
 * Entry point untuk aplikasi React.
 * Renders App ke DOM element dengan id="root".
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Render aplikasi ke DOM
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
