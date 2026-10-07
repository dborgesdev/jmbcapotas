import { useEffect, useState } from "react";
import { useCart } from "./cart";
import { whatsapp } from "../lib/whatsapp";
import { CONTACT_LABEL } from "../lib/config";
import type { Post } from "../lib/wordpress/types";
export function Wordmark() {
  return (
    <span className="flex flex-col leading-none">
      <span className="text-[35px] font-black italic tracking-[-3px]">
        JMB<span className="text-[#e3262e]">.</span>
      </span>
      <span className="mt-1 text-[9px] font-bold tracking-[.32em]">
        CAPOTAS
      </span>
    </span>
  );
}
export function Header({
  pages = [],
  home = false,
}: {
  pages?: Post[];
  home?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const { items } = useCart();
  const links = [
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
  return (
    <header
      className={`${home ? "absolute text-white" : "relative bg-[#151719] text-white"} inset-x-0 top-0 z-30 border-b border-white/15`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-5 md:px-10 lg:px-16">
        <a href="/" aria-label="JMB Capotas — início">
          <Wordmark />
        </a>
        <nav
          aria-label="Principal"
          className="hidden items-center gap-6 text-[13px] font-medium lg:flex"
        >
          {links.map((l) => (
            <a
              className="hover:underline underline-offset-4 decoration-red-500"
              key={l.url}
              href={l.url}
            >
              {l.name}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href="/produtos/" aria-label="Buscar produtos" className="text-xl">
            ⌕
          </a>
          <a
            href="/carrinho/"
            className="flex items-center gap-2 text-sm"
            aria-label={`Carrinho com ${items.reduce((n, p) => n + p.quantity, 0)} itens`}
          >
            <svg
              width="21"
              height="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 8h14l2 13H3L5 8Z" />
              <path d="M8 9V6a4 4 0 0 1 8 0v3" />
            </svg>
            <span>{items.reduce((n, p) => n + p.quantity, 0)}</span>
          </a>
          <a
            href={whatsapp()}
            className="hidden border border-white/40 px-4 py-2 text-xs xl:block"
          >
            Fale com a JMB ↗
          </a>
          <button
            className="p-2 lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu mobile"
          className="bg-[#151719] px-6 pb-7 text-white lg:hidden"
        >
          {links.map((l) => (
            <a
              className="block border-b border-white/10 py-4"
              key={l.url}
              href={l.url}
              onClick={() => setOpen(false)}
            >
              {l.name}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
export function Footer({
  pages = [],
  cities = [],
}: {
  pages?: Post[];
  cities?: Post[];
}) {
  return (
    <footer className="bg-[#101214] text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <a href="/" aria-label="JMB Capotas início">
            <Wordmark />
          </a>
          <p className="mt-6 max-w-56 text-sm leading-6 text-neutral-400">
            Capotas para sua picape.
            <br />
            Seu próximo caminho começa aqui.
          </p>
        </div>
        <div>
          <h2 className="eyebrow text-neutral-400">Explore</h2>
          <nav
            aria-label="Rodapé catálogo"
            className="mt-6 flex flex-col gap-3 text-sm"
          >
            <a href="/produtos/">Todos os produtos</a>
            <a href="/pronta-entrega/">Pronta entrega</a>
            <a href="/trabalhos/">Trabalhos / Galeria</a>
            <a href="/blog/">Blog</a>
            <a href="/carrinho/">Carrinho</a>
          </nav>
        </div>
        <div>
          <h2 className="eyebrow text-neutral-400">JMB Capotas</h2>
          <nav
            aria-label="Institucional"
            className="mt-6 flex flex-col gap-3 text-sm"
          >
            {pages.map((p) => (
              <a href={p.url} key={p.id}>
                {p.name}
              </a>
            ))}
            <a href="/cidades/">Cidades atendidas</a>
            {cities.slice(0, 4).map((p) => (
              <a href={p.url} key={p.id}>
                {p.name}
                {p.acf?.estado ? ` / ${p.acf.estado}` : ""}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="eyebrow text-neutral-400">Fale com nossa equipe</h2>
          <a className="mt-6 block text-xl font-bold" href={whatsapp()}>
            {CONTACT_LABEL} ↗
          </a>
          <p className="mt-5 text-sm leading-6 text-neutral-400">
            Parcelamento em até 12x.
            <br />
            Consulte condições de pagamento.
          </p>
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-xs text-neutral-400">
        <span>© {new Date().getFullYear()} JMB Capotas</span>
        <span>Feita para acompanhar você.</span>
      </div>
    </footer>
  );
}
