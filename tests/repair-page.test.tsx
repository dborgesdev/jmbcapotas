import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { page } from "../src/lib/site/pages";
import { WordPressPage } from "../src/pages/WordPressPage";
import { WorksSection } from "../src/components/home/WorksSection";
import type { SiteData } from "../src/lib/site/types";
import type { Post } from "../src/lib/wordpress/types";
const mocks = vi.hoisted(() => ({ pages: vi.fn(), works: vi.fn() }));
vi.mock("../src/lib/wordpress/pages", () => ({ pageBySlug: mocks.pages }));
vi.mock("../src/lib/wordpress/works", () => ({ works: mocks.works }));
const post = {
  id: 1,
  featured_media: 0,
  date: "2026-10-13",
  modified: "2026-10-13",
  slug: "conserto-de-capotas-de-fibra",
  name: "Conserto de Capotas de Fibra",
  html: "<p>Conteúdo nativo do CMS.</p>",
  summary: "Conteúdo nativo",
  url: "/conserto-de-capotas-de-fibra/",
  images: [],
} as Post;
const work = {
  ...post,
  id: 2,
  slug: "trabalho",
  name: "Trabalho publicado",
  url: "/trabalhos/trabalho/",
};
const base: SiteData = {
  kind: "",
  path: post.url,
  title: "",
  pages: [post],
  cities: [],
  search: {},
  tax: { brands: [], categories: [], models: [] },
};
beforeEach(() => {
  mocks.pages.mockReset();
  mocks.works.mockReset().mockResolvedValue({ items: [work] });
});
describe("Page de conserto com trabalhos compartilhados", () => {
  it("reutiliza Page já carregada e consulta trabalho uma única vez, paginado como a Home", async () => {
    const d = await page(base, post.slug);
    expect(d).toMatchObject({
      kind: "page",
      title: post.name,
      post,
      works: [work],
      path: post.url,
    });
    expect(mocks.pages).not.toHaveBeenCalled();
    expect(mocks.works).toHaveBeenCalledExactlyOnceWith({ per_page: 3 });
    const html = renderToStaticMarkup(<WordPressPage d={d} />);
    const section = renderToStaticMarkup(<WorksSection works={[work]} />);
    expect(html).toContain(section);
    expect(html.indexOf("Conteúdo nativo do CMS")).toBeLessThan(
      html.indexOf("Da escolha à estrada"),
    );
    expect(html.indexOf("</article>")).toBeLessThan(
      html.indexOf("Da escolha à estrada"),
    );
    expect(html).toContain('href="/trabalhos/trabalho/"');
    expect(html).toContain('href="/trabalhos/"');
  });
  it("não consulta/renderiza seção em outras Pages, mesmo com trabalhos nos dados", async () => {
    const other = { ...post, slug: "quem-somos", url: "/quem-somos/" };
    const d = await page(
      { ...base, pages: [other], path: other.url },
      other.slug,
    );
    expect(mocks.works).not.toHaveBeenCalled();
    expect(
      renderToStaticMarkup(<WordPressPage d={{ ...d, works: [work] }} />),
    ).not.toContain("Da escolha à estrada");
  });
  it("omite seção com lista vazia ou API indisponível sem perder conteúdo institucional", async () => {
    for (const failure of [false, true]) {
      if (failure) mocks.works.mockRejectedValue(new Error("API indisponível"));
      else mocks.works.mockResolvedValue({ items: [] });
      const d = await page(base, post.slug);
      const html = renderToStaticMarkup(<WordPressPage d={d} />);
      expect(html).toContain("Conteúdo nativo do CMS");
      expect(html).not.toContain("Da escolha à estrada");
    }
  });
  it("mantém busca por slug e 404 quando Page não está no contexto", async () => {
    mocks.pages.mockResolvedValue(undefined);
    await expect(page({ ...base, pages: [] }, post.slug)).rejects.toMatchObject(
      { isNotFound: true },
    );
    expect(mocks.works).not.toHaveBeenCalled();
  });
});
