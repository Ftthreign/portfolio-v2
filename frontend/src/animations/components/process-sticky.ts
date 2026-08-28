import { getGSAP, isClient } from '../utils/gsap-setup';
import { EASE_PRESETS } from '../config/constants';

export function initProcessSticky(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap, ScrollTrigger } = getGSAP();
  if (!gsap || !ScrollTrigger) return;

  const processSection = document.querySelector('.process-section') as HTMLElement;
  const stepCards = document.querySelectorAll('.process-step-card');
  const navItems = document.querySelectorAll('.process-nav-item');
  const mobileNavItems = document.querySelectorAll('.process-mobile-nav-item');
  const activeBg = document.querySelector('.process-active-bg') as HTMLElement | null;

  if (!processSection || stepCards.length === 0) return;

  const cleanups: Array<() => void> = [];

  const moveActiveIndicator = (activeIndex: number) => {
    const activeNav = navItems[activeIndex] as HTMLElement | undefined;
    if (activeNav && activeBg) {
      const parentRect = activeNav.parentElement?.getBoundingClientRect();
      const navRect = activeNav.getBoundingClientRect();

      if (parentRect) {
        const topOffset = navRect.top - parentRect.top;
        const height = navRect.height;

        gsap.to(activeBg, {
          y: topOffset,
          height: height,
          opacity: 1,
          duration: 0.4,
          ease: EASE_PRESETS.smoothOut,
          overwrite: 'auto',
        });
      }
    }
  };

  moveActiveIndicator(0);

  // Bind smooth click listeners on nav items to center active cards vertically in viewport
  navItems.forEach((item, index) => {
    const cardEl = stepCards[index] as HTMLElement | undefined;
    if (!cardEl) return;

    const onClick = (e: Event) => {
      e.preventDefault();
      cardEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };

    item.addEventListener('click', onClick);
    cleanups.push(() => item.removeEventListener('click', onClick));
  });

  mobileNavItems.forEach((item, index) => {
    const cardEl = stepCards[index] as HTMLElement | undefined;
    if (!cardEl) return;

    const onClick = (e: Event) => {
      e.preventDefault();
      cardEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };

    item.addEventListener('click', onClick);
    cleanups.push(() => item.removeEventListener('click', onClick));
  });

  stepCards.forEach((card, index) => {
    const cardEl = card as HTMLElement;
    const navItem = navItems[index] as HTMLElement | undefined;
    const mobileNavItem = mobileNavItems[index] as HTMLElement | undefined;

    const st = ScrollTrigger.create({
      trigger: cardEl,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          moveActiveIndicator(index);

          // Update Desktop Nav Active Classes
          navItems.forEach((item) => {
            item.classList.remove('active', '!text-white', 'font-bold');
          });
          if (navItem) {
            navItem.classList.add('active', '!text-white', 'font-bold');
          }

          // Update Mobile Nav Active Classes
          mobileNavItems.forEach((item) => {
            item.classList.remove('active', 'bg-governor-bay-600', '!text-white', 'shadow-md');
            item.classList.add('bg-slate-100', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-400');
          });
          if (mobileNavItem) {
            mobileNavItem.classList.add('active', 'bg-governor-bay-600', '!text-white', 'shadow-md');
            mobileNavItem.classList.remove('bg-slate-100', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-400');
            mobileNavItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }

          // Active Card Highlight
          gsap.to(cardEl, {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: EASE_PRESETS.smoothOut,
            overwrite: 'auto',
          });
        } else {
          // Softly dim inactive cards
          gsap.to(cardEl, {
            opacity: 0.5,
            scale: 0.98,
            duration: 0.4,
            ease: EASE_PRESETS.powerOut,
            overwrite: 'auto',
          });
        }
      },
    });

    cleanups.push(() => st.kill());
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
