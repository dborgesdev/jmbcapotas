import { type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { type SiteData } from "../../lib/site/types";
import { SiteStructuredData } from "../common/SiteStructuredData";
import { PublicConfigContext } from "../../lib/site/config-context";
import { FloatingWhatsApp } from "../common/FloatingWhatsApp";
export function SiteLayout({
  d,
  children,
}: {
  d: SiteData;
  children: ReactNode;
}) {
  return (
    <PublicConfigContext.Provider
      value={{
        config: d.config || {},
        context: {
          product: d.kind === "product" ? d.post : undefined,
          brand: d.tax.brands.find((b) => b.id === d.brandId)?.name,
        },
      }}
    >
      <Header home={d.kind === "home"} pages={d.pages} brands={d.tax.brands} />
      <main id="main">{children}</main>
      <Footer pages={d.pages} cities={d.cities} />
      <SiteStructuredData d={d} />
      <FloatingWhatsApp />
    </PublicConfigContext.Provider>
  );
}
