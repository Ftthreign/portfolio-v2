import { getGSAP, isClient } from "../utils/gsap-setup";
import { EASE_PRESETS } from "../config/constants";

interface SolarDOM {
  filterBtns: NodeListOf<HTMLElement>;
  planets: NodeListOf<HTMLElement>;
  rings: NodeListOf<HTMLElement>;
  rotators: NodeListOf<HTMLElement>;
  stageCol: HTMLElement | null;
  sideDetailWrap: HTMLElement | null;
  sunIcon: HTMLElement | null;
  sunTitle: HTMLElement | null;
  sunCount: HTMLElement | null;
  sunCore: HTMLElement | null;
  sunLogo: HTMLImageElement | null;
  detailIcon: HTMLImageElement | null;
  detailName: HTMLElement | null;
  detailTag: HTMLElement | null;
  detailLevel: HTMLElement | null;
  detailBar: HTMLElement | null;
  detailDesc: HTMLElement | null;
  resumeBtn: HTMLElement | null;
  resumeText: HTMLElement | null;
  statusDot: HTMLElement | null;
  orbitStage: HTMLElement | null;
}

interface SolarState {
  isPaused: boolean;
  isShifted: boolean;
  activePlanet: HTMLElement | null;
}

function getSolarDOM(): SolarDOM {
  return {
    filterBtns: document.querySelectorAll<HTMLElement>(".solar-filter-btn"),
    planets: document.querySelectorAll<HTMLElement>(".solar-planet-node"),
    rings: document.querySelectorAll<HTMLElement>(".solar-orbit-ring"),
    rotators: document.querySelectorAll<HTMLElement>(".orbit-rotator"),
    stageCol: document.getElementById("solar-orbit-stage-col"),
    sideDetailWrap: document.getElementById("solar-side-detail-wrap"),
    sunIcon: document.getElementById("solar-sun-icon"),
    sunTitle: document.getElementById("solar-sun-title"),
    sunCount: document.getElementById("solar-sun-count"),
    sunCore: document.getElementById("solar-sun-core"),
    sunLogo: document.getElementById("solar-sun-logo") as HTMLImageElement | null,
    detailIcon: document.getElementById("solar-detail-icon") as HTMLImageElement | null,
    detailName: document.getElementById("solar-detail-name"),
    detailTag: document.getElementById("solar-detail-tag"),
    detailLevel: document.getElementById("solar-detail-level"),
    detailBar: document.getElementById("solar-detail-bar"),
    detailDesc: document.getElementById("solar-detail-desc"),
    resumeBtn: document.getElementById("solar-resume-btn"),
    resumeText: document.getElementById("solar-resume-text"),
    statusDot: document.getElementById("solar-status-dot"),
    orbitStage: document.querySelector<HTMLElement>(".solar-orbit-stage"),
  };
}

export function initSkillsSectionAnimations(): (() => void) | undefined {
  if (!isClient()) return;
  const { gsap } = getGSAP();
  if (!gsap) return;

  const dom = getSolarDOM();
  const cleanups: Array<() => void> = [];

  const state: SolarState = {
    isPaused: false,
    isShifted: false,
    activePlanet: null,
  };

  const pauseOrbit = () => {
    state.isPaused = true;
    dom.rotators.forEach((rotator) => {
      rotator.style.animationPlayState = "paused";
    });
    if (dom.statusDot) {
      dom.statusDot.classList.replace("bg-emerald-500", "bg-amber-500");
    }
    if (dom.resumeText) {
      dom.resumeText.textContent = "▶ Close & Resume Orbit";
    }
  };

  const resumeOrbit = () => {
    state.isPaused = false;
    state.isShifted = false;
    state.activePlanet = null;

    dom.rotators.forEach((rotator) => {
      rotator.style.animationPlayState = "running";
    });

    dom.planets.forEach((p) => {
      p.classList.remove("active-planet");
      p.style.opacity = "1";
    });

    // Reset Central Sun Core
    if (dom.sunLogo) dom.sunLogo.classList.add("hidden");
    if (dom.sunIcon) dom.sunIcon.classList.remove("hidden");
    if (dom.sunTitle) dom.sunTitle.textContent = "Fullstack Core";
    if (dom.sunCount) dom.sunCount.textContent = `${dom.planets.length} Planets`;

    // Slide orbit stage back to center (x:0, y:0)
    if (dom.stageCol) {
      gsap.to(dom.stageCol, { x: 0, y: 0, duration: 0.6, ease: EASE_PRESETS.smoothOut, force3D: true });
    }

    // Slide detail card out (bottom on mobile, right on desktop)
    if (dom.sideDetailWrap) {
      const isDesktop = window.innerWidth >= 1024;
      gsap.to(dom.sideDetailWrap, {
        opacity: 0,
        x: isDesktop ? 70 : 0,
        y: isDesktop ? 0 : 80,
        scale: 0.95,
        duration: 0.35,
        ease: EASE_PRESETS.powerOut,
        onComplete: () => {
          dom.sideDetailWrap?.classList.add("hidden");
          if (dom.sideDetailWrap) dom.sideDetailWrap.style.pointerEvents = "none";
        },
      });
    }

    if (dom.statusDot) {
      dom.statusDot.classList.replace("bg-amber-500", "bg-emerald-500");
    }
    if (dom.resumeText) {
      dom.resumeText.textContent = "▶ Close & Resume Solar Orbit";
    }
  };

  const selectPlanetNode = (planet: HTMLElement) => {
    pauseOrbit();
    state.activePlanet = planet;

    const name = planet.dataset.name || "Skill";
    const iconUrl = planet.dataset.icon || "https://cdn.simpleicons.org/typescript/3178C6";
    const desc = planet.dataset.desc || "";
    const level = planet.dataset.level || "90";
    const tag = planet.dataset.tag || "Expert";

    // 1. Update Sun Core
    if (dom.sunIcon) dom.sunIcon.classList.add("hidden");
    if (dom.sunLogo) {
      dom.sunLogo.src = iconUrl;
      dom.sunLogo.classList.remove("hidden");
    }
    if (dom.sunTitle) dom.sunTitle.textContent = name;
    if (dom.sunCount) dom.sunCount.textContent = `${level}% · ${tag}`;

    // 2. Rotate orbit rotator to place clicked planet at 0° right apex facing card
    const planetAngle = parseFloat(planet.dataset.angle || "0");
    const parentRotator = planet.closest<HTMLElement>(".orbit-rotator");
    if (parentRotator) {
      gsap.to(parentRotator, {
        rotate: -planetAngle,
        duration: 0.65,
        ease: EASE_PRESETS.smoothOut,
        overwrite: "auto",
        force3D: true,
      });
    }

    // 3. Shift stage on first click (Left shift on Desktop, Upward shift on Mobile)
    if (!state.isShifted) {
      state.isShifted = true;
      const isDesktop = window.innerWidth >= 1024;
      if (dom.stageCol && isDesktop) {
        const rect = dom.stageCol.getBoundingClientRect();
        // Place orbit center so the left edge of the 820px ring sits gracefully near left screen border
        const desiredCenterX = Math.max(380, window.innerWidth * 0.22);
        const currentCenterX = rect.left + rect.width / 2;
        const deltaX = desiredCenterX - currentCenterX;

        gsap.to(dom.stageCol, {
          x: deltaX,
          y: 0,
          duration: 0.65,
          ease: EASE_PRESETS.smoothOut,
          force3D: true,
        });
      } else if (dom.stageCol) {
        gsap.to(dom.stageCol, {
          x: 0,
          y: -35,
          duration: 0.5,
          ease: EASE_PRESETS.smoothOut,
          force3D: true,
        });
      }
    }

    // 4. Reveal detail card (Slide in from right on Desktop, Bottom Sheet on Mobile)
    if (dom.sideDetailWrap) {
      dom.sideDetailWrap.classList.remove("hidden");
      dom.sideDetailWrap.style.pointerEvents = "auto";

      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        gsap.fromTo(
          dom.sideDetailWrap,
          { opacity: 0, x: 80, y: 0, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: EASE_PRESETS.smoothOut,
            overwrite: "auto",
          }
        );
      } else {
        gsap.fromTo(
          dom.sideDetailWrap,
          { opacity: 0, x: 0, y: 100, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: EASE_PRESETS.smoothOut,
            overwrite: "auto",
          }
        );
      }
    }

    // 5. Highlight active planet & dim remaining planets
    dom.planets.forEach((p) => {
      if (p === planet) {
        p.classList.add("active-planet");
        p.style.opacity = "1";
      } else {
        p.classList.remove("active-planet");
        p.style.opacity = "0.25";
      }
    });

    // 6. Update detail card DOM text & gauges
    if (dom.detailName) dom.detailName.textContent = name;
    if (dom.detailIcon) dom.detailIcon.src = iconUrl;
    if (dom.detailTag) dom.detailTag.textContent = tag;
    if (dom.detailDesc) dom.detailDesc.textContent = desc;
    if (dom.detailLevel) dom.detailLevel.textContent = `${level}%`;
    if (dom.detailBar) dom.detailBar.style.width = `${level}%`;
  };

  // Filter Tabs
  dom.filterBtns.forEach((btn) => {
    const onClick = () => {
      const filter = btn.dataset.solarFilter || "all";

      dom.filterBtns.forEach((b) => {
        b.classList.remove("bg-governor-bay-600", "text-white", "shadow-sm", "active-solar-filter");
        b.classList.add("bg-slate-100", "dark:bg-slate-900", "text-slate-600", "dark:text-slate-400");
      });
      btn.classList.add("bg-governor-bay-600", "text-white", "shadow-sm", "active-solar-filter");
      btn.classList.remove("bg-slate-100", "dark:bg-slate-900", "text-slate-600", "dark:text-slate-400");

      if (dom.sunTitle) {
        dom.sunTitle.textContent = filter === "all" ? "Fullstack Core" : (btn.textContent?.trim() || "Category");
        if (dom.sunIcon) dom.sunIcon.textContent = filter === "all" ? "☀️" : "🪐";
      }

      let visibleCount = 0;
      dom.planets.forEach((planet) => {
        const cat = planet.dataset.category;
        const visible = filter === "all" || filter === cat;
        planet.style.opacity = visible ? "1" : "0.15";
        planet.style.pointerEvents = visible ? "auto" : "none";
        if (visible) visibleCount++;
      });

      dom.rings.forEach((ring) => {
        ring.style.opacity = filter === "all" || filter === ring.dataset.ringCategory ? "1" : "0.3";
      });

      if (dom.sunCount) dom.sunCount.textContent = `${visibleCount} Planets`;
    };

    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  });

  // Planet Click (With Toggle to Close if active)
  dom.planets.forEach((planet) => {
    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (planet.classList.contains("active-planet") && state.isPaused) {
        resumeOrbit();
      } else {
        selectPlanetNode(planet);
      }
    };
    planet.addEventListener("click", onClick);
    cleanups.push(() => planet.removeEventListener("click", onClick));
  });

  // Resume Button
  if (dom.resumeBtn) {
    const onResume = (e: MouseEvent) => {
      e.stopPropagation();
      state.isPaused ? resumeOrbit() : pauseOrbit();
    };
    dom.resumeBtn.addEventListener("click", onResume);
    cleanups.push(() => dom.resumeBtn?.removeEventListener("click", onResume));
  }

  // Sun Core Click -> Reset Orbit
  if (dom.sunCore) {
    const onSunClick = () => resumeOrbit();
    dom.sunCore.addEventListener("click", onSunClick);
    cleanups.push(() => dom.sunCore?.removeEventListener("click", onSunClick));
  }

  // 3D Parallax Tilt Effect on Mouse Movement
  if (dom.orbitStage) {
    const stage = dom.orbitStage;
    const onMouseMove = (e: MouseEvent) => {
      if (state.isPaused) return;
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(stage, {
        rotateX: (y / rect.height) * -5,
        rotateY: (x / rect.width) * 5,
        duration: 0.8,
        ease: EASE_PRESETS.smoothOut,
      });
    };

    const onMouseLeave = () => {
      gsap.to(stage, {
        rotateX: 0,
        rotateY: 0,
        duration: 1,
        ease: EASE_PRESETS.smoothOut,
      });
    };

    stage.addEventListener("mousemove", onMouseMove);
    stage.addEventListener("mouseleave", onMouseLeave);

    cleanups.push(() => {
      stage.removeEventListener("mousemove", onMouseMove);
      stage.removeEventListener("mouseleave", onMouseLeave);
    });
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}
