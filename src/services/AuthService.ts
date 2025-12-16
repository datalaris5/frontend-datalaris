/**
 * Auth Service
 * ------------
 * Service untuk endpoint autentikasi user.
 *
 * Endpoints:
 * - login: Login user dengan email dan password
 * - register: Registrasi user baru
 */

import apiClient from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types";
import type { AxiosResponse } from "axios";

export const AuthService = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    apiClient.post("/login", credentials),

  register: (
    userData: RegisterRequest
  ): Promise<AxiosResponse<RegisterResponse>> =>
    apiClient.post("/register", userData),
};
