import type { SiteData, Search } from "./types";

export function catalogDestination(d: SiteData, selection: Search) {
  const category = d.tax.categories.find(
    (c) => String(c.id) === selection.categoria,
  );
  const brand = d.tax.brands.find((b) => String(b.id) === selection.marca);
  const model = d.tax.models.find(
    (m) =>
      String(m.id) === selection.modelo &&
      brand &&
      Number(m.acf?.marca) === brand.id,
  );
  const path = d.categoryId
    ? category
      ? `/produtos/${category.slug}/`
      : "/produtos/"
    : d.path;
  const search: Search = {
    q: selection.q || undefined,
    categoria: !d.categoryId && category ? String(category.id) : undefined,
    marca: !d.brandId && brand ? String(brand.id) : undefined,
    modelo: model ? String(model.id) : undefined,
  };
  return { to: "/$/" as const, params: { _splat: path.slice(1, -1) }, search };
}
