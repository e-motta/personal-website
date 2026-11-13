import { useEffect, useState } from "react";
import styles from "./Layout.module.css";

function applyTheme(theme, persist) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#121212" : "#FFFFFF");
  if (persist) localStorage.setItem("theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(current);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return;
      const next = event.matches ? "dark" : "light";
      applyTheme(next, false);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const choose = (next) => {
    applyTheme(next, true);
    setTheme(next);
  };

  return (
    <div className={styles.theme} role="group" aria-label="Color theme">
      <button
        type="button"
        className={`${styles.themeButton} ${styles.lightTheme}`}
        aria-pressed={theme ? theme === "light" : undefined}
        onClick={() => choose("light")}
      >
        Light
      </button>
      <button
        type="button"
        className={`${styles.themeButton} ${styles.darkTheme}`}
        aria-pressed={theme ? theme === "dark" : undefined}
        onClick={() => choose("dark")}
      >
        Dark
      </button>
    </div>
  );
}
