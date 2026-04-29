import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    const onClickAway = (e) => {
      if (!wrapRef.current?.contains(e.target)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickAway);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickAway);
    };
  }, [open, close]);

  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <div
      className={`mobileMenu${open ? " mobileMenu--open" : ""}`}
      ref={wrapRef}
    >
      <div className="mobileMenu__inline">
        <ThemeToggle />
      </div>

      <button
        ref={buttonRef}
        type="button"
        className="hamburger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hamburger__box" aria-hidden="true">
          <span className="hamburger__line" />
          <span className="hamburger__line" />
          <span className="hamburger__line" />
        </span>
      </button>

      <div
        id="mobile-menu-panel"
        className="mobileMenu__panel"
        role="menu"
        aria-hidden={!open}
      >
        <div className="mobileMenu__panelInner">
          <div className="mobileMenu__row">
            <span className="mobileMenu__rowLabel">Theme</span>
            <ThemeToggle />
          </div>
          <div className="mobileMenu__divider" aria-hidden="true" />
          <button
            type="button"
            className="mobileMenu__link"
            role="menuitem"
            onClick={() => go("/auth")}
          >
            Sign in
          </button>
          <button
            type="button"
            className="mobileMenu__link mobileMenu__link--primary"
            role="menuitem"
            onClick={() => go("/auth#signup")}
          >
            Create account
          </button>
          <div className="mobileMenu__divider" aria-hidden="true" />
          <a
            href="#features"
            className="mobileMenu__link"
            role="menuitem"
            onClick={close}
          >
            Features
          </a>
          <a
            href="#integrations"
            className="mobileMenu__link"
            role="menuitem"
            onClick={close}
          >
            Integrations
          </a>
          <a
            href="#metrics"
            className="mobileMenu__link"
            role="menuitem"
            onClick={close}
          >
            Metrics
          </a>
        </div>
      </div>
    </div>
  );
}
