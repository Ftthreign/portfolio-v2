import { getGSAP, isClient } from '../utils/gsap-setup';
import { EASE_PRESETS, SELECTORS } from '../config/constants';

export function initScrollReveals(): void {
  if (!isClient()) return;
  const { gsap } = getGSAP();
  if (!gsap) return;

  const reveals = document.querySelectorAll(SELECTORS.reveals.single);
  reveals.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: EASE_PRESETS.smoothOut,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  const staggers = document.querySelectorAll(SELECTORS.reveals.staggerParent);
  staggers.forEach((parent) => {
    const children = parent.querySelectorAll(SELECTORS.reveals.staggerChild);
    if (children.length > 0) {
      gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: EASE_PRESETS.smoothOut,
          scrollTrigger: {
            trigger: parent,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  });
}
