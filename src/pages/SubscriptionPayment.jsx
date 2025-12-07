import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  QrCode,
  CheckCircle,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import FeatureNotReady from "../components/common/FeatureNotReady";

const SubscriptionPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { upgradeSubscription } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Default to Pro plan if accessed directly
  const plan = location.state?.plan || {
    name: "Pro",
    price: "Rp 99.000",
    period: "/bulan",
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      upgradeSubscription("pro");

      // Redirect after showing success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in-up">
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pembayaran Berhasil!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Terima kasih telah berlangganan paket {plan.name}. Akun Anda telah
              diupgrade.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">
                Jumlah dibayar
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {plan.price}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Metode</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {paymentMethod}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </button>

        <FeatureNotReady
          message="Sistem Pembayaran Belum Terhubung"
          overlay={true}
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Metode Pembayaran
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mr-4 ${
                        paymentMethod === "card"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <CreditCard size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        Kartu Kredit / Debit
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visa, Mastercard, JCB
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-10 bg-gray-200 rounded"></div>
                      <div className="h-6 w-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "qris"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mr-4 ${
                        paymentMethod === "qris"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <QrCode size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        QRIS
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        GoPay, OVO, Dana, ShopeePay
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("ewallet")}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "ewallet"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mr-4 ${
                        paymentMethod === "ewallet"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <Smartphone size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        E-Wallet
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        LinkAja, AstraPay
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form (Only for Card) */}
              {paymentMethod === "card" && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Detail Kartu
                  </h3>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nomor Kartu
                      </label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Masa Berlaku
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama Pemilik
                      </label>
                      <input
                        type="text"
                        placeholder="Nama Lengkap"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Ringkasan Pesanan
                </h2>

                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Paket {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Langganan Bulanan
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{plan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Pajak (11%)</span>
                    <span>Rp 10.890</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span>Total</span>
                    <span>Rp 109.890</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${
                    processing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-[1.02]"
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2" size={20} />
                      Bayar Sekarang
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
                  <ShieldCheck size={14} className="mr-1" />
                  Pembayaran aman & terenkripsi
                </div>
              </div>
            </div>
          </div>
        </FeatureNotReady>
      </div>
    </div>
  );
};

export default SubscriptionPayment;
