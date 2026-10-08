import { useEffect, useRef, useState } from "react";
import { brandUrl } from "../../lib/paths";
import type { Term } from "../../lib/wordpress/types";
export function ProductsDropdown({
  brands,
  mobile = false,
  onSelect,
}: {
  brands: Term[];
  mobile?: boolean;
  onSelect?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const selected = [...brands]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id - b.id)
    .slice(0, 5);
  return (
    <div
      ref={ref}
      className={mobile ? "border-b border-white/10" : "relative"}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={mobile ? "products-mobile" : "products-desktop"}
        onClick={() => setOpen(!open)}
        className={
          mobile
            ? "w-full py-4 text-left"
            : "py-2 hover:underline underline-offset-4"
        }
      >
        Produtos <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div
          id={mobile ? "products-mobile" : "products-desktop"}
          className={
            mobile
              ? "pb-4 pl-4"
              : "absolute left-0 top-full w-64 bg-[#151719] p-3 shadow-lg"
          }
        >
          {selected.map((brand) => (
            <a
              key={brand.id}
              href={brandUrl(brand)}
              className="block px-3 py-3 hover:bg-white/10 focus-visible:bg-white/10"
              onClick={() => {
                setOpen(false);
                onSelect?.();
              }}
            >
              {brand.name}
            </a>
          ))}
          <a
            href="/produtos/"
            className="block border-t border-white/20 px-3 py-3 hover:bg-white/10"
            onClick={() => {
              setOpen(false);
              onSelect?.();
            }}
          >
            Ver todos os produtos
          </a>
        </div>
      )}
    </div>
  );
}
