import { createContext } from "react";

export const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
} | null>(null);
