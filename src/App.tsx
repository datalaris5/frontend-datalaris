/**
 * Main Application Entry Point
 * ----------------------------
 * Root component yang mengatur routing dan provider contexts.
 *
 * Struktur:
 * - ThemeProvider: Dark/Light mode management
 * - AuthProvider: Authentication state
 * - FilterProvider: Store/Date filter state
 * - Router: React Router untuk navigasi
 * - Suspense: Lazy loading dengan fallback
 */

import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Contexts
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FilterProvider } from "./context/FilterContext";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";
import ErrorBoundary from "./components/common/ErrorBoundary";

// === LAZY LOADED PAGES ===

// Auth
const AuthLogin = React.lazy(() => import("./pages/Auth/Login"));
const AuthRegister = React.lazy(() => import("./pages/Auth/Register"));

// Dashboard & Features
const DashboardLayout = React.lazy(
  () => import("./components/layout/DashboardLayout")
);
const DashboardOverview = React.lazy(
  () => import("./pages/Dashboard/Overview")
);
const DashboardOrders = React.lazy(() => import("./pages/Dashboard/Orders"));
const DashboardProducts = React.lazy(
  () => import("./pages/Dashboard/Products")
);
const DynamicDashboard = React.lazy(() => import("./pages/Dashboard/Dynamic"));
const DashboardAds = React.lazy(() => import("./pages/Dashboard/Ads"));
const DashboardChat = React.lazy(() => import("./pages/Dashboard/Chat"));

// Store & Data
const StoreManagement = React.lazy(() => import("./pages/Store/Management"));
const DataUpload = React.lazy(() => import("./pages/Data/Upload"));

// Settings & Subscription
const SettingsAccount = React.lazy(() => import("./pages/Settings/Account"));
const SubscriptionPlans = React.lazy(
  () => import("./pages/Subscription/Plans")
);
const SubscriptionPayment = React.lazy(
  () => import("./pages/Subscription/Payment")
);

// Admin
const AdminLogin = React.lazy(() => import("./pages/Admin/AdminLogin"));
const AdminLayout = React.lazy(() => import("./components/layout/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminBuilder = React.lazy(() => import("./pages/Admin/AdminBuilder"));
const ThemeSettings = React.lazy(() => import("./pages/Admin/ThemeSettings"));
const UserManagement = React.lazy(() => import("./pages/Admin/UserManagement"));
const StoreManagement_Admin = React.lazy(
  () => import("./pages/Admin/StoreManagement")
);
const SystemSettings = React.lazy(() => import("./pages/Admin/SystemSettings"));

// === MAIN APP COMPONENT ===

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                borderRadius: "10px",
                background: "#333",
                color: "#fff",
              },
            }}
          />

          {/* Error Boundary untuk catch runtime errors */}
          <ErrorBoundary>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* === PUBLIC ROUTES === */}
                  <Route path="/login" element={<AuthLogin />} />
                  <Route path="/register" element={<AuthRegister />} />

                  {/* === PROTECTED PAYMENT ROUTE === */}
                  <Route
                    path="/payment"
                    element={
                      <ProtectedRoute>
                        <SubscriptionPayment />
                      </ProtectedRoute>
                    }
                  />

                  {/* === PROTECTED DASHBOARD ROUTES === */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={<Navigate to="/overview" replace />}
                    />
                    <Route path="overview" element={<DashboardOverview />} />
                    <Route
                      path="dashboard-custom"
                      element={<DynamicDashboard />}
                    />
                    <Route path="ads" element={<DashboardAds />} />
                    <Route path="chat" element={<DashboardChat />} />
                    <Route path="stores" element={<StoreManagement />} />
                    <Route path="upload" element={<DataUpload />} />
                    <Route path="pricing" element={<SubscriptionPlans />} />
                    <Route path="settings" element={<SettingsAccount />} />
                    <Route path="orders" element={<DashboardOrders />} />
                    <Route
                      path="orders/products"
                      element={<DashboardProducts />}
                    />
                  </Route>

                  {/* === ADMIN ROUTES === */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={<Navigate to="/admin/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="builder" element={<AdminBuilder />} />
                    <Route path="theme" element={<ThemeSettings />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="stores" element={<StoreManagement_Admin />} />
                    <Route path="settings" element={<SystemSettings />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ErrorBoundary>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
