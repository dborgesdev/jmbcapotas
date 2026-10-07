import { Picture } from "../common/Picture";
import { whatsapp } from "../../lib/whatsapp";
import { type Media } from "../../lib/wordpress/types";
export function HeroSection({ hero }: { hero?: Media }) {
  return (
    <section className="relative isolate flex min-h-[760px] items-center overflow-hidden bg-[#25282b] text-white md:min-h-[860px] md:h-[95svh] md:max-h-[1080px]">
      {hero && (
        <Picture
          image={hero}
          alt="Picape com capota de fibra JMB"
          eager
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/65" />
      <div className="wrap w-full pb-16 pt-36 text-center">
        <p className="eyebrow mb-7 text-white/80">
          JMB Capotas / Feita para sua picape
        </p>
        <h1 className="mx-auto max-w-4xl text-[44px] font-black leading-[1.02] tracking-[-.045em] md:text-[68px]">
          Pronta para o trabalho.
          <br />
          Feita para o seu caminho.
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/85 md:text-lg">
          Encontre a capota ideal para sua picape.
          <br />
          Escolha sua marca. Explore as possibilidades.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a className="btn" href="/produtos/">
            Explore os produtos ↗
          </a>
          <a
            className="btn-outline"
            href={whatsapp()}
            target="_blank"
            rel="noreferrer"
          >
            Fale com a JMB ↗
          </a>
        </div>
      </div>
      <div className="absolute bottom-8 left-5 right-5 flex justify-between border-t border-white/25 pt-5 text-[10px] uppercase tracking-[.2em] md:left-16 md:right-16">
        <span>Proteção que acompanha você</span>
        <a href="#marcas" aria-label="Escolha sua marca abaixo">
          Explore ↓
        </a>
      </div>
    </section>
  );
}
