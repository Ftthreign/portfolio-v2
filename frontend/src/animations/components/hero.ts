import { getGSAP, isClient } from "../utils/gsap-setup";
import {
  EASE_PRESETS,
  DURATIONS,
  SELECTORS,
  ROLES_LIST,
} from "../config/constants";

export function initHeroInteractiveAnimations(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap } = getGSAP();
  if (!gsap) return;

  const heroSection = document.querySelector(
    SELECTORS.hero.section,
  ) as HTMLElement;
  const heroPortrait = document.querySelector(
    SELECTORS.hero.portrait,
  ) as HTMLElement;
  const ambientGlow = document.querySelector(
    SELECTORS.hero.glow,
  ) as HTMLElement;
  const floatBadges = document.querySelectorAll(SELECTORS.hero.badges);
  const animItems = document.querySelectorAll(SELECTORS.hero.animItems);

  if (!heroSection) return;

  const heroTitle = document.querySelector(
    SELECTORS.hero.titleSplit,
  ) as HTMLElement;
  if (heroTitle && !heroTitle.dataset.splitDone) {
    heroTitle.dataset.splitDone = "true";
    const rawText = heroTitle.innerText;
    heroTitle.innerHTML = rawText
      .split("")
      .map(
        (char) =>
          `<span class="char-span inline-block">${char === " " ? "&nbsp;" : char}</span>`,
      )
      .join("");

    const charSpans = heroTitle.querySelectorAll(".char-span");
    gsap.fromTo(
      charSpans,
      { opacity: 0, y: 40, rotateX: -60 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: DURATIONS.slow,
        stagger: 0.03,
        ease: EASE_PRESETS.springBounce,
        delay: 0.2,
      },
    );
  }

  const rotatingTarget = document.querySelector(
    SELECTORS.hero.roleTarget,
  ) as HTMLElement;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  if (rotatingTarget && !rotatingTarget.dataset.rotatingActive) {
    rotatingTarget.dataset.rotatingActive = "true";
    let roleIndex = 0;

    intervalId = setInterval(() => {
      roleIndex = (roleIndex + 1) % ROLES_LIST.length;
      const nextRole = ROLES_LIST[roleIndex];

      gsap.to(rotatingTarget, {
        y: -40,
        opacity: 0,
        filter: "blur(8px)",
        duration: DURATIONS.normal,
        ease: EASE_PRESETS.powerIn,
        onComplete: () => {
          rotatingTarget.innerText = nextRole;
          gsap.set(rotatingTarget, { y: 40, opacity: 0, filter: "blur(8px)" });
          gsap.to(rotatingTarget, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: DURATIONS.medium,
            ease: EASE_PRESETS.springGentle,
          });
        },
      });
    }, DURATIONS.carouselInterval);
  }

  if (animItems.length > 0) {
    gsap.fromTo(
      animItems,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: DURATIONS.entrance,
        stagger: 0.12,
        ease: EASE_PRESETS.smoothOut,
      },
    );
  }

  // 4. Continuous Floating Sine-Wave Loop on Badges
  if (floatBadges.length > 0) {
    floatBadges.forEach((badge, i) => {
      gsap.to(badge, {
        y: i % 2 === 0 ? -7 : 7,
        duration: 2.6 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: EASE_PRESETS.sineInOut,
      });
    });
  }

  // 5. 3D Mouse Parallax Tilt & Ambient Glow Mouse Tracking (Desktop only)
  const cleanups: Array<() => void> = [];

  if (window.innerWidth >= 1024) {
    const onMouseMove = (e: MouseEvent) => {
      const rect = heroSection.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      if (heroPortrait) {
        gsap.to(heroPortrait, {
          rotateY: normX * 12,
          rotateX: -normY * 10,
          x: normX * 20,
          y: normY * 15,
          duration: DURATIONS.medium,
          ease: EASE_PRESETS.powerOut,
          transformPerspective: 1000,
        });
      }

      if (ambientGlow) {
        gsap.to(ambientGlow, {
          x: normX * 45,
          y: normY * 35,
          duration: DURATIONS.lag,
          ease: EASE_PRESETS.softLag,
        });
      }
    };

    const onMouseLeave = () => {
      if (heroPortrait) {
        gsap.to(heroPortrait, {
          rotateY: 0,
          rotateX: 0,
          x: 0,
          y: 0,
          duration: DURATIONS.slow,
          ease: EASE_PRESETS.powerOut,
        });
      }
      if (ambientGlow) {
        gsap.to(ambientGlow, {
          x: 0,
          y: 0,
          duration: 1.2,
          ease: EASE_PRESETS.powerOut,
        });
      }
    };

    heroSection.addEventListener("mousemove", onMouseMove);
    heroSection.addEventListener("mouseleave", onMouseLeave);
    cleanups.push(() => {
      heroSection.removeEventListener("mousemove", onMouseMove);
      heroSection.removeEventListener("mouseleave", onMouseLeave);
    });
  }

  // 6. ScrollTrigger Hero Scale-Down on Scroll
  const heroContent = document.querySelector(
    SELECTORS.hero.content,
  ) as HTMLElement;
  if (heroContent) {
    gsap.to(heroContent, {
      scale: 0.94,
      opacity: 0.65,
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
    cleanups.forEach((fn) => fn());
  };
}
