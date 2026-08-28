import { getGSAP, isClient } from "../utils/gsap-setup";

export function initTechMarquee(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap, ScrollTrigger } = getGSAP();
  if (!gsap || !ScrollTrigger) return;

  const marqueeContainer = document.querySelector(
    ".tech-marquee-container",
  ) as HTMLElement;
  const textPath = document.querySelector(
    ".tech-marquee-textpath",
  ) as SVGTextPathElement | null;
  const trackWrapper = document.querySelector(
    ".tech-marquee-track",
  ) as HTMLElement | null;

  if (!marqueeContainer) return;

  const cleanups: Array<() => void> = [];

  if (textPath) {
    let offset = 0;
    let baseSpeed = 0.08;
    let velocityBoost = 0;
    let targetHoverMult = 1;

    const ticker = gsap.ticker.add(() => {
      velocityBoost *= 0.92;
      const currentSpeed = (baseSpeed + velocityBoost) * targetHoverMult;
      offset -= currentSpeed;

      if (offset <= -100) {
        offset += 100;
      } else if (offset > 0) {
        offset -= 100;
      }

      textPath.setAttribute("startOffset", `${offset}%`);
    });

    const st = ScrollTrigger.create({
      trigger: marqueeContainer,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const vel = self.getVelocity();
        if (Math.abs(vel) > 10) {
          velocityBoost = vel * 0.0004;
        }
      },
    });

    const onEnter = () => {
      targetHoverMult = 0.2;
    };
    const onLeave = () => {
      targetHoverMult = 1.0;
    };

    marqueeContainer.addEventListener("mouseenter", onEnter);
    marqueeContainer.addEventListener("mouseleave", onLeave);

    cleanups.push(() => {
      gsap.ticker.remove(ticker);
      st.kill();
      marqueeContainer.removeEventListener("mouseenter", onEnter);
      marqueeContainer.removeEventListener("mouseleave", onLeave);
    });
  }

  // Mobile HTML Track Backup Ticker with ScrollTrigger Velocity Sync
  if (trackWrapper) {
    const tween = gsap.to(trackWrapper, {
      xPercent: -50,
      repeat: -1,
      duration: 22,
      ease: "none",
    });

    const st = ScrollTrigger.create({
      trigger: marqueeContainer,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const vel = self.getVelocity();
        if (Math.abs(vel) > 10) {
          const speedFactor = 1 + Math.abs(vel) * 0.0015;
          gsap.to(tween, {
            timeScale: vel < 0 ? -speedFactor : speedFactor,
            duration: 0.2,
            overwrite: "auto",
          });
        }
      },
    });

    const onEnter = () => {
      gsap.to(tween, { timeScale: 0.2, duration: 0.4, overwrite: "auto" });
    };

    const onLeave = () => {
      gsap.to(tween, { timeScale: 1, duration: 0.4, overwrite: "auto" });
    };

    marqueeContainer.addEventListener("mouseenter", onEnter);
    marqueeContainer.addEventListener("mouseleave", onLeave);

    cleanups.push(() => {
      tween.kill();
      st.kill();
      marqueeContainer.removeEventListener("mouseenter", onEnter);
      marqueeContainer.removeEventListener("mouseleave", onLeave);
    });
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
