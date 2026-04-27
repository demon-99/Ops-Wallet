import { useNavigate } from "react-router-dom";
import DigitalBackground from "../components/DigitalBackground.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import logoUrl from "../assets/opswallet-logo.png";

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const displayName =
    [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(" ") || auth.user?.email || "User";

  return (
    <div className="page integration-page profile-page">
      <DigitalBackground />

      <main className="dash__main" aria-label="Profile content">
        <header className="dash__top">
          <div>
            <h1 className="dash__title">Profile</h1>
            <p className="dash__subtitle">Account details and settings.</p>
          </div>

          <div className="dash__sidebar-actions" aria-label="Profile actions">
            <button type="button" className="dash__btn" onClick={() => navigate("/integrations/image-to-pdf")}>
              Dashboard
            </button>
            <button
              type="button"
              className="dash__btn"
              onClick={async () => {
                await auth.logout();
                navigate("/", { replace: true });
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="dash__content">
          <section className="dash__panel" aria-labelledby="profile-card">
            <header className="dash__panel-head">
              <h2 id="profile-card" className="dash__panel-title">
                Signed in as
              </h2>
              <p className="dash__panel-subtitle">
                <span className="dash__code">{displayName}</span> · <span className="dash__code">{auth.user?.email}</span>
              </p>
            </header>

            <div className="dash__panel-body">
              <div className="dash__coming">
                <div className="dash__coming-badge">Coming soon</div>
                <p className="dash__coming-text">Profile editing, password reset, and account settings will live here.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="landing3d__footer">
          <div className="landing3d__container landing3d__footerRow">
            <div className="landing3d__footerBrand">
              <img className="brand__logo" src={logoUrl} alt="OpsWallet" />
              <span>© {new Date().getFullYear()} OpsWallet</span>
            </div>
            <div className="landing3d__footerLinks">
              <a href="#features">Features</a>
              <a href="#integrations">Integrations</a>
              <a href="#metrics">Metrics</a>
            </div>
          </div>
      </footer>
    </div>
    
  );
}

