export function EditorialHeader({
  title,
  eyebrow,
  date,
}: {
  title: string;
  eyebrow: string;
  date?: string;
}) {
  return (
    <header className="max-w-4xl py-8">
      <p className="eyebrow text-red-600">{eyebrow}</p>
      <h1 className="section-title mt-5">{title}</h1>
      {date && (
        <time className="mt-6 block text-sm text-neutral-500" dateTime={date}>
          {new Date(date).toLocaleDateString("pt-BR")}
        </time>
      )}
    </header>
  );
}
