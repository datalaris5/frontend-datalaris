import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  CreditCard,
  CheckCircle,
  ShieldCheck,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import FeatureNotReady from "../../components/common/FeatureNotReady";

const SubscriptionPayment = () => {
  const { user, upgradeSubscription } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(async () => {
      await upgradeSubscription("pro");
      setLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pembayaran Berhasil!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Selamat! Akun Anda telah diupgrade ke{" "}
            <span className="font-bold text-orange-600">Pro Plan</span>.
            Sekarang Anda memiliki akses ke semua fitur canggih Datalaris.
          </p>
          <div className="pt-4">
            <Link
              to="/overview"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30"
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Link
            to="/subscription"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 inline-block font-medium"
          >
            ← Kembali ke Pilihan Paket
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Checkout Pembayaran
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Selesaikan pembayaran untuk mengaktifkan Pro Plan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Ringkasan Pesanan
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Pro Plan (Bulanan)
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Billed monthly
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    Rp 99.000
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-orange-600 text-xl">Rp 99.000</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-start">
                <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Pembayaran Anda diamankan dengan enkripsi 256-bit SSL. Kami
                  tidak menyimpan informasi kartu kredit Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="md:col-span-2">
            <div className="glass-card rounded-2xl shadow-sm p-8">
              <FeatureNotReady
                message="Sistem Pembayaran Sedang Maintenance"
                overlay={true}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Pilih Metode Pembayaran
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod("qris")}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left flex items-center ${
                      paymentMethod === "qris"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        QRIS
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Scan with GoPay, OVO, Dana
                      </p>
                    </div>
                    {paymentMethod === "qris" && (
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("va")}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left flex items-center ${
                      paymentMethod === "va"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        Virtual Account
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        BCA, Mandiri, BNI, BRI
                      </p>
                    </div>
                    {paymentMethod === "va" && (
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cc")}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left flex items-center ${
                      paymentMethod === "cc"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        Credit Card
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Visa, Mastercard
                      </p>
                    </div>
                    {paymentMethod === "cc" && (
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </button>
                </div>

                {/* Simulated Payment Form */}
                <div className="mb-8">
                  {paymentMethod === "qris" && (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="mx-auto h-48 w-48 bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
                          alt="QRIS Code"
                          className="w-full h-full object-contain opacity-50"
                        />
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Scan QR Code di atas menggunakan aplikasi e-wallet Anda
                      </p>
                    </div>
                  )}

                  {paymentMethod === "va" && (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400">
                        Nomor Virtual Account akan digenerate setelah Anda
                        menekan tombol Bayar.
                      </p>
                    </div>
                  )}
                  {paymentMethod === "cc" && (
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400">
                        Form input kartu kredit akan muncul via Payment Gateway
                        secured popup.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Bayar Sekarang - Rp 99.000
                    </>
                  )}
                </button>
              </FeatureNotReady>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;
