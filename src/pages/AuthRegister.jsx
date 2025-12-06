import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = (e) => {
    e.preventDefault();
    register(name, email, password);
    toast.success('Akun berhasil dibuat! Selamat datang.', {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    navigate('/dashboard');
  };

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Left Side - Hero Image/Content (Swapped for variety) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1615&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="relative z-10 text-white max-w-lg text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-20 w-20 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20">
              <Rocket size={40} className="text-blue-300" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">Mulai Perjalanan Bisnis Anda</h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Bergabunglah dengan ribuan seller lainnya yang telah mengoptimalkan penjualan mereka menggunakan Datalaris. Gratis untuk memulai!
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buat Akun Baru</h1>
            <p className="text-gray-500 dark:text-gray-400">Lengkapi data diri Anda untuk mendaftar.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  placeholder="Nama Anda"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Daftar Sekarang
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRegister;
