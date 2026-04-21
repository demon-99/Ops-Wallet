import { useEffect, useRef } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import DigitalBackground from "../components/DigitalBackground.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useScrollAnimations } from "../hooks/useScrollAnimations.js";
import logoUrl from "../assets/opswallet-logo.png";
import ImageToPdfPage from "./tools/ImageToPdfPage.jsx";
import RemoveBackgroundPage from "./tools/RemoveBackgroundPage.jsx";
import BarcodePage from "./tools/BarcodePage.jsx";
import WebpageScreenshotPage from "./tools/WebpageScreenshotPage.jsx";
import ComingSoonToolPage from "./tools/ComingSoonToolPage.jsx";
import HtmlToPdfPage from "./tools/HtmlToPdfPage.jsx";

export default function IntegrationHubPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageRootRef = useRef(null);
  useScrollAnimations(pageRootRef, "[data-anim]", [location.pathname]);

  const displayName = [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(" ") || auth.user?.email || "User";

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
    const main = document.querySelector(".dash__content");
    if (!main) return;
    gsap.fromTo(main, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" });
  }, [location.pathname]);

  const onLogout = async () => {
    await auth.logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <a className="skip-link" href="#dash-main">
        Skip to content
      </a>

      <div className="page integration-page" ref={pageRootRef}>
        <DigitalBackground />

        <div className="dash" id="dash-main">
          <aside className="dash__sidebar" aria-label="Integrations navigation">
            <div className="dash__brand">
              <img className="brand__logo" src={logoUrl} alt="OpsWallet" />
            </div>

            <nav className="dash__nav" aria-label="Tools">
              <details className="dash__section">
                <summary className="dash__sectionTitle">PDF</summary>
                <div className="dash__sectionBody">
                  <NavLink
                    className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                    to="/integrations/image-to-pdf"
                  >
                    Image to PDF
                  </NavLink>
                  <NavLink
                    className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                    to="/integrations/html-to-pdf"
                  >
                    HTML to PDF
                  </NavLink>
                </div>
              </details>

              <details className="dash__section">
                <summary className="dash__sectionTitle">Images</summary>
                <div className="dash__sectionBody">
                  <NavLink
                    className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                    to="/integrations/remove-background"
                  >
                    Remove background
                  </NavLink>
                  <NavLink
                    className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                    to="/integrations/barcode"
                  >
                    Barcode
                  </NavLink>
                </div>
              </details>

              <details className="dash__section">
                <summary className="dash__sectionTitle">Web</summary>
                <div className="dash__sectionBody">
                  <NavLink
                    className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                    to="/integrations/webpage-screenshot"
                  >
                    Webpage screenshot
                  </NavLink>
                </div>
              </details>

              <details className="dash__section">
                <summary className="dash__sectionTitle">Media</summary>
                <div className="dash__sectionBody">
                  <NavLink
                    className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                    to="/integrations/youtube-audio"
                  >
                    Download YouTube audio
                  </NavLink>
                </div>
              </details>
            </nav>

            <div className="dash__sidebar-footer">
              <div className="dash__user" title={auth.user?.email}>
                <div className="dash__user-name">{displayName}</div>
                <div className="dash__user-email">{auth.user?.email}</div>
              </div>
              <div className="dash__sidebar-actions">
                <button type="button" className="dash__btn" onClick={() => navigate("/profile")}>
                  Profile
                </button>
                <button type="button" className="dash__btn" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            </div>
          </aside>

          <main className="dash__main" aria-label="Tool content">
            <header className="dash__top" data-anim="fade-up">
              <div>
                <h1 className="dash__title">Dashboard</h1>
                <p className="dash__subtitle">Choose a tool on the left.</p>
              </div>
              <div className="dash__sidebar-actions" aria-label="Account navigation">
                <button type="button" className="dash__btn dash__btn--icon" onClick={() => navigate("/profile")}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      fill="currentColor"
                      d="M12 12a4.25 4.25 0 1 0 0-8.5A4.25 4.25 0 0 0 12 12Zm0 2.25c-4.2 0-7.75 2.18-7.75 5.25 0 .83.67 1.5 1.5 1.5h12.5c.83 0 1.5-.67 1.5-1.5 0-3.07-3.55-5.25-7.75-5.25Z"
                    />
                  </svg>
                  Profile
                </button>
              </div>
            </header>

            <div className="dash__content">
              <Routes>
                <Route index element={<Navigate to="image-to-pdf" replace />} />
                <Route path="image-to-pdf" element={<div className="dash__grid"><ImageToPdfPage /></div>} />
                <Route path="html-to-pdf" element={<div className="dash__grid"><HtmlToPdfPage /></div>} />
                <Route
                  path="remove-background"
                  element={
                    <div className="dash__grid">
                      <RemoveBackgroundPage />
                    </div>
                  }
                />
                <Route
                  path="barcode"
                  element={
                    <div className="dash__grid">
                      <BarcodePage />
                    </div>
                  }
                />
                <Route
                  path="webpage-screenshot"
                  element={
                    <div className="dash__grid">
                      <WebpageScreenshotPage />
                    </div>
                  }
                />
                <Route
                  path="youtube-audio"
                  element={
                    <div className="dash__grid">
                      <ComingSoonToolPage title="YouTube → Audio" description="Download audio from a YouTube URL." />
                    </div>
                  }
                />
                <Route
                  path="*"
                  element={
                    <div className="dash__grid">
                      <ComingSoonToolPage
                        title="Feature will be available soon"
                        description="This tool isn't available yet. Pick another option from the left."
                      />
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
