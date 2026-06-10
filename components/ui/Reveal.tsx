"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  /** Stagger order — each step adds 80ms of delay. */
  index?: number;
  className?: string;
}

/**
 * Fades + slides its children in once they scroll into view (reveal-once).
 *
 * - Zero dependencies; a single IntersectionObserver per instance.
 * - Respects `prefers-reduced-motion` by revealing immediately.
 * - Safety timeout guarantees content is never stuck hidden if the observer
 *   never fires (e.g. element already in view, or flaky environments).
 */
export function Reveal({ children, as, index = 0, className = "" }: RevealProps) {
  const Tag: ElementType = as ?? "div";
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Under reduced motion the CSS media query already forces `.reveal` visible,
    // so we skip the observer entirely (and avoid touching state here).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);

    // Safety net: reveal even if the observer somehow never fires.
    const safety = window.setTimeout(() => setVisible(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
