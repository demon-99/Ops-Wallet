import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// useLayoutEffect is only available in the browser; in SSR / during tests we
// fall back to useEffect so React doesn't warn.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Animate every element matching `selector` inside `rootRef.current`.
 *
 * Entrance-only semantics:
 *   - Elements already visible in the viewport at mount play immediately
 *     (no ScrollTrigger involved — eliminates timing races).
 *   - Elements below the fold wait for a one-shot ScrollTrigger, so they
 *     never reverse on scroll-up and can't get stuck invisible.
 *
 * Skipped entirely when the user prefers reduced motion.
 *
 * Each element can override behavior with data attributes:
 *   data-anim="fade-up" (default) | "fade" | "scale" | "slide-left" | "slide-right"
 *   data-anim-delay="0.1"
 */
export function useScrollAnimations(rootRef, selector = "[data-anim]", deps = []) {
  useIsoLayoutEffect(() => {
    const root = rootRef?.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) {
      // Make sure nothing is stuck invisible if we bail out.
      root.querySelectorAll(selector).forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray(selector, root);

      els.forEach((el) => {
        const kind = el.dataset.anim || "fade-up";
        const delay = Number(el.dataset.animDelay || 0);

        const from =
          kind === "fade"
            ? { opacity: 0 }
            : kind === "scale"
            ? { opacity: 0, scale: 0.92 }
            : kind === "slide-left"
            ? { opacity: 0, x: -60 }
            : kind === "slide-right"
            ? { opacity: 0, x: 60 }
            : { opacity: 0, y: 40 };

        const to = {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.9,
          delay,
          ease: "power3.out",
        };

        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const alreadyInView = rect.top < viewportHeight * 0.95 && rect.bottom > 0;

        if (alreadyInView) {
          gsap.fromTo(el, from, to);
          return;
        }

        gsap.fromTo(el, from, {
          ...to,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        });
      });
    }, root);

    const rid = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(rid);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, selector, ...deps]);
}
