import { apiClient } from "./axios";

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authApi = {
  async signup(payload: SignUpPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signup", {
      email: payload.email,
      password: payload.password,
      name: payload.name,
    });
    if (response.data?.access_token) {
      localStorage.setItem("safesphere_token", response.data.access_token);
    }
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email: payload.email,
      password: payload.password,
    });
    if (response.data?.access_token) {
      localStorage.setItem("safesphere_token", response.data.access_token);
    }
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },
};
