import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login berhasil! Selamat datang kembali.", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login gagal. Periksa email dan password Anda.");
    }
  };

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-orange-600 mb-2">
              Selamat Datang Kembali!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Masuk untuk mengelola dan memantau performa toko Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-gray-700 dark:text-gray-300"
                >
                  Ingat saya
                </label>
              </div>
              <a
                href="#"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Masuk
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-bold text-orange-600 hover:text-orange-500"
            >
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image/Content */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-500 to-red-600 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1574&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10 text-white max-w-lg text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <TrendingUp size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Analisis Penjualan Jadi Lebih Mudah
          </h2>
          <p className="text-lg text-orange-100 leading-relaxed">
            Datalaris membantu Anda memantau performa toko di Shopee dan TikTok
            Shop dalam satu dashboard terintegrasi. Tingkatkan omset dengan
            keputusan berbasis data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
