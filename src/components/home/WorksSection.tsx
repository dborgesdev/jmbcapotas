import { headingText } from "../../lib/text";
import { Eyebrow } from "../common/Eyebrow";
import { Picture } from "../common/Picture";
import { type Post } from "../../lib/wordpress/types";
export function WorksSection({ works }: { works?: Post[] }) {
  return works?.length ? (
    <section className="bg-[#efefeb]">
      <div className="wrap py-20">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="text-red-600">04 / Na prática</Eyebrow>
            <h2 className="section-title mt-4">Da escolha à estrada</h2>
          </div>
          <a
            href="/trabalhos/"
            className="border-b border-neutral-400 pb-2 text-sm font-bold"
          >
            Ver trabalhos ↗
          </a>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {works.map((p) => (
            <a href={p.url} key={p.id} className="group">
              <Picture
                image={p.images[0]}
                alt={p.name}
                className="aspect-[16/10] w-full object-cover"
              />
              <h3 className="mt-5 flex justify-between text-lg font-bold">
                {headingText(p.name)}
                <span>↗</span>
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  ) : null;
}
