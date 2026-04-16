import { useRef } from "react";
import { useStarfield } from "../hooks/useStarfield.js";
import Apple3DBackground from "./Apple3DBackground.jsx";

export default function DigitalBackground() {
  const starsRef = useRef(null);
  useStarfield(starsRef);

  return (
    <section className="hero" aria-hidden="true">
      <div className="hero__bg"></div>
      <Apple3DBackground />
      <div className="hero__glow"></div>
      <div className="hero__grid"></div>
      <canvas className="hero__stars" ref={starsRef} aria-hidden="true"></canvas>
    </section>
  );
}
