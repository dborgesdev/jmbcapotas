import type { Client } from "../../lib/wordpress/clients";
import { Eyebrow } from "../common/Eyebrow";
export function ClientsMarquee({ clients = [] }: { clients?: Client[] }) {
  const logos = clients.filter((c) => c.logo);
  if (!logos.length) return null;
  const repeated = Array.from(
    { length: Math.max(1, Math.ceil(8 / logos.length)) },
    () => logos,
  ).flat();
  return (
    <section
      className="overflow-hidden border-b border-neutral-200 bg-white py-14"
      aria-label="Clientes JMB Capotas"
    >
      <div className="wrap text-center">
        <Eyebrow className="text-neutral-500">Clientes</Eyebrow>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">
          Quem conta com a JMB
        </h2>
      </div>
      <div
        className="clients-track mt-10 flex w-max"
        aria-label="Logos dos clientes"
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="clients-group flex shrink-0 items-center gap-12 px-6 md:gap-20 md:px-10"
          >
            {repeated.map((c, index) => (
              <li
                key={`${c.id}-${index}`}
                aria-hidden={index >= logos.length ? true : undefined}
                className="flex h-20 w-36 shrink-0 items-center justify-center"
              >
                <img
                  src={c.logo!.url}
                  width={c.logo!.width}
                  height={c.logo!.height}
                  alt={c.name}
                  loading="lazy"
                  className="max-h-16 max-w-full object-contain"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
