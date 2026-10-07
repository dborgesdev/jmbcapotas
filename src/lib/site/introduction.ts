import type { SiteData } from "./types";
export function introduction(d: SiteData) {
  if (d.path === "/pronta-entrega/")
    return "Confira os produtos marcados como pronta entrega e converse com nossa equipe para confirmar a disponibilidade e as condições de compra.";
  const term =
    d.tax.brands.find((t) => t.id === d.brandId) ||
    d.tax.categories.find((t) => t.id === d.categoryId);
  if (term?.description) return term.description;
  if (d.post?.introduction || d.post?.summary)
    return d.post.introduction || d.post.summary!;
  if (d.brandId)
    return (
      "Explore os produtos para " +
      term?.name +
      " e confira a compatibilidade com seu modelo. Converse com a JMB para escolher a opção para sua rotina."
    );
  if (d.categoryId)
    return "Explore as opções desta categoria e confira os detalhes de cada produto. Nossa equipe pode ajudar você a escolher a opção para seu veículo.";
  const fallback: Record<string, string> = {
    catalog:
      "Encontre produtos para seu veículo, filtre por marca, modelo ou categoria e confira as opções. Fale com a JMB para esclarecer dúvidas de compatibilidade.",
    ready:
      "Confira os produtos marcados como pronta entrega e converse com nossa equipe para confirmar a disponibilidade e as condições de compra.",
    blog: "Explore os artigos publicados pela JMB e encontre informações para orientar sua escolha.",
    works:
      "Conheça os trabalhos publicados pela JMB e explore os detalhes de cada projeto.",
    cities:
      "Encontre sua cidade e converse com a JMB para conhecer as opções para seu veículo.",
    city: "Conheça as opções para sua picape e converse com nossa equipe para conferir a compatibilidade e as condições de compra.",
  };
  return (
    fallback[d.kind] ||
    "Conheça as informações publicadas pela JMB e converse com nossa equipe para esclarecer suas dúvidas."
  );
}
