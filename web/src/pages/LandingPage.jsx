import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/opswallet-logo.png";

function useReducedMotion() {
  return useMemo(() => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false, []);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  return (
    <div className="simpleLanding">
      <header className="simpleLanding__top">
        <div className="simpleLanding__brand" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <img className="brand__logo" src={logoUrl} alt="OpsWallet" />
          <div className="simpleLanding__brandText">
            <div className="simpleLanding__brandName">OpsWallet</div>
            <div className="simpleLanding__brandTag">Utilities for fast, clean output.</div>
          </div>
        </div>
        <div className="simpleLanding__actions">
          <button className="dash__btn" type="button" onClick={() => navigate("/auth")}>
            Sign in
          </button>
          <button className="primary" type="button" onClick={() => navigate("/auth#signup")}>
            Create account
            <span className="primary__shine" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="simpleLanding__main">
        <h1 className="simpleLanding__title">Convert, capture, and generate — in one place.</h1>
        <p className="simpleLanding__subtitle">
          No animated marketing site. Just the app.
          {!reducedMotion ? " " : ""}Open the dashboard after signing in.
        </p>
        <div className="simpleLanding__ctaRow">
          <button className="primary" type="button" onClick={() => navigate("/auth")}>
            Open app
            <span className="primary__shine" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}

