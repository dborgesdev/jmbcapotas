import { createFileRoute } from "@tanstack/react-router";
import { loadSite } from "../lib/wordpress/site";
import { validateSearch } from "../lib/search";
import { seo } from "../lib/seo";
import { SiteView } from "../components/site";
export const Route = createFileRoute("/$")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) =>
    loadSite({ data: { path: params._splat || "", search: deps } }),
  head: ({ loaderData }) => (loaderData ? seo(loaderData) : {}),
  component: () => <SiteView data={Route.useLoaderData()} />,
});
