interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  /** Extra classes for the wrapper — e.g. `mb-0` when composed inside a flex row. */
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  center = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""} ${className}`}>
      <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </div>
  );
}
