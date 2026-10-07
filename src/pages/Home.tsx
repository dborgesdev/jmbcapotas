import { ClientsMarquee } from "../components/home/ClientsMarquee";
import { FinalCta } from "../components/home/FinalCta";
import { type SiteData } from "../lib/site/types";
import { HeroSection } from "../components/home/HeroSection";
import { BrandSelector } from "../components/home/BrandSelector";
import { CategorySection } from "../components/home/CategorySection";
import { InstitutionalSection } from "../components/home/InstitutionalSection";
import { WorksSection } from "../components/home/WorksSection";
import { BlogSection } from "../components/home/BlogSection";
import finalCtaBg from "../assets/final-cta-bg.webp";
import type { Media } from "../lib/wordpress/types";

export function Home({ d }: { d: SiteData }) {
  const hero: Media = {
    id: 0,
    url: finalCtaBg,
    alt: "Modelos de capotas para picapes",
    width: 1689,
    height: 931,
    srcSet: "",
  };
  const institutional = d.pages.find((p) => /quem|empresa/.test(p.slug));
  return (
    <>
      <HeroSection hero={hero} />
      <BrandSelector brands={d.tax.brands} error={d.error} />
      <CategorySection categories={d.tax.categories} />
      <InstitutionalSection institutional={institutional} />
      <ClientsMarquee clients={d.clients} />
      <WorksSection works={d.works} />
      <BlogSection posts={d.posts} />
      <FinalCta image={hero} />
    </>
  );
}
