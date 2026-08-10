"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { isActiveHref, type NavItem } from "./NavLinks";

interface MobileMenuProps {
  items: NavItem[];
  openLabel: string;
  closeLabel: string;
  /** Extra panel content rendered below the links (e.g. the locale switcher). */
  children?: ReactNode;
}

/**
 * Accessible disclosure nav for small screens: hamburger toggle with
 * `aria-expanded`/`aria-controls`, Escape-to-close, and auto-close on
 * navigation. The panel drops below the sticky header (which is `relative`).
 */
export function MobileMenu({ items, openLabel, closeLabel, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close when the route changes (adjust-during-render idiom used repo-wide).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Escape must hand focus back to the control that opened the panel,
      // otherwise a keyboard user is dropped at the top of the document.
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? closeLabel : openLabel}
        className="link-focus tap-target inline-flex cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-border bg-background/95 backdrop-blur-md shadow-lift animate-fade-down"
        >
          <nav className="container mx-auto flex flex-col gap-0.5 px-4 py-3">
            {items.map((item) => {
              const active = isActiveHref(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-focus flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-foreground hover:bg-surface"
                  }`}
                >
                  {item.icon && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-accent">
                      {item.icon}
                    </span>
                  )}
                  <span className="min-w-0">{item.label}</span>
                </Link>
              );
            })}
            {children && (
              <div className="mt-2 flex border-t border-border px-3 pt-3 pb-1">{children}</div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
