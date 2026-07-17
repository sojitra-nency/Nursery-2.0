import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { SiteSettings } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface StickyContactBarProps {
  settings: SiteSettings;
  dict: Dictionary;
}

const actionClass =
  "flex items-center justify-center gap-2 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] text-sm font-semibold transition-opacity active:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset";

/** Mobile-only quick-contact bar pinned to the bottom edge (safe-area aware). */
export function StickyContactBar({ settings, dict }: StickyContactBarProps) {
  const phone = settings.phone || "9876543210";
  const whatsapp = settings.whatsapp || "9876543210";

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 md:hidden border-t border-border/40">
      <a
        href={`tel:+91${phone}`}
        className={`${actionClass} bg-foreground text-background focus-visible:ring-background`}
      >
        <PhoneIcon className="h-4 w-4" />
        {dict.contact.callUs}
      </a>
      <a
        href={`https://wa.me/91${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${actionClass} bg-whatsapp text-on-whatsapp focus-visible:ring-on-whatsapp`}
      >
        <WhatsAppIcon className="h-4 w-4" />
        {dict.contact.whatsapp}
      </a>
    </div>
  );
}
