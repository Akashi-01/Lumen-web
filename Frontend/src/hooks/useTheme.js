// src/hooks/useTheme.js
import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "auto"
  );

  useEffect(() => {
    const applyTheme = () => {
      let resolved = theme;
      if (theme === "auto") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      document.documentElement.setAttribute("data-theme", resolved);
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", applyTheme);
      return () => mq.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  return [theme, setTheme];
}