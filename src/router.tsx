import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    trailingSlash: "always",
    defaultPendingComponent: () => (
      <div className="p-20 text-center" role="status">
        Carregando conteúdo…
      </div>
    ),
  });
}
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
