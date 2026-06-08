import type { StructureBuilder } from "sanity/structure";

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("plant").title("Plants"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("subcategory").title("Subcategories"),
      S.documentTypeListItem("collection").title("Collections"),
    ]);
