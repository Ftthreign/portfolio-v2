import { isClient } from '../utils/gsap-setup';
import { SELECTORS } from '../config/constants';

export function initThemeToggle(): (() => void) | undefined {
  if (!isClient()) return;

  const themeBtns = document.querySelectorAll(SELECTORS.theme.toggleBtn);
  const menuOverlay = document.querySelector(SELECTORS.theme.overlay) as HTMLElement;

  const syncOverlayTheme = () => {
    if (!menuOverlay) return;
    const isDarkSite = document.documentElement.classList.contains('dark');

    if (isDarkSite) {
      menuOverlay.classList.remove('bg-slate-950/95', 'text-slate-100');
      menuOverlay.classList.add('bg-slate-50/95', 'text-slate-900', 'overlay-light-theme');
    } else {
      menuOverlay.classList.remove('bg-slate-50/95', 'text-slate-900', 'overlay-light-theme');
      menuOverlay.classList.add('bg-slate-950/95', 'text-slate-100');
    }
  };

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  syncOverlayTheme();

  const cleanups: Array<() => void> = [];

  themeBtns.forEach((btn) => {
    const onToggle = () => {
      document.documentElement.classList.toggle('dark');
      const isDarkNow = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
      syncOverlayTheme();
    };

    btn.addEventListener('click', onToggle);
    cleanups.push(() => btn.removeEventListener('click', onToggle));
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
