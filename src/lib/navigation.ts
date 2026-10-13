import type { Post } from "./wordpress/types";
import type { Term } from "./wordpress/types";

export const companyNavigation = [
  { name: "Quem Somos", url: "/quem-somos/" },
  { name: "A Fábrica", url: "/a-fabrica/" },
];

export function categoryNavigation(categories: Term[]) {
  const sorted = [...categories].sort(
    (a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id - b.id,
  );
  const visited = new Set<number>();
  const items: {
    name: string;
    url: string;
    depth?: number;
    divider?: boolean;
  }[] = [];
  function visit(term: Term, depth: number) {
    if (visited.has(term.id)) return;
    visited.add(term.id);
    const visible = term.count > 0;
    if (visible)
      items.push({ name: term.name, url: `/produtos/${term.slug}/`, depth });
    for (const child of sorted.filter((t) => t.parent === term.id)) {
      visit(child, depth + (visible ? 1 : 0));
    }
  }
  for (const term of sorted.filter(
    (t) => !t.parent || !categories.some((p) => p.id === t.parent),
  ))
    visit(term, 0);
  for (const term of sorted) visit(term, 0);
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
