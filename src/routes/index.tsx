import { createFileRoute } from "@tanstack/react-router";
import { loadSite } from "../lib/wordpress/site";
import { seo } from "../lib/seo";
import { SiteView } from "../components/site";
export const Route = createFileRoute("/")({
  loader: () => loadSite({ data: { path: "", search: {} } }),
  head: ({ loaderData }) => (loaderData ? seo(loaderData) : {}),
  component: () => <SiteView data={Route.useLoaderData()} />,
});
