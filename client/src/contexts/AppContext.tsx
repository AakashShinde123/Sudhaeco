import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { APP_CURRENCY } from "@shared/constants";

interface AppContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  toggleTheme: () => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Currency state (default to INR)
  const [currency, setCurrency] = useState(APP_CURRENCY);
  
  // Theme state - light, dark, or system
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    () => (localStorage.getItem("theme") as "light" | "dark" | "system") || "system"
  );

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes if using system preference
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.toggle("dark", mediaQuery.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      // If system, check current and toggle to opposite
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark";
    });
  };

  const value = {
    currency,
    setCurrency,
    theme,
    setTheme,
    toggleTheme
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
