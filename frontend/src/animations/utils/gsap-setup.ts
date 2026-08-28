import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export function getGSAP() {
  return { gsap, ScrollTrigger };
}

export function isClient(): boolean {
  return typeof window !== 'undefined';
}
