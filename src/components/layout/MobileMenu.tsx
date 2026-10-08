import { homeNavigation } from "../../lib/home-navigation";
import { ProductsDropdown } from "./ProductsDropdown";
import type { Term } from "../../lib/wordpress/types";
export function MobileMenu({
  links,
  onClose,
  brands = [],
}: {
  links: { name: string; url: string }[];
  onClose: () => void;
  brands?: Term[];
}) {
  return (
    <nav
      id="mobile-menu"
      aria-label="Menu mobile"
      className="max-h-[calc(100dvh-6rem)] overflow-y-auto bg-[#151719] px-6 pb-7 text-white lg:hidden"
    >
      {links.map((l) =>
        l.url === "/produtos/" ? (
          <ProductsDropdown
            key={l.url}
            brands={brands}
            mobile
            onSelect={onClose}
          />
        ) : (
          <a
            className="block border-b border-white/10 py-4"
            key={l.url}
            href={l.url}
            target={l.url.startsWith("https:") ? "_blank" : undefined}
            rel={l.url.startsWith("https:") ? "noopener noreferrer" : undefined}
            onClick={(event) => {
              onClose();
              homeNavigation(event);
            }}
          >
            {l.name}
          </a>
        ),
      )}
    </nav>
  );
}
