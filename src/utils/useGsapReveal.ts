import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Options = {
  selector?: string;     // éléments à animer
  y?: number;            // décalage vertical
  duration?: number;
  stagger?: number;
  start?: string;        // déclenchement scroll
};

export function useGsapReveal(rootRef: React.RefObject<HTMLElement>, opts: Options = {}) {
  const {
    selector = "[data-reveal]",
    y = 18,
    duration = 0.6,
    stagger = 0.08,
    start = "top 85%",
  } = opts;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Respect "réduire les animations"
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const items = Array.from(root.querySelectorAll(selector));

      gsap.set(items, { opacity: 0, y });

      items.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration,
          ease: "power2.out",
          delay: i === 0 ? 0 : 0,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none reverse",
          },
        });
      });

      // Optionnel: petit "pop" en arrivant sur la page (avant le scroll)
      if (items.length) {
        gsap.to(items, { opacity: 1, y: 0, duration, ease: "power2.out", stagger });
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef, selector, y, duration, stagger, start]);
}