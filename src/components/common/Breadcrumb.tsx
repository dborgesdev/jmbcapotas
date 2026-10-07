export function Breadcrumb({
  title,
  parent,
}: {
  title: string;
  parent?: { name: string; url: string };
}) {
  const crumbs = [
    { name: "Início", url: "/" },
    ...(parent ? [parent] : []),
    { name: title, url: "" },
  ];
  return (
    <nav
      aria-label="Você está aqui"
      className="flex flex-wrap gap-2 py-6 text-xs text-neutral-500"
    >
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && (
            <span className="mr-2" aria-hidden="true">
              /
            </span>
          )}
          {c.url ? (
            <a href={c.url}>{c.name}</a>
          ) : (
            <span aria-current="page">{c.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
