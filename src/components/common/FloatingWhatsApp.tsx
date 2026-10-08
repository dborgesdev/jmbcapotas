import { useWhatsApp } from "../../lib/site/config-context";
export function FloatingWhatsApp() {
  const href = useWhatsApp()();
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Atendimento pelo WhatsApp"
      className="fixed bottom-5 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#087b39] text-white shadow-md outline-offset-4 focus-visible:outline-2 md:bottom-7 md:right-7"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-8 w-8"
        fill="currentColor"
      >
        <path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 2a11 11 0 1 1-5.8 20.3l-.4-.2-3.9 1 1.1-3.8-.3-.4A11 11 0 0 1 16 5Zm-4 5c-.3-.7-.7-.7-1-.7-.6 0-1.8 1.4-1.8 3 0 3.3 4 7.7 8.5 9 .9.3 2.5.3 3.2-.4.7-.7 1.1-2 1-2.3-.1-.2-.4-.3-.9-.6l-2-1c-.4-.2-.7-.1-.9.2l-1 1.2c-.2.2-.4.3-.8.1-1.6-.7-3.1-2-4-3.5-.2-.3-.1-.5.1-.7l.8-1c.2-.3.3-.6.1-.9L12 10Z" />
      </svg>
    </a>
  );
}
