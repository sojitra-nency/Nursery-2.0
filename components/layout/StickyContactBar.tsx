import type { SiteSettings } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface StickyContactBarProps {
  settings: SiteSettings;
  dict: Dictionary;
}

export function StickyContactBar({ settings, dict }: StickyContactBarProps) {
  const phone = settings.phone || "9876543210";
  const whatsapp = settings.whatsapp || "9876543210";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden">
      <a
        href={`tel:+91${phone}`}
        className="flex-1 flex items-center justify-center gap-2 py-4 bg-foreground text-white text-sm font-semibold"
      >
        📞 {dict.contact.callUs}
      </a>
      <a
        href={`https://wa.me/91${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white text-sm font-semibold"
      >
        💬 {dict.contact.whatsapp}
      </a>
    </div>
  );
}
