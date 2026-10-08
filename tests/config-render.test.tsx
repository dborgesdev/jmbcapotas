import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicConfigContext } from "../src/lib/site/config-context";
import { HeroSection } from "../src/components/home/HeroSection";
import { FinalCta } from "../src/components/home/FinalCta";
import { FooterContacts } from "../src/components/layout/FooterContacts";
import { FloatingWhatsApp } from "../src/components/common/FloatingWhatsApp";
import { PaymentConditions } from "../src/components/products/PaymentConditions";
import { BrandHero } from "../src/components/catalog/BrandHero";
import type { SiteData } from "../src/lib/site/types";
const image = {
  id: 1,
  url: "https://example.test/hero.jpg",
  alt: "",
  width: 1200,
  height: 800,
  srcSet: "",
};
describe("Apresentação dos dados normalizados", () => {
  it("Hero sem mídia é neutro e CTA final usa mídia independente", () => {
    const html = renderToStaticMarkup(
      <PublicConfigContext.Provider
        value={{
          config: {
            hero: image,
            finalCta: { ...image, url: "https://example.test/final.jpg" },
          },
        }}
      >
        <HeroSection />
        <FinalCta />
      </PublicConfigContext.Provider>,
    );
    expect(html).not.toContain("hero.jpg");
    expect(html).toContain("final.jpg");
    expect(html).not.toContain("<video");
  });
  it("omite contatos, botão e parcelamento ausentes", () => {
    const html = renderToStaticMarkup(
      <>
        <FooterContacts />
        <FloatingWhatsApp />
        <PaymentConditions />
      </>,
    );
    expect(html).not.toContain("<a");
    expect(html).not.toContain("Parcelamento");
  });
  it("separa tel/WhatsApp e preserva links externos seguros", () => {
    const html = renderToStaticMarkup(
      <PublicConfigContext.Provider
        value={{
          config: {
            telephone: "554133334444",
            whatsapp: "5541998686072",
            email: "contact@example.test",
            address: "Endereço",
            maps: "https://example.test/map",
            payment: "Parcelamento em até 2x sem juros",
          },
        }}
      >
        <FooterContacts />
        <PaymentConditions />
        <FloatingWhatsApp />
      </PublicConfigContext.Provider>,
    );
    expect(html).toContain("tel:+554133334444");
    expect(html).toContain("https://wa.me/5541998686072");
    expect(html).toContain("mailto:contact@example.test");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="Atendimento pelo WhatsApp"');
    expect(html).toContain("2x sem juros");
  });
  it("marca usa background full viewport apenas quando disponível e mantém descrição nativa", () => {
    const d = {
      title: "Produtos para Marca",
      brandId: 1,
      path: "/marcas/capota-de-fibra-para-marca/",
      tax: {
        brands: [
          {
            id: 1,
            name: "Marca",
            description: "Descrição nativa",
            background: image,
          },
        ],
        categories: [],
      },
    } as unknown as SiteData;
    const html = renderToStaticMarkup(<BrandHero d={d} />);
    expect(html).toContain("absolute inset-0 -z-20");
    expect(html).toContain("Descrição nativa");
    expect(html).toContain(image.url);
    d.tax.brands[0].background = undefined;
    const plain = renderToStaticMarkup(<BrandHero d={d} />);
    expect(plain).not.toContain("absolute inset-0 -z-20");
    expect(plain).toContain("Descrição nativa");
  });
});
