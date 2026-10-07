import { whatsapp } from "../../lib/whatsapp";
export function EmptyState({
  text = "Nenhum conteúdo publicado por aqui ainda.",
}: {
  text?: string;
}) {
  return (
    <div className="border-y border-neutral-200 py-14">
      <h2 className="text-xl font-bold">{text}</h2>
      <p className="mt-3 text-neutral-600">
        Você também pode falar com nossa equipe para encontrar o que precisa.
      </p>
      <a className="mt-6 inline-block font-bold underline" href={whatsapp()}>
        Falar com a JMB ↗
      </a>
    </div>
  );
}
