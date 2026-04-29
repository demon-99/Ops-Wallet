import { useTheme } from "../theme/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-theme={theme}
    >
      <span className="themeToggle__track" aria-hidden="true">
        <span className="themeToggle__thumb">
          {isDark ? (
            <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </g>
            </svg>
          )}
        </span>
      </span>
      <span className="themeToggle__text">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
