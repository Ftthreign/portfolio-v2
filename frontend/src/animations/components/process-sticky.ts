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

  // Helper to reliably scroll the active mobile pill into the horizontal center of its container
  const centerMobilePill = (item: HTMLElement) => {
    const container = item.parentElement as HTMLElement | null;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.clientWidth;
    const targetScrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
  };

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

  // Desktop Nav Clicks
  navItems.forEach((item, index) => {
    const cardEl = stepCards[index] as HTMLElement | undefined;
    if (!cardEl) return;

    const onClick = (e: Event) => {
      e.preventDefault();
      cardEl.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    };

    item.addEventListener('click', onClick);
    cleanups.push(() => item.removeEventListener('click', onClick));
  });

  // Mobile Nav Clicks (Centers active pill horizontally and scrolls card to vertical start offset)
  mobileNavItems.forEach((item, index) => {
    const cardEl = stepCards[index] as HTMLElement | undefined;
    const mobileNavItem = item as HTMLElement;
    if (!cardEl) return;

    const onClick = (e: Event) => {
      e.preventDefault();
      
      // Update Mobile Nav Active Classes
      mobileNavItems.forEach((btn) => {
        btn.classList.remove('active', 'bg-governor-bay-600', '!text-white', 'shadow-md');
        btn.classList.add('bg-slate-100', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
      });
      mobileNavItem.classList.add('active', 'bg-governor-bay-600', '!text-white', 'shadow-md');
      mobileNavItem.classList.remove('bg-slate-100', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');

      // Scroll mobile pill smoothly into container center
      centerMobilePill(mobileNavItem);

      // Scroll step card vertically with 180px clearance (Navbar 80px + Tab Bar 60px + 40px Gap)
      const cardRect = cardEl.getBoundingClientRect();
      const targetTop = cardRect.top + window.scrollY - 180;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    };

    item.addEventListener('click', onClick);
    cleanups.push(() => item.removeEventListener('click', onClick));
  });

  // ScrollTrigger for Each Card
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
            item.classList.add('bg-slate-100', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
          });
          if (mobileNavItem) {
            mobileNavItem.classList.add('active', 'bg-governor-bay-600', '!text-white', 'shadow-md');
            mobileNavItem.classList.remove('bg-slate-100', 'dark:bg-slate-900', 'text-slate-700', 'dark:text-slate-300');
            centerMobilePill(mobileNavItem);
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
