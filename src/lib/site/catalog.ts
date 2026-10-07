import { notFound } from "@tanstack/react-router";
import { products, readyProducts } from "../wordpress/products";
import type { SiteContext } from "./context";
export async function catalog(
  { base, requireTaxonomies }: SiteContext,
  title: string,
  brandId?: number,
  categoryId?: number,
  ready = false,
) {
  requireTaxonomies();
  const { search: s, tax } = base;
  const marca = brandId || Number(s.marca) || undefined;
  const modelo = tax.models.find(
    (m) => m.id === Number(s.modelo) && Number(m.acf?.marca) === marca,
  )?.id;
  const params = {
    search: s.q || "",
    page: s.pagina || 1,
    ...(marca ? { marca } : {}),
    ...(modelo ? { modelo } : {}),
    ...(categoryId || Number(s.categoria)
      ? { categoria_produto: categoryId || Number(s.categoria) }
      : {}),
  };
  const list = await (ready ? readyProducts : products)(params, tax.categories);
  if ((s.pagina || 1) > Math.max(1, list.pages)) throw notFound();
  return { ...base, kind: "catalog", title, brandId, categoryId, list };
}
