import type { Post } from "../../lib/wordpress/types";
import { headingText } from "../../lib/text";
import { whatsapp } from "../../lib/whatsapp";
import { Picture } from "../common/Picture";
import { Eyebrow } from "../common/Eyebrow";
export function InstitutionalSection({
  institutional,
}: {
  institutional?: Post;
}) {
  return (
    <section
      id="sobre"
      className="relative isolate flex min-h-145 items-center overflow-hidden bg-[#171a1d] text-white md:min-h-175"
    >
      <Picture
        image={institutional?.images[0]}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/70" />
      <div className="wrap w-full py-24 text-center">
        <Eyebrow className="text-white/75">Conheça a JMB</Eyebrow>
        <h2 className="section-title mx-auto mt-5 max-w-3xl">
          {headingText(institutional?.name || "Quem somos")}
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/85">
          {institutional?.introduction ||
            institutional?.summary ||
            "Explore os produtos para seu veículo e converse com a JMB para conhecer as opções para sua rotina."}
        </p>
        <a href={institutional?.url || whatsapp()} className="btn mt-8">
          {institutional ? "Conheça a JMB" : "Converse com a JMB"} ↗
        </a>
      </div>
    </section>
  );
}
