import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "../assets/opswallet-logo.png";
import Hero3D from "../components/Hero3D.jsx";
import ShowcaseScroll from "../components/ShowcaseScroll.jsx";
import { useSmoothScroll } from "../hooks/useSmoothScroll.js";
import { useScrollAnimations } from "../hooks/useScrollAnimations.js";

function useReducedMotion() {
  return useMemo(() => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false, []);
}

const FEATURES = [
  {
    title: "Convert",
    description: "Images to PDF, HTML to PDF, and a dozen other one-click conversions that just work.",
    accent: "var(--a)",
  },
  {
    title: "Capture",
    description: "Full-page website screenshots and barcode scans at production quality.",
    accent: "var(--b)",
  },
  {
    title: "Generate",
    description: "Produce documents and media on demand from clean, simple inputs.",
    accent: "var(--c)",
  },
];

const INTEGRATIONS = [
  { title: "Image → PDF", blurb: "Stitch any number of images into a single searchable PDF.", to: "/integrations/image-to-pdf" },
  { title: "HTML → PDF", blurb: "Render rich HTML to print-ready PDF with headers, footers, and page breaks.", to: "/integrations/html-to-pdf" },
  { title: "Remove background", blurb: "Cut out backgrounds with accurate edges — people, products, anything.", to: "/integrations/remove-background" },
  { title: "Barcode", blurb: "Generate and decode barcodes, QR codes, and data matrices.", to: "/integrations/barcode" },
  { title: "Webpage screenshot", blurb: "Full-page, device-sized captures of any URL. Retina and mobile presets.", to: "/integrations/webpage-screenshot" },
  { title: "Media tools", blurb: "Download YouTube audio and more, directly from a URL.", to: "/integrations/youtube-audio" },
];

const STATS = [
  { label: "Uptime", value: "99.99%" },
  { label: "Median latency", value: "~120ms" },
  { label: "Integrations", value: "12+" },
  { label: "Regions", value: "Global" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const rootRef = useRef(null);

  useSmoothScroll();
  useScrollAnimations(rootRef);

  // Pin the top chrome with a slight backdrop on scroll.
  useEffect(() => {
    const onScroll = () => {
      const top = document.querySelector(".landing3d__top");
      if (!top) return;
      top.classList.toggle("landing3d__top--scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={rootRef} className="landing3d">
      <header className="landing3d__top">
        <div
          className="landing3d__brand"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? navigate("/") : null)}
        >
          <img className="brand__logo" src={logoUrl} alt="OpsWallet" />
        </div>
        <nav className="landing3d__nav" aria-label="Primary">
          <a className="landing3d__navLink" href="#features">Features</a>
          <a className="landing3d__navLink" href="#integrations">Integrations</a>
          <a className="landing3d__navLink" href="#metrics">Metrics</a>
        </nav>
        <div className="landing3d__actions">
          <button className="dash__btn" type="button" onClick={() => navigate("/auth")}>
            Sign in
          </button>
          <button className="primary" type="button" onClick={() => navigate("/auth#signup")}>
            Create account
            <span className="primary__shine" aria-hidden="true" />
          </button>
        </div>
      </header>

      <Hero3D
        eyebrow="OpsWallet · Operations toolkit"
        title={
          <>
            Convert, capture, and generate<br />
            <span className="hero3d__titleAccent">in one place.</span>
          </>
        }
        subtitle="A single workspace for the document, image, and web tools your team reaches for every day — fast, accurate, and built for production."
        actions={
          <>
            <button className="primary" type="button" onClick={() => navigate("/auth")}>
              Open app
              <span className="primary__shine" aria-hidden="true" />
            </button>
            <button className="dash__btn" type="button" onClick={() => navigate("/auth#signup")}>
              Create account
            </button>
          </>
        }
      />

      <section id="features" className="landing3d__section landing3d__section--features">
        <div className="landing3d__container">
          <header className="landing3d__sectionHead" data-anim="fade-up">
            <div className="landing3d__eyebrow">What it does</div>
            <h2 className="landing3d__sectionTitle">Three things, done right.</h2>
            <p className="landing3d__sectionSubtitle">
              Each tool is a direct, focused utility — no bloat, no wizard-fatigue.
            </p>
          </header>

          <div className="landing3d__features">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="landing3d__feature"
                data-anim="fade-up"
                data-anim-delay={i * 0.08}
                style={{ "--feature-accent": f.accent }}
              >
                <div className="landing3d__featureOrb" aria-hidden="true" />
                <h3 className="landing3d__featureTitle">{f.title}</h3>
                <p className="landing3d__featureBody">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ShowcaseScroll />

      <section id="integrations" className="landing3d__section landing3d__section--integrations">
        <div className="landing3d__container">
          <header className="landing3d__sectionHead" data-anim="fade-up">
            <div className="landing3d__eyebrow">Integrations</div>
            <h2 className="landing3d__sectionTitle">All the tools, one dashboard.</h2>
            <p className="landing3d__sectionSubtitle">
              Click anything to jump straight to it after signing in.
            </p>
          </header>

          <div className="landing3d__integrations">
            {INTEGRATIONS.map((it, i) => {
              const onPointer = (e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                const gx = ((e.clientX - rect.left) / rect.width) * 100;
                const gy = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty("--gx", `${gx}%`);
                el.style.setProperty("--gy", `${gy}%`);
                // Tilt toward the cursor; CSS reads --tx/--ty for the transform.
                const tx = (gx - 50) / 50;
                const ty = (gy - 50) / 50;
                el.style.setProperty("--tx", `${tx}`);
                el.style.setProperty("--ty", `${ty}`);
              };
              const onLeave = (e) => {
                const el = e.currentTarget;
                el.style.setProperty("--tx", "0");
                el.style.setProperty("--ty", "0");
              };
              return (
                <button
                  key={it.title}
                  type="button"
                  className="landing3d__integration"
                  data-anim="fade-up"
                  data-anim-delay={(i % 3) * 0.08}
                  onPointerMove={onPointer}
                  onPointerLeave={onLeave}
                  onClick={() => navigate(it.to)}
                >
                  <div className="landing3d__integrationGlow" aria-hidden="true" />
                  <div className="landing3d__integrationSheen" aria-hidden="true" />
                  <div className="landing3d__integrationTitle">{it.title}</div>
                  <div className="landing3d__integrationBody">{it.blurb}</div>
                  <div className="landing3d__integrationArrow" aria-hidden="true">→</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="metrics" className="landing3d__section landing3d__section--metrics">
        <div className="landing3d__container">
          <div className="landing3d__metrics" data-anim="fade-up">
            {STATS.map((s) => (
              <div key={s.label} className="landing3d__metric">
                <div className="landing3d__metricValue">{s.value}</div>
                <div className="landing3d__metricLabel">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing3d__section landing3d__section--cta">
        <div className="landing3d__container">
          <div className="landing3d__cta" data-anim="scale">
            <h2 className="landing3d__ctaTitle">Ready to start?</h2>
            <p className="landing3d__ctaBody">
              Create a free account and open the dashboard in under a minute.
              {reducedMotion ? "" : " No animated marketing. Just the tools."}
            </p>
            <div className="landing3d__ctaActions">
              <button className="primary" type="button" onClick={() => navigate("/auth#signup")}>
                Create account
                <span className="primary__shine" aria-hidden="true" />
              </button>
              <button className="dash__btn" type="button" onClick={() => navigate("/auth")}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </section>

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
