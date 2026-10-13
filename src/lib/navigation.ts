import { categoryTree } from "./categories";
import type { Post } from "./wordpress/types";
import type { Term } from "./wordpress/types";

export const companyNavigation = [
  { name: "Quem Somos", url: "/quem-somos/" },
  { name: "A Fábrica", url: "/a-fabrica/" },
];

export function categoryNavigation(categories: Term[]) {
  const items: { name: string; url: string; divider?: boolean }[] =
    categoryTree(categories)
      .filter(({ term }) => term.parent === 0)
      .map(({ term }) => ({ name: term.name, url: `/produtos/${term.slug}/` }));
  items.push({
    name: "Ver todos os produtos",
    url: "/produtos/",
    divider: true,
  });
  return items;
}

export function navigation(pages: Post[], contact?: string) {
  return [
    { name: "Início", url: "/" },
    { name: "Produtos", url: "/produtos/" },
    { name: "Pronta entrega", url: "/pronta-entrega/" },
    {
      name: "Empresa",
      url: "/quem-somos/",
    },
    { name: "Galeria", url: "/trabalhos/" },
    { name: "Blog", url: "/blog/" },
    ...(pages.some((p) => /contato/.test(p.slug))
      ? pages.filter((p) => /contato/.test(p.slug)).slice(0, 1)
      : contact
        ? [{ name: "Contato", url: contact }]
        : []),
  ];
}
