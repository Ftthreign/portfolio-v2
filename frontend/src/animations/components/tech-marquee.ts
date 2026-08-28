import { getGSAP, isClient } from "../utils/gsap-setup";

export function initTechMarquee(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap, ScrollTrigger } = getGSAP();
  if (!gsap || !ScrollTrigger) return;

  const marqueeContainer = document.querySelector(
    ".tech-marquee-container",
  ) as HTMLElement;
  const techTrack = document.querySelector(
    ".tech-marquee-track",
  ) as HTMLElement | null;
  const softTrack = document.querySelector(
    ".soft-marquee-track",
  ) as HTMLElement | null;

  if (!marqueeContainer) return;

  const cleanups: Array<() => void> = [];

  // Track 1: Tech Stack (Scrolls Left)
  let techTween: gsap.core.Tween | null = null;
  if (techTrack) {
    techTween = gsap.to(techTrack, {
      xPercent: -50,
      repeat: -1,
      duration: 26,
      ease: "none",
    });
  }

  // Track 2: Soft Skills (Scrolls Right / Opposite Direction for Dynamic Crossing Effect)
  let softTween: gsap.core.Tween | null = null;
  if (softTrack) {
    gsap.set(softTrack, { xPercent: -50 });
    softTween = gsap.to(softTrack, {
      xPercent: 0,
      repeat: -1,
      duration: 22,
      ease: "none",
    });
  }

  const st = ScrollTrigger.create({
    trigger: marqueeContainer,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const vel = self.getVelocity();
      if (Math.abs(vel) > 10) {
        const speedFactor = 1 + Math.abs(vel) * 0.0012;
        if (techTween) {
          gsap.to(techTween, {
            timeScale: vel < 0 ? -speedFactor : speedFactor,
            duration: 0.25,
            overwrite: "auto",
          });
        }
        if (softTween) {
          gsap.to(softTween, {
            timeScale: vel < 0 ? speedFactor : -speedFactor,
            duration: 0.25,
            overwrite: "auto",
          });
        }
      }
    },
  });

  const onEnter = () => {
    if (techTween) gsap.to(techTween, { timeScale: 0.2, duration: 0.4, overwrite: "auto" });
    if (softTween) gsap.to(softTween, { timeScale: 0.2, duration: 0.4, overwrite: "auto" });
  };

  const onLeave = () => {
    if (techTween) gsap.to(techTween, { timeScale: 1, duration: 0.4, overwrite: "auto" });
    if (softTween) gsap.to(softTween, { timeScale: 1, duration: 0.4, overwrite: "auto" });
  };

  marqueeContainer.addEventListener("mouseenter", onEnter);
  marqueeContainer.addEventListener("mouseleave", onLeave);

  cleanups.push(() => {
    if (techTween) techTween.kill();
    if (softTween) softTween.kill();
    st.kill();
    marqueeContainer.removeEventListener("mouseenter", onEnter);
    marqueeContainer.removeEventListener("mouseleave", onLeave);
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
