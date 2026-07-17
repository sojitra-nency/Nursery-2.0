import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, { badge: string; dot: string }> = {
  neutral: { badge: "bg-muted/10 text-muted", dot: "bg-muted" },
  accent: { badge: "bg-accent/10 text-accent", dot: "bg-accent" },
  success: {
    badge: "bg-green-600/10 text-green-700 dark:bg-green-400/10 dark:text-green-300",
    dot: "bg-green-600 dark:bg-green-400",
  },
  warning: {
    badge: "bg-amber-600/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    dot: "bg-amber-600 dark:bg-amber-400",
  },
  danger: {
    badge: "bg-red-600/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
    dot: "bg-red-600 dark:bg-red-400",
  },
};

interface BadgeProps {
  tone?: Tone;
  /** Show a small status dot before the label (used for availability states). */
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot = false, children }: BadgeProps) {
  const t = toneClasses[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${t.badge}`}
    >
      {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
}
