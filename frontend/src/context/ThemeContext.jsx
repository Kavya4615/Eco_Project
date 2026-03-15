import { createContext, useContext, useState, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

/* ── Shared overrides ── */
const getDesignTokens = (mode) => ({
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  palette: {
    mode,
    primary: {
      main: "#2e7d32",
      light: "#60ad5e",
      dark: "#005005",
    },
    secondary: {
      main: "#00c853",
      light: "#5efc82",
      dark: "#009624",
    },
    ...(mode === "light"
      ? {
          background: { default: "#f8faf9", paper: "#ffffff" },
        }
      : {
          background: { default: "#0f1117", paper: "#1a1d28" },
        }),
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: "8px 24px",
          fontWeight: 600,
          textTransform: "none",
        },
        contained: {
          boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            mode === "light"
              ? "0 4px 24px rgba(0, 0, 0, 0.06)"
              : "0 4px 24px rgba(0, 0, 0, 0.3)",
          border:
            mode === "light"
              ? "1px solid rgba(0, 0, 0, 0.04)"
              : "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor:
            mode === "light"
              ? "rgba(0,0,0,0.08)"
              : "rgba(255,255,255,0.06)",
        },
      },
    },
  },
});

export function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("themeMode");
    return saved || "light";
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
