import { useRef, useState } from "react";
import type { Term } from "../../lib/wordpress/types";
import { useReducedMotion } from "../../lib/use-reduced-motion";
import { Eyebrow } from "../common/Eyebrow";
import { CategoryCard } from "./CategoryCard";
export function CategorySection({ categories }: { categories: Term[] }) {
  const items = categories.filter((c) => !c.parent);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  if (!items.length) return null;
  function go(index: number) {
    const container = track.current;
    const slide = container?.children[index] as HTMLElement | undefined;
    if (container && slide)
      container.scrollTo({
        left: slide.offsetLeft,
        behavior: reduced ? "auto" : "smooth",
      });
  }
  function update() {
    const container = track.current;
    if (!container) return;
    const distances = items.map((_, i) =>
      Math.abs(
        (container.children[i] as HTMLElement).offsetLeft -
          container.scrollLeft,
      ),
    );
    setActive(distances.indexOf(Math.min(...distances)));
  }
  return (
    <section
      className="overflow-hidden bg-[#efefeb] py-20 md:py-28"
      aria-label="Categorias de produtos"
    >
      <div className="wrap text-center">
        <Eyebrow className="text-red-600">Linhas e possibilidades</Eyebrow>
        <h2 className="section-title mx-auto mb-12 mt-5 max-w-3xl">
          Seu veículo, suas possibilidades
        </h2>
      </div>
      <div className="wrap">
        <div
          ref={track}
          onScroll={update}
          tabIndex={0}
          aria-label="Carrossel de categorias; deslize para explorar"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              go(
                Math.max(
                  0,
                  Math.min(
                    items.length - 1,
                    active + (e.key === "ArrowRight" ? 1 : -1),
                  ),
                ),
              );
            }
          }}
          className="category-track relative flex snap-x snap-mandatory gap-6 overflow-x-auto"
        >
          {items.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              total={items.length}
            />
          ))}
          {items.length > 1 && (
            <div
              aria-hidden="true"
              className="basis-[calc(12%-1.5rem)] shrink-0 md:basis-[calc(22%-1.5rem)]"
            />
          )}
        </div>
        {items.length > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              className="h-11 w-11 border border-neutral-300 disabled:opacity-30"
              disabled={active === 0}
              onClick={() => go(active - 1)}
              aria-label="Categoria anterior"
            >
              ←
            </button>
            <div className="flex gap-2">
              {items.map((c, i) => (
                <button
                  key={c.id}
                  aria-label={"Ver categoria " + c.name}
                  aria-current={active === i ? "true" : undefined}
                  className="flex h-10 w-6 items-center justify-center"
                  onClick={() => go(i)}
                >
                  <span
                    className={
                      "h-2 w-2 rounded-full " +
                      (active === i ? "bg-red-600" : "bg-neutral-400")
                    }
                  />
                </button>
              ))}
            </div>
            <button
              className="h-11 w-11 border border-neutral-300 disabled:opacity-30"
              disabled={active === items.length - 1}
              onClick={() => go(active + 1)}
              aria-label="Próxima categoria"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
