import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthLogin from "./pages/AuthLogin";
import AuthRegister from "./pages/AuthRegister";
import StoreManagement from "./pages/StoreManagement";
import DataUpload from "./pages/DataUpload";
import DashboardOverview from "./pages/DashboardOverview";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import SubscriptionPayment from "./pages/SubscriptionPayment";
import SettingsAccount from "./pages/SettingsAccount";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardProducts from "./pages/DashboardProducts";
import AdminBuilder from "./pages/admin/AdminBuilder";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import StoreManagement_Admin from "./pages/admin/StoreManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import ThemeSettings from "./pages/admin/ThemeSettings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/layout/AdminLayout";
import DynamicDashboard from "./pages/DynamicDashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FilterProvider } from "./context/FilterContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Router>
            <Routes>
              <Route path="/login" element={<AuthLogin />} />
              <Route path="/register" element={<AuthRegister />} />

              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <SubscriptionPayment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardOverview />} />
                <Route path="dashboard-custom" element={<DynamicDashboard />} />
                <Route path="stores" element={<StoreManagement />} />
                <Route path="upload" element={<DataUpload />} />
                <Route path="pricing" element={<SubscriptionPlans />} />
                <Route path="settings" element={<SettingsAccount />} />
                <Route path="orders" element={<DashboardOrders />} />
                <Route path="orders/products" element={<DashboardProducts />} />
              </Route>

              {/* Admin Routes */}
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
          </Router>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
