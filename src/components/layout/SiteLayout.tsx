import { type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { type SiteData } from "../../lib/site/types";
import { SiteStructuredData } from "../common/SiteStructuredData";
export function SiteLayout({
  d,
  children,
}: {
  d: SiteData;
  children: ReactNode;
}) {
  return (
    <>
      <Header home={d.kind === "home"} pages={d.pages} />
      <main id="main">{children}</main>
      <Footer pages={d.pages} cities={d.cities} />
      <SiteStructuredData d={d} />
    </>
  );
}
