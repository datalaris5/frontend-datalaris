import React, { useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use unified login for now
      const response = await api.auth.login({
        email: formData.email,
        password: formData.password,
      });

      // Store token
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      toast.success("Welcome back, Superadmin!");
      navigate("/admin/builder");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full glass-card rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 brand-icon-soft rounded-full">
              <Shield size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Admin Console
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Secure access for Datalaris Superadmin
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="admin@datalaris.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white brand-gradient hover:opacity-90 brand-shadow hover:shadow-xl hover:shadow-orange-500/30 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Login to Console
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-muted/30 border-t border-border/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Restricted Area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
