import { isClient, gsap, ScrollTrigger } from './utils/gsap-setup';
import { initCustomCursor } from './core/cursor';
import { initThemeToggle } from './core/theme';
import { initScrollReveals } from './core/reveals';
import { initHeroInteractiveAnimations } from './components/hero';
import { initFullScreenNavbar } from './components/navbar';
import { initTechMarquee } from './components/tech-marquee';
import { initProcessSticky } from './components/process-sticky';

export {
  gsap,
  ScrollTrigger,
  initCustomCursor,
  initThemeToggle,
  initScrollReveals,
  initHeroInteractiveAnimations,
  initFullScreenNavbar,
  initTechMarquee,
  initProcessSticky,
};

/**
 * Master Application Animation Engine Initializer
 * Binds all modular animation controllers safely with lifecycle cleanup handlers
 */
export function initAppAnimations(): (() => void) | undefined {
  if (!isClient()) return;

  const cleanups: Array<(() => void) | undefined> = [
    initThemeToggle(),
    initCustomCursor(),
    initFullScreenNavbar(),
    initHeroInteractiveAnimations(),
    initTechMarquee(),
    initProcessSticky(),
  ];

  initScrollReveals();

  return () => {
    cleanups.forEach((fn) => fn && fn());
  };
}
