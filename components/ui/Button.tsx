import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-soft hover:bg-accent-dark hover:shadow-lift",
  secondary: "bg-surface text-foreground border border-border hover:bg-border",
  outline: "border border-accent text-accent hover:bg-accent/10",
  ghost: "text-foreground hover:bg-surface",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base",
};

const baseClasses =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium cursor-pointer transition-[transform,background-color,border-color,box-shadow] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Design-system button. Pass `href` to render a link with identical styling
 * (internal paths use `next/link`; external/protocol URLs use a plain anchor) —
 * this replaces the old invalid `<Link><Button/></Link>` nesting.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className = "", children, href, ...rest } = props;
  const cls = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href !== undefined) {
    const anchorProps = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;
    if (/^(https?:|tel:|mailto:)/.test(href)) {
      return (
        <a href={href} className={cls} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cls}>
      {children}
    </button>
  );
}
