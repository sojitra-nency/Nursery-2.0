interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({ title, subtitle, center = false }: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${center ? "text-center" : ""}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </div>
  );
}
