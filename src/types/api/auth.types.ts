/**
 * Definisi Type untuk Autentikasi
 * -------------------------------
 * Tipe data untuk user, login request/response, dan register.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id: string;
  tenant_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  tenant_name: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
}
