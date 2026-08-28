import { getGSAP, isClient } from "../utils/gsap-setup";
import { EASE_PRESETS } from "../config/constants";

export function initContainerScrollAnimations(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap, ScrollTrigger } = getGSAP();
  if (!gsap || !ScrollTrigger) return;

  const wrappers = document.querySelectorAll<HTMLElement>(".container-scroll-wrapper");
  if (!wrappers.length) return;

  const cleanups: Array<() => void> = [];

  wrappers.forEach((wrapper) => {
    const stickyStage = wrapper.querySelector<HTMLElement>(".container-scroll-sticky");
    const card = wrapper.querySelector<HTMLElement>(".container-scroll-card");
    const header = wrapper.querySelector<HTMLElement>(".container-scroll-header");

    if (!card) return;

    // Set initial 3D transform properties
    gsap.set(card, {
      rotateX: 25,
      scale: 0.82,
      transformPerspective: 1000,
      transformOrigin: "center top",
      force3D: true,
    });

    if (header) {
      gsap.set(header, {
        y: 0,
        force3D: true,
      });
    }

    // Create ScrollTrigger timeline for 3D unfold
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: "top top+=80px",
        end: "bottom center",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    tl.to(
      card,
      {
        rotateX: 0,
        scale: 1,
        ease: EASE_PRESETS.smoothOut,
        force3D: true,
      },
      0
    );

    if (header) {
      tl.to(
        header,
        {
          y: -70,
          scale: 0.96,
          ease: EASE_PRESETS.smoothOut,
          force3D: true,
        },
        0
      );
    }

    if (tl.scrollTrigger) {
      cleanups.push(() => tl.scrollTrigger?.kill());
    }
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
