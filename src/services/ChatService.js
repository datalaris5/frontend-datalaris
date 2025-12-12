import { api } from "./api";

const BASE_URL = "/admin/dashboard-chat";

export const ChatService = {
  // 1. Jumlah Chat (Total Chat Masuk)
  jumlahChat: (payload) => api.post(`${BASE_URL}/jumlah-chat`, payload),

  // 2. Chat Dibalas
  chatDibalas: (payload) => api.post(`${BASE_URL}/chat-dibalas`, payload),

  // 3. Persentase Chat Dibalas
  persentaseChat: (payload) => api.post(`${BASE_URL}/persentase-chat`, payload),

  // 4. Total Pembeli (dari Chat)
  totalPembeli: (payload) => api.post(`${BASE_URL}/total-pembeli`, payload),

  // 5. Estimasi Penjualan (dari Chat)
  penjualan: (payload) => api.post(`${BASE_URL}/penjualan`, payload),

  // 6. Conversion Rate (Chat to Sales)
  conversionRate: (payload) => api.post(`${BASE_URL}/convertion-rate`, payload),
};
