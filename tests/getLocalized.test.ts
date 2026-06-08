import { describe, it, expect } from "vitest";
import { getLocalized } from "@/lib/i18n/getLocalized";

describe("getLocalized", () => {
  it("returns the value for the requested locale", () => {
    expect(getLocalized({ en: "Hello", hi: "नमस्ते", gu: "નમસ્તે" }, "hi")).toBe("नमस्ते");
  });

  it("falls back to English when the locale value is missing", () => {
    expect(getLocalized({ en: "Hello" }, "gu")).toBe("Hello");
  });

  it("returns empty string for null/undefined field", () => {
    expect(getLocalized(null, "en")).toBe("");
    expect(getLocalized(undefined, "en")).toBe("");
  });
});
