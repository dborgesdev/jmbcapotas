import { Picture } from "../common/Picture";
import { whatsapp } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";
export function InstitutionalSection({
  institutional,
  product,
}: {
  institutional?: Post;
  product?: Post;
}) {
  return (
    <section
      id="sobre"
      className="wrap grid items-center gap-10 py-20 md:grid-cols-2 md:gap-20 md:py-28"
    >
      <div className="relative">
        {(institutional?.images[0] || product?.images[1]) && (
          <Picture
            image={institutional?.images[0] || product?.images[1]}
            alt={
              institutional ? institutional.name : "Detalhe da capota de fibra"
            }
            className="aspect-[4/5] w-full object-cover"
          />
        )}
        <span className="absolute bottom-6 left-6 bg-white px-5 py-4 text-xs font-bold uppercase tracking-wider">
          JMB Capotas
        </span>
      </div>
      <div>
        <p className="eyebrow text-red-600">03 / Acompanhe seu caminho</p>
        <h2 className="section-title mt-5">
          Uma nova possibilidade
          <br />
          para sua picape.
        </h2>
        <p className="mt-7 text-base leading-8 text-neutral-600">
          {institutional?.summary ||
            "Conheça as capotas disponíveis para o seu veículo e fale com a nossa equipe para escolher a solução para sua rotina."}
        </p>
        <a
          href={institutional?.url || whatsapp()}
          className="mt-8 inline-flex gap-12 border-b-2 border-red-600 pb-3 text-sm font-bold"
        >
          {institutional ? "Conheça a JMB" : "Converse com a JMB"} ↗
        </a>
      </div>
    </section>
  );
}
