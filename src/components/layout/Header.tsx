import { navigation } from "../../lib/navigation";
import { useState, useEffect } from "react";
import { Wordmark } from "./Wordmark";
import { useCart } from "../../lib/cart/context";
import { whatsapp } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";

import { MobileMenu } from "./MobileMenu";

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
  const links = navigation(pages);
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
      {open && <MobileMenu links={links} onClose={() => setOpen(false)} />}
    </header>
  );
}
