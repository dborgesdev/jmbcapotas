import { afterEach, expect, it, vi } from "vitest";
const sources = vi.hoisted(() => ({
  tax: vi.fn(),
  pages: vi.fn(),
  cities: vi.fn(),
  config: vi.fn(),
}));
vi.mock("../src/lib/wordpress/taxonomies", () => ({ taxonomies: sources.tax }));
vi.mock("../src/lib/wordpress/pages", () => ({ pages: sources.pages }));
vi.mock("../src/lib/wordpress/cities", () => ({
  footerCities: sources.cities,
  cityLinks: vi.fn(),
}));
vi.mock("../src/lib/wordpress/site-config", () => ({
  siteConfig: sources.config,
}));
afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});
async function setup() {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(1000);
  sources.tax.mockResolvedValue({ brands: [], models: [], categories: [] });
  sources.pages.mockResolvedValue({ items: [], pages: 1 });
  sources.cities.mockResolvedValue([]);
  sources.config.mockResolvedValue({ address: "CMS" });
  return import("../src/lib/site/context");
}
it("reuses one normalized snapshot across paths, deduplicates concurrency and isolates route search", async () => {
  const { siteContext } = await setup();
  const search = { q: "primeiro" };
  const [a, b] = await Promise.all([
    siteContext("/a/", search),
    siteContext("/b/", { q: "segundo" }),
  ]);
  expect(sources.tax).toHaveBeenCalledTimes(1);
  expect(sources.pages).toHaveBeenCalledTimes(1);
  expect(a.base.tax).toBe(b.base.tax);
  expect(a.base.pages).toBe(b.base.pages);
  expect(a.base).not.toBe(b.base);
  a.base.search.q = "alterado";
  expect(search.q).toBe("primeiro");
  expect(b.base.search.q).toBe("segundo");
  expect(b.base.path).toBe("/b/");
  expect(b.base).not.toHaveProperty("post");
  expect(b.base).not.toHaveProperty("list");
  vi.setSystemTime(60_999);
  await siteContext("/c/", {});
  expect(sources.tax).toHaveBeenCalledTimes(1);
  vi.setSystemTime(61_001);
  sources.config.mockResolvedValue({ address: "Atualizado" });
  sources.tax.mockResolvedValue({ brands: [], models: [], categories: [] });
  const refreshed = await siteContext("/d/", {});
  expect(sources.tax).toHaveBeenCalledTimes(2);
  expect(refreshed.base.config?.address).toBe("Atualizado");
  expect(refreshed.base.tax).not.toBe(a.base.tax);
});
it("retries degraded globals after ten seconds and preserves taxonomy errors", async () => {
  const { siteContext } = await setup();
  const error = new Error("CMS temporary failure");
  sources.tax.mockRejectedValueOnce(error);
  const failed = await siteContext("/a/", {});
  expect(failed.taxUnavailable).toBe(true);
  expect(failed.requireTaxonomies).toThrow(error);
  await siteContext("/b/", {});
  expect(sources.tax).toHaveBeenCalledTimes(1);
  vi.setSystemTime(11_001);
  const recovered = await siteContext("/c/", {});
  expect(recovered.taxUnavailable).toBe(false);
  expect(recovered.requireTaxonomies).not.toThrow();
  expect(sources.tax).toHaveBeenCalledTimes(2);
});
it("recovers from page failure without caching a rejected in-flight promise", async () => {
  const { siteContext } = await setup();
  sources.pages.mockRejectedValueOnce(new Error("pages unavailable"));
  expect((await siteContext("/", {})).base.pages).toEqual([]);
  vi.setSystemTime(11_001);
  sources.pages.mockResolvedValue({ items: [{ id: 42 }], pages: 1 });
  expect((await siteContext("/", {})).base.pages).toEqual([{ id: 42 }]);
});
