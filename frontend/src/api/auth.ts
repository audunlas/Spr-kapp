import { apiClient } from "./client";

export interface User {
  id: number;
  username: string;
  email: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function register(username: string, password: string, email?: string): Promise<User> {
  const res = await apiClient.post<User>("/auth/register", { username, password, email });
  return res.data;
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/auth/login", { username, password });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
}
