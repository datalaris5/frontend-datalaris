import apiClient from "./axios";

export const AuthService = {
  login: (credentials) => apiClient.post("/login", credentials),

  register: (userData) => apiClient.post("/register", userData),
};
