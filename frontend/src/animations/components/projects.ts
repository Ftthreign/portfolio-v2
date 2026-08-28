import { getGSAP, isClient } from "../utils/gsap-setup";
import { EASE_PRESETS, DURATIONS, SELECTORS } from "../config/constants";

export function initFeaturedProjectsAnimations(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap, ScrollTrigger } = getGSAP();
  if (!gsap) return;

  const section = document.querySelector(SELECTORS.projects.section) as HTMLElement;
  if (!section) return;

  const cleanups: Array<() => void> = [];

  // 1. Header Stagger Entrance Reveal on Scroll
  const headerElements = section.querySelectorAll<HTMLElement>(".gsap-reveal");
  if (headerElements.length > 0 && ScrollTrigger) {
    gsap.fromTo(
      headerElements,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: DURATIONS.slow,
        stagger: 0.12,
        ease: EASE_PRESETS.smoothOut,
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
      }
    );
  }

  // 2. Bento Cards Staggered ScrollTrigger Entrance
  const cards = section.querySelectorAll<HTMLElement>(".project-card-anim");
  if (cards.length > 0 && ScrollTrigger) {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 55, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: DURATIONS.entrance,
        stagger: 0.15,
        ease: EASE_PRESETS.springGentle,
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      }
    );
  }

  // 3. Desktop Interactive 3D Mouse Parallax Tilt
  if (window.innerWidth >= 1024) {
    const cardElements = section.querySelectorAll<HTMLElement>(".project-card-tilt");
    cardElements.forEach((card) => {
      const img = card.querySelector<HTMLElement>(".project-tilt-target");
      if (!img) return;

      const onMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(img, {
          rotateY: normX * 10,
          rotateX: -normY * 10,
          scale: 1.05,
          duration: DURATIONS.fast,
          ease: EASE_PRESETS.powerOut,
          transformPerspective: 1000,
        });
      };

      const onMouseLeave = () => {
        gsap.to(img, {
          rotateY: 0,
          rotateX: 0,
          scale: 1,
          duration: DURATIONS.medium,
          ease: EASE_PRESETS.powerOut,
        });
      };

      card.addEventListener("mousemove", onMouseMove);
      card.addEventListener("mouseleave", onMouseLeave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", onMouseMove);
        card.removeEventListener("mouseleave", onMouseLeave);
      });
    });
  }

  // 4. CTA Arrow Micro-Interaction Hover
  const ctaButtons = section.querySelectorAll<HTMLElement>(".project-cta-btn");
  ctaButtons.forEach((btn) => {
    const arrow = btn.querySelector<HTMLElement>(".project-cta-arrow");
    if (!arrow) return;

    const onEnter = () => {
      gsap.to(arrow, {
        x: 6,
        duration: DURATIONS.fast,
        ease: EASE_PRESETS.powerOut,
      });
    };

    const onLeave = () => {
      gsap.to(arrow, {
        x: 0,
        duration: DURATIONS.fast,
        ease: EASE_PRESETS.powerOut,
      });
    };

    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
