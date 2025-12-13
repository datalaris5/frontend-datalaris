import apiClient from "./axios";

const BASE_URL = "/admin/dashboard-chat";

export const ChatService = {
  // 1. Jumlah Chat (Total Chat Masuk)
  jumlahChat: (payload) => apiClient.post(`${BASE_URL}/jumlah-chat`, payload),

  // 2. Chat Dibalas
  chatDibalas: (payload) => apiClient.post(`${BASE_URL}/chat-dibalas`, payload),

  // 3. Persentase Chat Dibalas
  persentaseChat: (payload) =>
    apiClient.post(`${BASE_URL}/persentase-chat`, payload),

  // 4. Total Pembeli (dari Chat)
  totalPembeli: (payload) =>
    apiClient.post(`${BASE_URL}/total-pembeli`, payload),

  // 5. Estimasi Penjualan (dari Chat)
  penjualan: (payload) => apiClient.post(`${BASE_URL}/penjualan`, payload),

  // 6. Conversion Rate (Chat to Sales)
  conversionRate: (payload) =>
    apiClient.post(`${BASE_URL}/convertion-rate`, payload),

  // 7. Average Response Time (NEW)
  avgWaktuRespon: (payload) =>
    apiClient.post(`${BASE_URL}/avg-waktu-respon`, payload),

  // 8. Total Jumlah Chat (NEW)
  totalJumlahChat: (payload) =>
    apiClient.post(`${BASE_URL}/total-jumlah-chat`, payload),

  // 9. Average Response Time per Week (NEW)
  avgWaktuResponInWeek: (payload) =>
    apiClient.post(`${BASE_URL}/avg-waktu-respon/in-week`, payload),
};
