import { homeNavigation } from "../../lib/home-navigation";
export function MobileMenu({
  links,
  onClose,
}: {
  links: { name: string; url: string }[];
  onClose: () => void;
}) {
  return (
    <nav
      id="mobile-menu"
      aria-label="Menu mobile"
      className="max-h-[calc(100dvh-6rem)] overflow-y-auto bg-[#151719] px-6 pb-7 text-white lg:hidden"
    >
      {links.map((l) => (
        <a
          className="block border-b border-white/10 py-4"
          key={l.url}
          href={l.url}
          onClick={(event) => {
            onClose();
            homeNavigation(event);
          }}
        >
          {l.name}
        </a>
      ))}
    </nav>
  );
}
