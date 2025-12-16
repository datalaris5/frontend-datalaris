/**
 * Chat Service
 * ------------
 * Service untuk endpoint Dashboard Chat.
 *
 * Endpoints:
 * - jumlahChat: Total chat masuk
 * - chatDibalas: Jumlah chat yang dibalas
 * - persentaseChat: Persentase chat dibalas
 * - totalPembeli: Total pembeli dari chat
 * - penjualan: Estimasi penjualan dari chat
 * - avgWaktuRespon: Rata-rata waktu respons
 */

import apiClient from "./axios";
import type { AxiosResponse } from "axios";

interface ChatParams {
  store_id?: string;
  start_date?: string;
  end_date?: string;
}

const BASE_URL = "/admin/dashboard-chat";

export const ChatService = {
  // 1. Jumlah Chat (Total Chat Masuk)
  jumlahChat: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/jumlah-chat`, payload),

  // 2. Chat Dibalas
  chatDibalas: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/chat-dibalas`, payload),

  // 3. Persentase Chat Dibalas
  persentaseChat: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/persentase-chat`, payload),

  // 4. Total Pembeli (dari Chat)
  totalPembeli: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/total-pembeli`, payload),

  // 5. Estimasi Penjualan (dari Chat)
  penjualan: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/penjualan`, payload),

  // 6. Conversion Rate (Chat to Sales)
  conversionRate: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/convertion-rate`, payload),

  // 7. Average Response Time (NEW)
  avgWaktuRespon: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/avg-waktu-respon`, payload),

  // 8. Total Jumlah Chat (NEW)
  totalJumlahChat: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/total-jumlah-chat`, payload),

  // 9. Average Response Time per Week (NEW)
  avgWaktuResponInWeek: (payload: ChatParams): Promise<AxiosResponse> =>
    apiClient.post(`${BASE_URL}/avg-waktu-respon/in-week`, payload),
};
