/**
 * Login Page
 * ----------
 * Halaman login untuk pengguna yang sudah terdaftar.
 *
 * Fitur:
 * - Form login dengan email dan password
 * - Toggle show/hide password
 * - Checkbox "Ingat saya"
 * - Link ke halaman register
 * - Placeholder untuk Google OAuth (coming soon)
 *
 * Flow:
 * 1. User input email dan password
 * 2. Submit → AuthContext.login()
 * 3. Sukses → redirect ke /overview
 * 4. Gagal → tampilkan toast error
 */

import React, { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, TrendingUp, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AUTH_IMAGE_LOGIN } from "@/constants/authImages";

const AuthLogin: React.FC = () => {
  // State untuk form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * Handler submit form login
   * Memanggil AuthContext.login() lalu redirect jika sukses
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login berhasil! Selamat datang kembali.");
      navigate("/overview");
    } catch (error) {
      toast.error("Login gagal. Periksa email dan password Anda.");
    }
  };

  return (
    <div className="h-screen flex transition-colors overflow-hidden auth-mesh-gradient-login">
      {/* Decorative Glass Orbs */}
      <div className="auth-orb auth-orb-orange w-80 h-80 -top-40 -left-20" />
      <div className="auth-orb auth-orb-purple w-96 h-96 -bottom-48 left-1/4" />

      {/* Bagian Kiri - Form Login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto relative z-10">
        <div className="w-full max-w-md auth-glass-container p-8 sm:p-10 auth-animate-in">
          {/* Header */}
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Selamat Datang Kembali!
            </h1>
            <p className="text-muted-foreground">
              Masuk untuk memantau performa toko Anda.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 auth-icon" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 auth-glass-input"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field dengan toggle visibility */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 auth-icon" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 auth-glass-input"
                  placeholder="••••••••"
                  required
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="auth-checkbox-label">
                  Ingat saya
                </Label>
              </div>
              <a href="#" className="auth-link font-medium">
                Lupa password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-md font-bold rounded-xl auth-glass-button"
            >
              Masuk
            </Button>

            {/* Divider - Clean flexbox approach */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 auth-glass-divider"></div>
              <span className="auth-divider-text">Atau masuk dengan</span>
              <div className="flex-1 auth-glass-divider"></div>
            </div>

            {/* Google Login (Coming Soon) */}
            <Button
              type="button"
              variant="outline"
              disabled
              className="w-full h-12 rounded-xl auth-social-button opacity-60 cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google (Segera Hadir)
            </Button>
          </form>

          {/* Link ke Register */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="auth-link-bold">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Bagian Kanan - Hero Image/Content */}
      <div className="hidden md:flex w-1/2 auth-hero-gradient-orange p-12 items-center justify-center relative overflow-hidden">
        {/* Background image dengan opacity */}
        <div
          className="auth-hero-bg-overlay"
          style={{
            backgroundImage: `url('${AUTH_IMAGE_LOGIN}')`,
          }}
        />

        {/* Decorative Blur Orbs */}
        <div className="auth-hero-orb auth-hero-orb-white w-64 h-64 -top-20 -right-20" />
        <div className="auth-hero-orb auth-hero-orb-pink w-80 h-80 -bottom-32 -left-20" />
        <div className="auth-hero-orb auth-hero-orb-yellow w-40 h-40 top-1/2 right-1/4" />

        {/* Glass Card Content - Liquid Glass Style */}
        <div className="relative z-10 max-w-xl w-full mx-8">
          <div className="auth-hero-glass-card px-10 py-8 text-center">
            {/* Icon - Liquid Glass */}
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-2xl flex items-center justify-center auth-hero-glass-icon">
                <TrendingUp size={40} className="text-white" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold mb-4 text-white">
              Analisis Penjualan Jadi Lebih Mudah
            </h2>

            {/* Description */}
            <p className="text-base text-white/90 leading-relaxed">
              Pantau performa toko semua platform dalam satu dashboard.
              Tingkatkan omset dengan keputusan berbasis data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
