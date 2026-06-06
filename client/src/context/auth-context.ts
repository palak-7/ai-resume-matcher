import { createContext } from "react";
interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
export const AuthContext = createContext<AuthContextType | null>(null);
