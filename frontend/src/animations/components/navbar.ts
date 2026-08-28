import { getGSAP, isClient } from '../utils/gsap-setup';
import { EASE_PRESETS, DURATIONS, SELECTORS } from '../config/constants';

export function initFullScreenNavbar(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap } = getGSAP();
  if (!gsap) return;

  const menuBtn = document.querySelector(SELECTORS.navbar.btn) as HTMLElement;
  const menuOverlay = document.querySelector(SELECTORS.navbar.overlay) as HTMLElement;
  const menuLinks = document.querySelectorAll(SELECTORS.navbar.links);
  const menuInfoItems = document.querySelectorAll(SELECTORS.navbar.infoItems);
  const lineTop = document.querySelector(SELECTORS.navbar.lineTop) as HTMLElement;
  const lineBottom = document.querySelector(SELECTORS.navbar.lineBottom) as HTMLElement;
  const menuLabel = document.querySelector(SELECTORS.navbar.label) as HTMLElement;

  if (!menuBtn || !menuOverlay) return;

  let isOpen = false;

  const getButtonCenter = () => {
    const rect = menuBtn.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const openMenu = () => {
    isOpen = true;
    document.body.style.overflow = 'hidden';
    const { x, y } = getButtonCenter();

    gsap.set(menuOverlay, { clipPath: `circle(0px at ${x}px ${y}px)` });

    gsap.to(lineTop, { rotate: 45, y: 3.5, duration: DURATIONS.fast + 0.1, ease: EASE_PRESETS.powerOut });
    gsap.to(lineBottom, { rotate: -45, y: -3.5, duration: DURATIONS.fast + 0.1, ease: EASE_PRESETS.powerOut });
    if (menuLabel) menuLabel.innerText = 'Close';

    gsap.to(menuOverlay, {
      clipPath: `circle(150vmax at ${x}px ${y}px)`,
      pointerEvents: 'auto',
      duration: 0.7,
      ease: EASE_PRESETS.clipReveal,
    });

    if (menuLinks.length > 0) {
      gsap.fromTo(
        menuLinks,
        { opacity: 0, y: 40, rotateX: -15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.07,
          delay: 0.25,
          ease: EASE_PRESETS.smoothOut,
        }
      );
    }

    if (menuInfoItems.length > 0) {
      gsap.fromTo(
        menuInfoItems,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: DURATIONS.medium,
          stagger: 0.08,
          delay: 0.4,
          ease: EASE_PRESETS.smoothOut,
        }
      );
    }
  };

  const closeMenu = () => {
    isOpen = false;
    document.body.style.overflow = '';
    const { x, y } = getButtonCenter();

    gsap.to(lineTop, { rotate: 0, y: 0, duration: DURATIONS.fast + 0.1, ease: EASE_PRESETS.powerOut });
    gsap.to(lineBottom, { rotate: 0, y: 0, duration: DURATIONS.fast + 0.1, ease: EASE_PRESETS.powerOut });
    if (menuLabel) menuLabel.innerText = 'Menu';

    gsap.to(menuOverlay, {
      clipPath: `circle(0px at ${x}px ${y}px)`,
      pointerEvents: 'none',
      duration: DURATIONS.medium,
      ease: EASE_PRESETS.clipReveal,
    });
  };

  const onBtnClick = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  menuBtn.addEventListener('click', onBtnClick);

  const cleanups: Array<() => void> = [];
  cleanups.push(() => menuBtn.removeEventListener('click', onBtnClick));

  menuLinks.forEach((link) => {
    const onLinkClick = () => closeMenu();
    link.addEventListener('click', onLinkClick);
    cleanups.push(() => link.removeEventListener('click', onLinkClick));
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  };

  document.addEventListener('keydown', onKeyDown);
  cleanups.push(() => document.removeEventListener('keydown', onKeyDown));

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
