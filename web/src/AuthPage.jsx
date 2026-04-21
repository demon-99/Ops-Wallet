import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DigitalBackground from "./components/DigitalBackground.jsx";
import ShaderOverlay from "./components/ShaderOverlay.jsx";
import { isUserServiceError, useAuth } from "./auth/AuthContext.jsx";
import gsap from "gsap";
import logoUrl from "./assets/opswallet-logo.png";
import { useScrollAnimations } from "./hooks/useScrollAnimations.js";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
  const v = String(value || "").trim();
  if (!v) return "Email is required.";
  if (!emailRe.test(v)) return "Enter a valid email address.";
  return "";
}

function validateName(value, label) {
  const v = String(value || "").trim();
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} is too short.`;
  return "";
}

function validatePassword(value) {
  const v = String(value || "");
  if (!v) return "Password is required.";
  if (v.length < 8) return "Use at least 8 characters.";
  return "";
}

function validateConfirmPassword(password, confirm) {
  const c = String(confirm || "");
  if (!c) return "Please confirm your password.";
  if (String(password || "") !== c) return "Passwords do not match.";
  return "";
}

function passwordScore(value) {
  const v = String(value || "");
  let score = 0;
  if (v.length >= 8) score += 1;
  if (v.length >= 12) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^a-zA-Z0-9]/.test(v)) score += 1;
  return Math.min(5, score);
}

function Toast({ message, hidden }) {
  return (
    <div className="toast" aria-hidden={hidden ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
      <span className="toast__dot" aria-hidden="true"></span>
      <span className="toast__text">{message}</span>
    </div>
  );
}

export default function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Dev escape hatch: `/auth?clearSession=1` wipes any cached login so you
  // can actually see the login form without digging through DevTools.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("clearSession") === "1") {
      try {
        localStorage.removeItem("newproduct.auth.v1");
        // eslint-disable-next-line no-console
        console.log("[auth] cleared stored session via ?clearSession=1");
      } catch {
        /* localStorage may be unavailable; ignore */
      }
      // Reload without the query param so refreshes don't keep wiping it.
      const url = new URL(window.location.href);
      url.searchParams.delete("clearSession");
      window.location.replace(url.toString());
    }
  }, []);

  // Trace every render so it's obvious in DevTools what branch we're in.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("[auth-page] render — status:", auth.status, "authed:", auth.isAuthenticated);
  }

  const [mode, setMode] = useState(() => (window.location.hash.replace("#", "") === "signup" ? "signup" : "login"));
  const [toast, setToast] = useState({ message: "", hidden: true });
  const [showPw, setShowPw] = useState({ login: false, signup: false, signupConfirm: false });

  const loginEmailRef = useRef(null);
  const signupFirstRef = useRef(null);
  const authRootRef = useRef(null);
  // Re-run when auth status changes so the form's entry animations still
  // trigger after the "checking session" loader unmounts.
  useScrollAnimations(authRootRef, "[data-anim]", [auth.status]);

  useEffect(() => {
    if (auth.status === "loading") return;
    if (auth.isAuthenticated) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("[auth-page] authed — redirecting to /integrations");
      }
      navigate("/integrations", { replace: true });
    }
  }, [auth.status, auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const shell = document.querySelector(".auth__shell");
    if (!shell) return;
    gsap.fromTo(shell, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
  }, []);

  const [login, setLogin] = useState({ email: "", password: "", remember: true });
  const [robotCheck, setRobotCheck] = useState({ verified: false, verifying: false });
  const robotTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (robotTimerRef.current) clearTimeout(robotTimerRef.current);
    };
  }, []);

  const verifyNotRobot = () => {
    if (robotCheck.verifying) return;
    if (robotCheck.verified) {
      setRobotCheck({ verified: false, verifying: false });
      return;
    }
    setRobotCheck({ verified: false, verifying: true });
    robotTimerRef.current = setTimeout(() => {
      setRobotCheck({ verified: true, verifying: false });
    }, 900);
  };
  const [signup, setSignup] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    newsletter: false,
  });

  const loginErrors = useMemo(() => {
    return {
      email: validateEmail(login.email),
      password: validatePassword(login.password),
    };
  }, [login.email, login.password]);

  const signupErrors = useMemo(() => {
    return {
      firstName: validateName(signup.firstName, "First name"),
      lastName: validateName(signup.lastName, "Last name"),
      email: validateEmail(signup.email),
      password: validatePassword(signup.password),
      confirmPassword: validateConfirmPassword(signup.password, signup.confirmPassword),
    };
  }, [signup]);

  const signupMeterPct = useMemo(() => Math.round((passwordScore(signup.password) / 5) * 100), [signup.password]);

  useEffect(() => {
    if (mode === "signup") {
      signupFirstRef.current?.focus({ preventScroll: true });
      setToast({ message: "Switched to Sign up.", hidden: false });
      window.location.hash = "signup";
    } else {
      loginEmailRef.current?.focus({ preventScroll: true });
      setToast({ message: "Switched to Login.", hidden: false });
      window.location.hash = "login";
    }
  }, [mode]);

  const onTabKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setMode((m) => (m === "login" ? "signup" : "login"));
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    const ok = !loginErrors.email && !loginErrors.password;
    if (!ok) {
      setToast({ message: "Fix the highlighted fields, then try again.", hidden: false });
      return;
    }
    if (!robotCheck.verified) {
      setToast({ message: "Please verify that you are not a robot.", hidden: false });
      return;
    }
    setToast({ message: "Logging in…", hidden: false });
    try {
      await auth.login({ email: login.email, password: login.password });
      setToast({ message: "Login successful.", hidden: false });
      navigate("/integrations", { replace: true });
    } catch (err) {
      const msg = isUserServiceError(err) ? err.message : "Login failed. Please try again.";
      setToast({ message: msg, hidden: false });
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    const ok =
      !signupErrors.firstName &&
      !signupErrors.lastName &&
      !signupErrors.email &&
      !signupErrors.password &&
      !signupErrors.confirmPassword;
    if (!ok) {
      setToast({ message: "Fix the highlighted fields, then try again.", hidden: false });
      return;
    }
    setToast({ message: "Creating account…", hidden: false });
    try {
      await auth.signup({
        email: signup.email,
        password: signup.password,
        firstName: signup.firstName,
        lastName: signup.lastName,
      });
      setToast({ message: "Account created.", hidden: false });
      navigate("/integrations", { replace: true });
    } catch (err) {
      const msg = isUserServiceError(err) ? err.message : "Sign up failed. Please try again.";
      setToast({ message: msg, hidden: false });
    }
  };

  // While AuthContext is resolving a cached session, or if the user is
  // already authed (and is about to be redirected by the effect above),
  // don't render the form at all — otherwise it flashes on screen for a
  // few hundred milliseconds before the redirect fires.
  if (auth.status === "loading" || auth.isAuthenticated) {
    return (
      <main className="page authLoading" aria-busy="true" aria-live="polite">
        <DigitalBackground />
        <div className="authLoading__spinner" aria-hidden="true" />
        <span className="visually-hidden">Checking your session…</span>
      </main>
    );
  }

  return (
    <>
      <a className="skip-link" href="#auth">
        Skip to content
      </a>

      <main className="page" ref={authRootRef}>
        <DigitalBackground />
        <ShaderOverlay
          colorA="#7c3aed"
          colorB="#22d3ee"
          colorC="#0b0e24"
          intensity={0.55}
          opacity={0.35}
          blendMode="screen"
        />

        <section className="auth" id="auth" aria-label="Authentication">
          <div className="auth__shell" data-mode={mode}>
            <header className="auth__header">
              <div className="brand" aria-label="Brand">
                <img className="brand__logo" src={logoUrl} alt="OpsWallet" />
              </div>

              <div className="auth__tabs" role="tablist" aria-label="Login or sign up">
                <button
                  className="tab"
                  type="button"
                  role="tab"
                  aria-selected={mode === "login" ? "true" : "false"}
                  aria-controls="panel-login"
                  id="tab-login"
                  onClick={() => setMode("login")}
                  onKeyDown={onTabKeyDown}
                >
                  Login
                </button>
                <button
                  className="tab"
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup" ? "true" : "false"}
                  aria-controls="panel-signup"
                  id="tab-signup"
                  onClick={() => setMode("signup")}
                  onKeyDown={onTabKeyDown}
                >
                  Sign up
                </button>
                <span className="auth__pill" aria-hidden="true"></span>
              </div>
            </header>

            <div className="auth__content">
              <div className="panels">
                <section className="panel" id="panel-login" role="tabpanel" aria-labelledby="tab-login">
                  <h1 className="title">Welcome back</h1>
                  <p className="subtitle">Log in to continue. We’ll keep it smooth and secure.</p>

                  <form className="form" onSubmit={submitLogin} noValidate>
                    <div className="field">
                      <label className="label" htmlFor="login-email">
                        Email
                      </label>
                      <div className="control">
                        <input
                          ref={loginEmailRef}
                          className="input"
                          id="login-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          placeholder="you@domain.com"
                          value={login.email}
                          onChange={(e) => setLogin((s) => ({ ...s, email: e.target.value }))}
                          required
                        />
                        <span className="ring" aria-hidden="true"></span>
                      </div>
                      <p className="hint" data-state={loginErrors.email ? "error" : undefined} aria-live="polite">
                        {loginErrors.email || ""}
                      </p>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="login-password">
                        Password
                      </label>
                      <div className="control control--with-button">
                        <input
                          className="input"
                          id="login-password"
                          name="password"
                          type={showPw.login ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Your password"
                          minLength={8}
                          value={login.password}
                          onChange={(e) => setLogin((s) => ({ ...s, password: e.target.value }))}
                          required
                        />
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setShowPw((s) => ({ ...s, login: !s.login }))}
                          aria-label={showPw.login ? "Hide password" : "Show password"}
                        >
                          {showPw.login ? "Hide" : "Show"}
                        </button>
                        <span className="ring" aria-hidden="true"></span>
                      </div>
                      <p className="hint" data-state={loginErrors.password ? "error" : undefined} aria-live="polite">
                        {loginErrors.password || ""}
                      </p>
                    </div>

                    <div className="row">
                      <label className="check">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={login.remember}
                          onChange={(e) => setLogin((s) => ({ ...s, remember: e.target.checked }))}
                        />
                        <span>Remember me</span>
                      </label>
                      <a className="link" href="#" aria-label="Reset password">
                        Forgot password?
                      </a>
                    </div>

                    <div
                      className="captcha"
                      data-state={
                        robotCheck.verified ? "verified" : robotCheck.verifying ? "verifying" : "idle"
                      }
                    >
                      <button
                        type="button"
                        className="captcha__box"
                        role="checkbox"
                        aria-checked={robotCheck.verified ? "true" : "false"}
                        aria-busy={robotCheck.verifying ? "true" : "false"}
                        aria-label="I'm not a robot"
                        onClick={verifyNotRobot}
                        disabled={robotCheck.verifying}
                      >
                        {robotCheck.verifying ? (
                          <span className="captcha__spinner" aria-hidden="true"></span>
                        ) : robotCheck.verified ? (
                          <svg
                            className="captcha__check"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="4 12 10 18 20 6" />
                          </svg>
                        ) : null}
                      </button>
                      <span className="captcha__label">I'm not a robot</span>
                      <div className="captcha__brand" aria-hidden="true">
                        <div className="captcha__brandMark">ow</div>
                        <div className="captcha__brandText">
                          <div>OpsWallet</div>
                          <div className="captcha__brandSub">Privacy · Terms</div>
                        </div>
                      </div>
                    </div>

                    <button className="primary" type="submit">
                      <span>Log in</span>
                      <span className="primary__shine" aria-hidden="true"></span>
                    </button>

                    <div className="or">
                      <span>or continue with</span>
                    </div>

                    <div className="providers">
                      <button className="provider" type="button">
                        <span className="provider__icon" aria-hidden="true">
                          G
                        </span>
                        Google
                      </button>
                      <button className="provider" type="button">
                        <span className="provider__icon" aria-hidden="true">
                          
                        </span>
                        Apple
                      </button>
                      <button className="provider" type="button">
                        <span className="provider__icon" aria-hidden="true">
                          ◎
                        </span>
                        SSO
                      </button>
                    </div>

                    <p className="fineprint">
                      By logging in, you agree to our <a className="link" href="#">Terms</a> and{" "}
                      <a className="link" href="#">Privacy Policy</a>.
                    </p>
                  </form>
                </section>

                <section className="panel" id="panel-signup" role="tabpanel" aria-labelledby="tab-signup" tabIndex={-1}>
                  <h1 className="title">Create your account</h1>
                  <p className="subtitle">A clean start with a vibrant finish. Let’s get you set up.</p>

                  <form className="form" onSubmit={submitSignup} noValidate>
                    <div className="grid2">
                      <div className="field">
                        <label className="label" htmlFor="first-name">
                          First name
                        </label>
                        <div className="control">
                          <input
                            ref={signupFirstRef}
                            className="input"
                            id="first-name"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            placeholder="Nikhil"
                            value={signup.firstName}
                            onChange={(e) => setSignup((s) => ({ ...s, firstName: e.target.value }))}
                            required
                          />
                          <span className="ring" aria-hidden="true"></span>
                        </div>
                        <p className="hint" data-state={signupErrors.firstName ? "error" : undefined} aria-live="polite">
                          {signupErrors.firstName || ""}
                        </p>
                      </div>

                      <div className="field">
                        <label className="label" htmlFor="last-name">
                          Last name
                        </label>
                        <div className="control">
                          <input
                            className="input"
                            id="last-name"
                            name="lastName"
                            type="text"
                            autoComplete="family-name"
                            placeholder="Patel"
                            value={signup.lastName}
                            onChange={(e) => setSignup((s) => ({ ...s, lastName: e.target.value }))}
                            required
                          />
                          <span className="ring" aria-hidden="true"></span>
                        </div>
                        <p className="hint" data-state={signupErrors.lastName ? "error" : undefined} aria-live="polite">
                          {signupErrors.lastName || ""}
                        </p>
                      </div>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="signup-email">
                        Work email
                      </label>
                      <div className="control">
                        <input
                          className="input"
                          id="signup-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          placeholder="you@company.com"
                          value={signup.email}
                          onChange={(e) => setSignup((s) => ({ ...s, email: e.target.value }))}
                          required
                        />
                        <span className="ring" aria-hidden="true"></span>
                      </div>
                      <p className="hint" data-state={signupErrors.email ? "error" : undefined} aria-live="polite">
                        {signupErrors.email || ""}
                      </p>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="signup-password">
                        Password
                      </label>
                      <div className="control control--with-button">
                        <input
                          className="input"
                          id="signup-password"
                          name="password"
                          type={showPw.signup ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          minLength={8}
                          value={signup.password}
                          onChange={(e) => setSignup((s) => ({ ...s, password: e.target.value }))}
                          required
                        />
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setShowPw((s) => ({ ...s, signup: !s.signup }))}
                          aria-label={showPw.signup ? "Hide password" : "Show password"}
                        >
                          {showPw.signup ? "Hide" : "Show"}
                        </button>
                        <span className="ring" aria-hidden="true"></span>
                      </div>
                      <div className="meter" aria-hidden="true">
                        <span className="meter__bar" style={{ width: `${signupMeterPct}%` }}></span>
                      </div>
                      <p className="hint" data-state={signupErrors.password ? "error" : undefined} aria-live="polite">
                        {signupErrors.password || ""}
                      </p>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="signup-confirm-password">
                        Confirm password
                      </label>
                      <div className="control control--with-button">
                        <input
                          className="input"
                          id="signup-confirm-password"
                          name="confirmPassword"
                          type={showPw.signupConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          minLength={8}
                          value={signup.confirmPassword}
                          onChange={(e) => setSignup((s) => ({ ...s, confirmPassword: e.target.value }))}
                          required
                        />
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setShowPw((s) => ({ ...s, signupConfirm: !s.signupConfirm }))}
                          aria-label={showPw.signupConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showPw.signupConfirm ? "Hide" : "Show"}
                        </button>
                        <span className="ring" aria-hidden="true"></span>
                      </div>
                      <p className="hint" data-state={signupErrors.confirmPassword ? "error" : undefined} aria-live="polite">
                        {signupErrors.confirmPassword || ""}
                      </p>
                    </div>

                    <div className="row">
                      <label className="check">
                        <input
                          type="checkbox"
                          name="newsletter"
                          checked={signup.newsletter}
                          onChange={(e) => setSignup((s) => ({ ...s, newsletter: e.target.checked }))}
                        />
                        <span>Send me product updates</span>
                      </label>
                    </div>

                    <button className="primary" type="submit">
                      <span>Create account</span>
                      <span className="primary__shine" aria-hidden="true"></span>
                    </button>

                    <p className="fineprint">
                      By creating an account, you agree to our <a className="link" href="#">Terms</a> and{" "}
                      <a className="link" href="#">Privacy Policy</a>.
                    </p>
                  </form>
                </section>
              </div>

              <aside className="side" aria-label="Highlights">
                <div className="side__card" data-anim="fade-up" data-anim-delay="0.05">
                  <h2 className="side__title">Designed for production</h2>
                  <ul className="side__list">
                    <li>Accessible focus rings and ARIA tabs</li>
                    <li>Reduced-motion friendly animations</li>
                    <li>Form validation with clear inline hints</li>
                    <li>Responsive layout from mobile to desktop</li>
                  </ul>
                </div>

                <div className="side__card side__card--mini" data-anim="fade-up" data-anim-delay="0.15">
                  <div className="badge">Live</div>
                  <div className="stat">
                    <div className="stat__label">Uptime</div>
                    <div className="stat__value">99.99%</div>
                  </div>
                  <div className="stat">
                    <div className="stat__label">Latency</div>
                    <div className="stat__value">~120ms</div>
                  </div>
                </div>
              </aside>
            </div>

            <footer className="auth__footer">
              <span className="muted">Tip:</span> Press <kbd>Tab</kbd> to explore, and <kbd>Enter</kbd> to submit.
            </footer>
          </div>
        </section>
      </main>

      <Toast message={toast.message} hidden={toast.hidden} />
    </>
  );
}

