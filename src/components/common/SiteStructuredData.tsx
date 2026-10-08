import { StructuredData } from "./StructuredData";
import { SITE } from "../../lib/config";
import { type SiteData } from "../../lib/site/types";
export function SiteStructuredData({ d }: { d: SiteData }) {
  return (
    <>
      {d.path !== "/" && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: SITE + "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: d.title,
                item: SITE + d.path,
              },
            ],
          }}
        />
      )}
      {d.kind === "home" && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "JMB Capotas",
            url: SITE,
            telephone: d.config?.telephone ? `+${d.config.telephone}` : undefined,
          }}
        />
      )}
    </>
  );
}
