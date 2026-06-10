"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Client wrapper that makes the header scroll-aware: once the page is scrolled
 * past a small threshold it gains a translucent blur + subtle shadow. The
 * localized nav/logo stays server-rendered and is passed in as `children`, so
 * the client surface here is minimal.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border shadow-sm"
          : "bg-background border-transparent"
      }`}
    >
      {children}
    </header>
  );
}
