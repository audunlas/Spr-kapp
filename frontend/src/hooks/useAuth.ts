import { useCallback, useEffect, useState } from "react";
import { getMe, login as apiLogin, register as apiRegister, type User } from "../api/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await apiLogin(username, password);
    localStorage.setItem("token", access_token);
    const me = await getMe();
    setUser(me);
  }, []);

  const register = useCallback(async (
    username: string,
    password: string,
    nativeLanguage: string,
    email?: string,
  ) => {
    await apiRegister(username, password, nativeLanguage, email);
    await login(username, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return { user, setUser, isLoading, login, register, logout };
}
