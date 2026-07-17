import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: ReactNode;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-surface border border-border rounded-2xl overflow-hidden ${hover ? "shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-soft hover:-translate-y-1 hover:border-accent/30 hover:shadow-lift" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
