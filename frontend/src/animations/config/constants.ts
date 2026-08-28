export const EASE_PRESETS = {
  powerOut: "power2.out",
  powerIn: "power2.in",
  smoothOut: "power3.out",
  springBounce: "back.out(1.7)",
  springGentle: "back.out(1.5)",
  sineInOut: "sine.inOut",
  clipReveal: "power3.inOut",
  softLag: "power1.out",
} as const;

export const DURATIONS = {
  fast: 0.2,
  normal: 0.4,
  medium: 0.6,
  slow: 0.8,
  entrance: 1.0,
  lag: 1.6,
  carouselInterval: 3200,
} as const;

export const SELECTORS = {
  cursor: {
    point: ".custom-cursor",
    follower: ".custom-cursor-follower",
    interactive: "a, button, .magnetic-target, input, textarea",
    magnetic: ".magnetic",
  },
  theme: {
    toggleBtn: ".theme-toggle-btn",
    overlay: ".nav-fullscreen-overlay",
  },
  navbar: {
    btn: ".nav-menu-btn",
    overlay: ".nav-fullscreen-overlay",
    links: ".nav-overlay-link",
    infoItems: ".nav-overlay-info",
    lineTop: ".hamburger-line-top",
    lineBottom: ".hamburger-line-bottom",
    label: ".nav-menu-label",
  },
  hero: {
    section: ".hero-section",
    portrait: ".hero-portrait img",
    glow: ".hero-ambient-glow",
    badges: ".hero-float-badge",
    animItems: ".hero-anim-item",
    titleSplit: ".split-text-target",
    roleTarget: ".rotating-role-target",
    content: ".hero-content",
  },
  reveals: {
    single: ".gsap-reveal",
    staggerParent: ".gsap-stagger-parent",
    staggerChild: ".gsap-stagger-child",
  },
  projects: {
    section: ".featured-projects-section",
    switcherBtn: ".project-variant-btn",
    variantContainer: ".projects-variant-container",
    cards: ".project-card-anim",
    filterBtn: ".project-filter-btn",
    filterItem: ".project-filter-item",
  },
  blog: {
    section: ".latest-blog-section",
    row: ".blog-editorial-row",
    previewModal: ".blog-floating-preview",
    previewImg: ".blog-floating-img",
  },
} as const;

export const ROLES_LIST = [
  "Full Stack Developer",
  "Mobile Developer",
  "Backend Developer",
  "Frontend Developer",
  "DevOps Engineer",
] as const;
