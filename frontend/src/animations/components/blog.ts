import { getGSAP, isClient } from "../utils/gsap-setup";
import { EASE_PRESETS, DURATIONS, SELECTORS } from "../config/constants";

export function initBlogRowAnimations(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap, ScrollTrigger } = getGSAP();
  if (!gsap) return;

  const section = document.querySelector(SELECTORS.blog.section) as HTMLElement;
  if (!section) return;

  const cleanups: Array<() => void> = [];

  // 1. ScrollTrigger Reveal for Header and Rows
  const rows = section.querySelectorAll<HTMLElement>(SELECTORS.blog.row);
  if (rows.length > 0 && ScrollTrigger) {
    gsap.fromTo(
      rows,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: DURATIONS.slow,
        stagger: 0.12,
        ease: EASE_PRESETS.smoothOut,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      }
    );
  }

  // 2. Desktop Floating Image Preview Cursor Reveal
  if (window.innerWidth >= 1024) {
    const previewModal = section.querySelector<HTMLElement>(SELECTORS.blog.previewModal);
    const previewImg = section.querySelector<HTMLImageElement>(SELECTORS.blog.previewImg);

    if (previewModal && previewImg && rows.length > 0) {
      // Set initial state
      gsap.set(previewModal, {
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        scale: 0.85,
        xPercent: -50,
        yPercent: -50,
      });

      const xTo = gsap.quickTo(previewModal, "x", { duration: 0.35, ease: EASE_PRESETS.powerOut });
      const yTo = gsap.quickTo(previewModal, "y", { duration: 0.35, ease: EASE_PRESETS.powerOut });

      const onMouseMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY + 20);
      };

      window.addEventListener("mousemove", onMouseMove);
      cleanups.push(() => window.removeEventListener("mousemove", onMouseMove));

      rows.forEach((row) => {
        const coverUrl = row.dataset.coverUrl;
        const titleText = row.querySelector<HTMLElement>(".blog-row-title");
        const arrow = row.querySelector<HTMLElement>(".blog-row-arrow");

        const onEnter = (e: MouseEvent) => {
          if (coverUrl && previewImg.src !== coverUrl) {
            previewImg.src = coverUrl;
          }
          xTo(e.clientX);
          yTo(e.clientY + 20);

          gsap.to(previewModal, {
            opacity: 1,
            scale: 1,
            duration: DURATIONS.fast,
            ease: EASE_PRESETS.springGentle,
          });

          if (titleText) {
            gsap.to(titleText, {
              x: 12,
              duration: DURATIONS.fast,
              ease: EASE_PRESETS.powerOut,
            });
          }

          if (arrow) {
            gsap.to(arrow, {
              x: 8,
              duration: DURATIONS.fast,
              ease: EASE_PRESETS.powerOut,
            });
          }
        };

        const onLeave = () => {
          gsap.to(previewModal, {
            opacity: 0,
            scale: 0.85,
            duration: DURATIONS.fast,
            ease: EASE_PRESETS.powerOut,
          });

          if (titleText) {
            gsap.to(titleText, {
              x: 0,
              duration: DURATIONS.fast,
              ease: EASE_PRESETS.powerOut,
            });
          }

          if (arrow) {
            gsap.to(arrow, {
              x: 0,
              duration: DURATIONS.fast,
              ease: EASE_PRESETS.powerOut,
            });
          }
        };

        row.addEventListener("mouseenter", onEnter);
        row.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          row.removeEventListener("mouseenter", onEnter);
          row.removeEventListener("mouseleave", onLeave);
        });
      });
    }
  }

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
