"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "dark" | "light";

type ThemeContextValue = Readonly<{
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("streamly-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("streamly-theme", theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () =>
        setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
