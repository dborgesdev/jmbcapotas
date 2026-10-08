import { WhatsAppLink } from "../common/WhatsAppLink";
import { useSiteConfig } from "../../lib/site/config-context";
import { useWhatsApp } from "../../lib/site/config-context";
import { Eyebrow } from "../common/Eyebrow";
import { Picture } from "../common/Picture";
import { type Media } from "../../lib/wordpress/types";
export function FinalCta({ image }: { image?: Media }) {
  const whatsapp = useWhatsApp();
  const config = useSiteConfig();
  image ??= config.finalCta;
  return (
    <section className="relative isolate overflow-hidden bg-[#1b1e21] text-white">
      {image && (
        <Picture
          image={image}
          alt=""
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/70" />
      <div className="wrap py-24 text-center md:py-32">
        <Eyebrow className="text-neutral-300">
          Sua picape. Seu próximo caminho.
        </Eyebrow>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
          Vamos encontrar o<br className="hidden md:block" /> produto certo para
          você
        </h2>
        <WhatsAppLink
          className="btn mt-9"
          href={whatsapp()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Converse com nossa equipe ↗
        </WhatsAppLink>
      </div>
    </section>
  );
}
