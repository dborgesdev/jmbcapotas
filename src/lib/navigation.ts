import type { Post } from "./wordpress/types";
import { whatsapp } from "./whatsapp";
export function navigation(pages: Post[]) {
  return [
    { name: "Início", url: "/" },
    { name: "Produtos", url: "/produtos/" },
    { name: "Pronta entrega", url: "/pronta-entrega/" },
    {
      name: "Empresa",
      url: pages.find((p) => /quem|empresa/.test(p.slug))?.url || "/#sobre",
    },
    { name: "Trabalhos", url: "/trabalhos/" },
    { name: "Blog", url: "/blog/" },
    ...(pages.some((p) => /contato/.test(p.slug))
      ? pages.filter((p) => /contato/.test(p.slug)).slice(0, 1)
      : [{ name: "Contato", url: whatsapp() }]),
  ];
}
