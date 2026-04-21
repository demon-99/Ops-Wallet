import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisSingleton = null;
let rafId = 0;
let refCount = 0;

/**
 * Boots Lenis for smooth scrolling and pipes its RAF into ScrollTrigger.
 * Reference-counted so multiple pages can call it safely; only the first
 * caller creates the instance, and it's torn down when the last caller
 * unmounts.
 *
 * Disabled for prefers-reduced-motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) return undefined;

    refCount += 1;

    if (!lenisSingleton) {
      lenisSingleton = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
      });

      lenisSingleton.on("scroll", ScrollTrigger.update);

      const raf = (time) => {
        lenisSingleton?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      refCount -= 1;
      if (refCount <= 0) {
        cancelAnimationFrame(rafId);
        lenisSingleton?.destroy();
        lenisSingleton = null;
        refCount = 0;
      }
    };
  }, []);
}

export function getLenis() {
  return lenisSingleton;
}
