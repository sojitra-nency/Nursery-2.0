import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: ReactNode;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-surface border border-border rounded-xl overflow-hidden ${hover ? "transition-shadow hover:shadow-md" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
