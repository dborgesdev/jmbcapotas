import { WhatsAppLink } from "../common/WhatsAppLink";
import { useWhatsApp } from "../../lib/site/config-context";
import { homeNavigation } from "../../lib/home-navigation";
import { navigation } from "../../lib/navigation";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { useCart } from "../../lib/cart/context";
import { type Post } from "../../lib/wordpress/types";

import { MobileMenu } from "./MobileMenu";
import { ProductsDropdown } from "./ProductsDropdown";
import type { Term } from "../../lib/wordpress/types";

export function Header({
  pages = [],
  home = false,
  brands = [],
}: {
  pages?: Post[];
  home?: boolean;
  brands?: Term[];
}) {
  const whatsapp = useWhatsApp();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  const { items } = useCart();
  const links = navigation(pages, whatsapp());
  return (
    <>
      {!home && <div aria-hidden="true" className="h-20 md:h-24" />}
      <header
        className={`fixed inset-x-0 top-0 z-30 border-b border-white/15 text-white transition-colors duration-300 ${!home || scrolled || open ? "bg-[#151719]/95 backdrop-blur-md shadow-sm" : "bg-black/15"}`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 h-20 md:h-24 md:px-10 lg:px-16">
          <a
            href="/"
            onClick={homeNavigation}
            aria-label="JMB Capotas — início"
          >
            <Logo />
          </a>
          <nav
            aria-label="Principal"
            className="hidden items-center gap-4 text-[13px] font-medium lg:flex"
          >
            {links.map((l) =>
              l.url === "/produtos/" ? (
                <ProductsDropdown key={l.url} brands={brands} />
              ) : (
                <a
                  className="hover:underline underline-offset-4 decoration-red-500"
                  key={l.url}
                  href={l.url}
                  target={l.url.startsWith("https:") ? "_blank" : undefined}
                  rel={
                    l.url.startsWith("https:")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  onClick={homeNavigation}
                >
                  {l.name}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="/produtos/"
              aria-label="Buscar produtos"
              className="text-xl"
            >
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
            <WhatsAppLink
              href={whatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden border border-white/40 px-4 py-2 text-xs xl:block"
            >
              Fale com a JMB ↗
            </WhatsAppLink>
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
          <MobileMenu
            links={links}
            brands={brands}
            onClose={() => setOpen(false)}
          />
        )}
      </header>
    </>
  );
}
