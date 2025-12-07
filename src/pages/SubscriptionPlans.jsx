import React from "react";
import { Check, X, Zap, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "Gratis",
      description: "Untuk pemula yang baru memulai jualan online.",
      features: [
        "Maksimal 1 Toko",
        "Upload Data Harian",
        "Dashboard Basic",
        "Support Email",
      ],
      notIncluded: [
        "Analisa YoY Growth",
        "Export Laporan PDF",
        "Prioritas Support",
      ],
      icon: Zap,
      color: "blue",
    },
    {
      id: "pro",
      name: "Pro",
      price: "Rp 99.000",
      period: "/bulan",
      description: "Untuk seller serius yang ingin scale-up bisnis.",
      features: [
        "Unlimited Toko",
        "Upload Data Unlimited",
        "Dashboard Lengkap + YoY",
        "Export Laporan PDF",
        "Prioritas Support 24/7",
      ],
      notIncluded: [],
      icon: Crown,
      color: "orange",
      popular: true,
    },
  ];

  // Helper to determine button state
  const getButtonState = (plan) => {
    const isCurrent = user?.subscription === plan.id;
    const isPro = plan.id === "pro";

    if (isCurrent)
      return { text: "Paket Aktif", disabled: true, type: "current" };
    if (isPro)
      return { text: "Upgrade Sekarang", disabled: false, type: "upgrade" };
    return { text: "Hubungi Support", disabled: true, type: "downgrade" };
  };

  return (
    <div className="h-full flex flex-col justify-center overflow-hidden p-4">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-6 flex-none">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pilih Paket Langganan
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm">
            Sesuaikan dengan kebutuhan bisnis Anda. Upgrade kapan saja untuk
            fitur lebih lengkap.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto flex-none">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = user?.subscription === plan.id;
            const isPro = plan.id === "pro";

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col ${
                  isCurrent
                    ? "border-green-500 ring-2 ring-green-100 dark:ring-green-900"
                    : isPro
                    ? "border-orange-500"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                    POPULAR
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`inline-flex p-2 rounded-lg ${
                        isPro
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    {(() => {
                      const { text, disabled, type } = getButtonState(plan);

                      if (type === "upgrade") {
                        return (
                          <button
                            onClick={() => {
                              console.log(
                                "Navigating to payment for plan:",
                                plan
                              );
                              // toast.success("Mengarahkan ke halaman pembayaran...", { duration: 2000 });
                              navigate("/payment", { state: { plan } });
                            }}
                            className="block w-full text-center py-2.5 px-4 rounded-lg font-bold text-sm transition-all bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            {text}
                          </button>
                        );
                      }

                      // Handle current plan or downgrade
                      return (
                        <button
                          disabled={true}
                          className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                            type === "current"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default ring-1 ring-green-500/20"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {type === "current" ? "✓ Paket Aktif Saat Ini" : text}
                        </button>
                      );
                    })()}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <Check
                          size={14}
                          className="text-green-500 mr-2 flex-shrink-0"
                        />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-gray-400 dark:text-gray-600"
                      >
                        <X
                          size={14}
                          className="text-gray-300 dark:text-gray-600 mr-2 flex-shrink-0"
                        />
                        <span className="text-xs line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
