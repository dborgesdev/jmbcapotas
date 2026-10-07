import type { Term } from "../../lib/wordpress/types";
import { headingText } from "../../lib/text";
import { Picture } from "../common/Picture";
export function CategoryCard({
  category,
  index,
  total,
}: {
  category: Term;
  index: number;
  total: number;
}) {
  return (
    <article
      aria-label={index + 1 + " de " + total + ": " + category.name}
      aria-roledescription="slide"
      className={
        "relative isolate h-[430px] shrink-0 snap-start overflow-hidden rounded-sm bg-[#25282b] text-white md:h-[550px] " +
        (total === 1 ? "basis-full" : "basis-[88%] md:basis-[78%]")
      }
    >
      <Picture
        image={category.image}
        alt={category.name}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <h3 className="text-3xl font-black tracking-tight md:text-5xl">
          {headingText(category.name)}
        </h3>
        {category.description && (
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85">
            {category.description}
          </p>
        )}
        <a href={"/produtos/" + category.slug + "/"} className="btn mt-6">
          Explore a linha ↗<span className="sr-only"> {category.name}</span>
        </a>
      </div>
    </article>
  );
}
