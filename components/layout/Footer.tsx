import type { Dictionary } from "@/lib/i18n/dictionaries";

interface FooterProps {
  nurseryName: string;
  locale: string;
  dict: Dictionary;
}

export function Footer({ nurseryName, dict }: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="container mx-auto px-4 py-8 text-sm text-muted text-center">
        © {new Date().getFullYear()} {nurseryName}. {dict.footer.rights}
      </div>
    </footer>
  );
}
