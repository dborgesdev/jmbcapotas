import { Wordmark } from "./Wordmark";
import { CONTACT_LABEL } from "../../lib/config";
import { whatsapp } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";

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
