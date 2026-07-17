interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Small uppercase accent label rendered above the title. */
  eyebrow?: string;
  center?: boolean;
  /** Extra classes for the wrapper — e.g. `mb-0` when composed inside a flex row. */
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  center = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""} ${className}`}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          <span aria-hidden="true" className="h-px w-6 bg-accent/60" />
          {eyebrow}
          {center && <span aria-hidden="true" className="h-px w-6 bg-accent/60" />}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </div>
  );
}
