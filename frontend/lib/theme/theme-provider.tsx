"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type ThemeMode = "dark" | "light";
type ThemeContextValue = Readonly<{
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = "streamly-theme";
const listeners = new Set<() => void>();
let fallbackTheme: ThemeMode = "dark";

function getTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved === "dark" || saved === "light" ? saved : fallbackTheme;
  } catch {
    return fallbackTheme;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setTheme(theme: ThemeMode) {
  fallbackTheme = theme;
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Theme remains usable without persistence.
  }
  for (const listener of listeners) listener();
}

function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

const getServerTheme = (): ThemeMode => "dark";

export function ThemeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
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
