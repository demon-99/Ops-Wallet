import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SceneCanvas = lazy(() => import("../three/SceneCanvas.jsx"));
const ShowcaseScene = lazy(() => import("../three/ShowcaseScene.jsx"));

/**
 * ShowcaseScroll — a pinned section that holds the 3D showcase in place
 * while the user scrolls through N text steps. The active step cross-fades
 * in sync with scroll progress, and the 3D scene's camera orbit is driven
 * by the same progress scalar.
 *
 * Falls back to a stacked static layout for reduced-motion users.
 */
const DEFAULT_STEPS = [
  {
    eyebrow: "01 · Convert",
    title: "Documents, instantly.",
    body: "Any stack of images becomes a clean, searchable PDF. HTML renders to print-ready pages with full control over headers, footers, and breaks.",
  },
  {
    eyebrow: "02 · Capture",
    title: "Pixel-true screenshots.",
    body: "Capture any URL full-page or at a device preset. Retina-sharp, with DOM-accurate rendering — perfect for marketing, QA, and audits.",
  },
  {
    eyebrow: "03 · Generate",
    title: "Barcodes, media, more.",
    body: "Produce barcodes and QR codes in bulk, grab audio from a video URL, and run the other utilities your team reaches for every week.",
  },
];

export default function ShowcaseScroll({ steps = DEFAULT_STEPS }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const stepsRef = useRef([]);
  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [activeStep, setActiveStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useLayoutEffect(() => {
    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    setReduceMotion(rm);
    if (rm) return undefined;

    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return undefined;

    // Total scroll distance = N viewports so each step has breathing room.
    const scrollDistance = section.offsetHeight || window.innerHeight * steps.length;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${section.offsetHeight - window.innerHeight}`,
        pin,
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const idx = Math.min(
            steps.length - 1,
            Math.floor(self.progress * steps.length * 0.999)
          );
          setActiveStep((prev) => (prev === idx ? prev : idx));
        },
      });
    }, section);

    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (reduceMotion) {
    // Accessible static fallback: just list all the steps.
    return (
      <section className="showcase">
        <div className="showcase__static">
          {steps.map((s, i) => (
            <article key={i} className="showcase__staticItem">
              <div className="showcase__eyebrow">{s.eyebrow}</div>
              <h3 className="showcase__title">{s.title}</h3>
              <p className="showcase__body">{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="showcase"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div ref={pinRef} className="showcase__pin">
        <div className="showcase__canvasWrap" aria-hidden="true">
          <Suspense fallback={<div className="showcase__fallback" />}>
            <SceneCanvas camera={{ fov: 42, position: [0, 0.3, 6.2], near: 0.1, far: 50 }}>
              <ShowcaseScene progress={progressRef} mouse={mouseRef} />
            </SceneCanvas>
          </Suspense>
        </div>

        <div className="showcase__content">
          <div className="showcase__progress" aria-hidden="true">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`showcase__dot ${i === activeStep ? "showcase__dot--active" : ""}`}
              />
            ))}
          </div>

          <div className="showcase__steps">
            {steps.map((s, i) => (
              <div
                key={i}
                ref={(el) => (stepsRef.current[i] = el)}
                className={`showcase__step ${i === activeStep ? "showcase__step--active" : ""}`}
                aria-hidden={i === activeStep ? "false" : "true"}
              >
                <div className="showcase__eyebrow">{s.eyebrow}</div>
                <h3 className="showcase__title">{s.title}</h3>
                <p className="showcase__body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
