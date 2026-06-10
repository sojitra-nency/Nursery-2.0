import { describe, it, expect } from "vitest";
import { localBusinessJsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

const mockSettings = {
  name: { en: "Greenskill Landscape" },
  phone: "9876543210",
  city: { en: "Ahmedabad" },
  address: { en: "123 Garden Street" },
  openTime: "8:00 AM",
  closeTime: "8:00 PM",
};

describe("localBusinessJsonLd", () => {
  it("includes the correct @type", () => {
    const ld = localBusinessJsonLd(mockSettings);
    expect(ld["@type"]).toContain("LocalBusiness");
    expect(ld["@type"]).toContain("GardenStore");
  });

  it("includes the nursery name", () => {
    const ld = localBusinessJsonLd(mockSettings);
    expect(ld.name).toBe("Greenskill Landscape");
  });

  it("formats the phone number with +91 prefix", () => {
    const ld = localBusinessJsonLd(mockSettings);
    expect(ld.telephone).toBe("+919876543210");
  });

  it("derives all-week opening hours from open/close times", () => {
    const ld = localBusinessJsonLd(mockSettings);
    expect(ld.openingHoursSpecification).toHaveLength(1);
    const spec = ld.openingHoursSpecification[0];
    expect(spec.dayOfWeek).toContain("Sunday");
    expect(spec.opens).toBe("08:00");
    expect(spec.closes).toBe("20:00");
  });
});

describe("productJsonLd", () => {
  it("returns a Product schema", () => {
    const ld = productJsonLd({
      name: "Red Rose",
      slug: "red-rose",
      availability: "in_stock",
      locale: "en",
    });
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe("Red Rose");
    expect(ld.offers.availability).toBe("https://schema.org/InStock");
  });

  it("maps out_of_stock availability correctly", () => {
    const ld = productJsonLd({
      name: "Test Plant",
      slug: "test",
      availability: "out_of_stock",
      locale: "en",
    });
    expect(ld.offers.availability).toBe("https://schema.org/OutOfStock");
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds breadcrumb list with correct positions", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: "https://example.com/en" },
      { name: "Catalog", url: "https://example.com/en/catalog" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].position).toBe(2);
  });
});
