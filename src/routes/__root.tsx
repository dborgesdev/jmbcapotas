import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { NotFound } from "../pages/NotFound";
import { ErrorView } from "../pages/ErrorView";
import css from "../styles/app.css?url";
import { loadPublicConfig } from "../lib/wordpress/public-config";
import { PublicConfigContext } from "../lib/site/config-context";
import { seo } from "../lib/seo";

function PublicOutlet() {
  const config = Route.useLoaderData();
  return (
    <PublicConfigContext.Provider value={{ config: config || {} }}>
      <Outlet />
    </PublicConfigContext.Provider>
  );
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => ({ requestedPath: location.pathname }),
  staleTime: 60_000,
  loader: () => loadPublicConfig(),
  head: ({ matches, match }) => {
    const missing = matches.some(
      (match) => match.status === "notFound" || match._notFound,
    );
    const fallback = missing
      ? seo({
          kind: "404",
          title: "Página não encontrada",
          path: match.context.requestedPath,
          tax: { brands: [], models: [], categories: [] },
          pages: [],
          cities: [],
          search: {},
        })
      : undefined;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        ...(fallback?.meta || [{ title: "JMB Capotas" }]),
      ],
      links: [
        { rel: "stylesheet", href: css },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        ...(fallback?.links || []),
      ],
    };
  },
  component: () => (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip" href="#main">
          Pular para o conteúdo
        </a>
        <PublicOutlet />
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});
