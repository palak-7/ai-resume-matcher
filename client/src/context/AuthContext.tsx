import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "./auth-context";
import api from "../services/api";
import { removeGitHubToken } from "../utils/githubToken";

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

type ApiUser = User & {
  _id?: string;
};

const normalizeUser = (user: ApiUser): User => ({
  id: user.id || user._id || "",
  name: user.name,
  email: user.email,
  isVerified: Boolean(user.isVerified),
});




export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? normalizeUser(JSON.parse(savedUser)) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });

  const login = (newToken: string, newUser: User) => {
    const normalizedUser = normalizeUser(newUser);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.removeItem("github_token");
    setToken(newToken);
    setUser(normalizedUser);
  };

  const refreshUser = useCallback(async () => {
    const res = await api.get("/auth/me");
    const latestUser = normalizeUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(latestUser));
    setUser(latestUser);
  }, []);

  useEffect(() => {
    if (!token) return;

    refreshUser().catch(() => {
      removeGitHubToken(user);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    });
  }, [token, refreshUser]);

  const logout = async () => {
    try {
      await api.post('/auth/logout')   // server se refresh token delete karo
    } catch { /* ignore */ }
    removeGitHubToken(user)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        refreshUser,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


