import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { selectRelatedProducts } from "../src/lib/wordpress/related";
import { headingText, eyebrowText } from "../src/lib/text";
import { safeHtml } from "../src/lib/wordpress/html";
import { HeroVideo } from "../src/components/home/HeroVideo";
import { CategoryCard } from "../src/components/home/CategoryCard";
import { ClientsMarquee } from "../src/components/home/ClientsMarquee";
import type { Post, Media } from "../src/lib/wordpress/types";
const image: Media = {
  id: 1,
  url: "https://example.test/card.jpg",
  alt: "",
  width: 900,
  height: 600,
  srcSet: "",
};
const product = (id: number, marca: number[] = [], modelo: number[] = []) =>
  ({ id, marca, modelo }) as Post;
describe("Refinamentos da V1", () => {
  it("prioriza o mesmo veículo, complementa com genéricos e exclui outros veículos, duplicados e o atual", () => {
    const current = product(1, [3], [5]);
    const candidates = [
      current,
      product(2),
      product(3, [3], [5]),
      product(4, [3], [6]),
      product(5, [4], [5]),
      product(6, [], [6]),
      product(3, [3], [5]),
      product(7, [], [5]),
    ];
    expect(selectRelatedProducts(current, candidates).map((p) => p.id)).toEqual(
      [3, 2, 7],
    );
    expect(
      selectRelatedProducts(current, candidates, 1).map((p) => p.id),
    ).toEqual([3]);
  });
  it("não deduz compatibilidade quando o produto não tem modelo", () => {
    expect(
      selectRelatedProducts(product(1, [3]), [
        product(2, [3], [5]),
        product(3),
      ]).map((p) => p.id),
    ).toEqual([3]);
  });
  it("remove apenas numeração decorativa dos eyebrows e ponto final dos headings", () => {
    expect(eyebrowText("01 / Na prática")).toBe("Na prática");
    expect(eyebrowText("404 / Página")).toBe("404 / Página");
    expect(headingText("Seu estilo. Sua escolha.")).toBe(
      "Seu estilo. Sua escolha",
    );
    expect(safeHtml("<h1>Seu estilo. Sua escolha.</h1><p>Texto.</p>")).toBe(
      "<h2>Seu estilo. Sua escolha</h2><p>Texto.</p>",
    );
  });
  it("entrega fallback estático SSR sem carregar vídeo antes de verificar reduced motion", () => {
    const html = renderToStaticMarkup(<HeroVideo fallback={image} />);
    expect(html).toContain(image.url);
    expect(html).not.toContain("<video");
  });
  it("usa imagem do card e não imagem_fundo no carrossel", () => {
    const html = renderToStaticMarkup(
      <CategoryCard
        category={{
          id: 1,
          name: "Categoria",
          slug: "categoria",
          description: "",
          count: 1,
          image,
          background: { ...image, url: "https://example.test/background.jpg" },
        }}
        index={0}
        total={2}
      />,
    );
    expect(html).toContain(image.url);
    expect(html).not.toContain("background.jpg");
  });
  it("não cria links para clientes nem renderiza logos ausentes", () => {
    const html = renderToStaticMarkup(
      <ClientsMarquee
        clients={[
          { id: 1, name: "Cliente", logo: image },
          { id: 2, name: "Sem logo" },
        ]}
      />,
    );
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("Sem logo");
    expect(html).toContain('aria-hidden="true"');
    expect((html.match(/<img /g) || []).length).toBe(16);
  });
});
