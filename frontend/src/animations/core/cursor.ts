import { getGSAP, isClient } from '../utils/gsap-setup';
import { EASE_PRESETS, SELECTORS } from '../config/constants';

export function initCustomCursor(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap } = getGSAP();
  if (!gsap) return;

  const cursor = document.querySelector(SELECTORS.cursor.point) as HTMLElement;
  const follower = document.querySelector(SELECTORS.cursor.follower) as HTMLElement;

  if (!cursor || !follower) return;

  let mouseX = 0;
  let mouseY = 0;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.to(cursor, {
      x: mouseX,
      y: mouseY,
      duration: 0.1,
      ease: EASE_PRESETS.powerOut,
    });

    gsap.to(follower, {
      x: mouseX,
      y: mouseY,
      duration: 0.3,
      ease: EASE_PRESETS.powerOut,
    });
  };

  window.addEventListener('mousemove', onMouseMove);

  const interactiveElements = document.querySelectorAll(SELECTORS.cursor.interactive);
  const cleanups: Array<() => void> = [];

  interactiveElements.forEach((el) => {
    const onEnter = () => document.body.classList.add('cursor-hover');
    const onLeave = () => {
      document.body.classList.remove('cursor-hover');
      gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: EASE_PRESETS.powerOut });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    });

    if (el.classList.contains('magnetic')) {
      const onMagneticMove = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = (el as HTMLElement).getBoundingClientRect();
        const elX = mouseEvent.clientX - rect.left - rect.width / 2;
        const elY = mouseEvent.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: elX * 0.3,
          y: elY * 0.3,
          duration: 0.2,
          ease: EASE_PRESETS.powerOut,
        });
      };

      el.addEventListener('mousemove', onMagneticMove);
      cleanups.push(() => el.removeEventListener('mousemove', onMagneticMove));
    }
  });

  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    cleanups.forEach((fn) => fn());
  };
}
