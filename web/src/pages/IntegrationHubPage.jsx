import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import DigitalBackground from "../components/DigitalBackground.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import ImageToPdfPage from "./tools/ImageToPdfPage.jsx";
import RemoveBackgroundPage from "./tools/RemoveBackgroundPage.jsx";
import BarcodePage from "./tools/BarcodePage.jsx";
import WebpageScreenshotPage from "./tools/WebpageScreenshotPage.jsx";
import ComingSoonToolPage from "./tools/ComingSoonToolPage.jsx";

export default function IntegrationHubPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const displayName = [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(" ") || auth.user?.email || "User";

  const onLogout = async () => {
    await auth.logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <a className="skip-link" href="#dash-main">
        Skip to content
      </a>

      <div className="page integration-page">
        <DigitalBackground />

        <div className="dash" id="dash-main">
          <aside className="dash__sidebar" aria-label="Integrations navigation">
            <div className="dash__brand">
              <div className="brand__mark" aria-hidden="true"></div>
              <div className="dash__brand-text">
                <div className="dash__brand-title">OpsWallet</div>
                <div className="dash__brand-subtitle">Integrations</div>
              </div>
            </div>

            <nav className="dash__nav">
              <NavLink
                className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                to="/integrations/image-to-pdf"
              >
                Image to PDF
              </NavLink>
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
              <NavLink
                className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                to="/integrations/webpage-screenshot"
              >
                Webpage screenshot
              </NavLink>
              <NavLink
                className={({ isActive }) => `dash__link ${isActive ? "dash__link--active" : ""}`}
                to="/integrations/youtube-audio"
              >
                Download YouTube audio
              </NavLink>
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
            <header className="dash__top">
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
