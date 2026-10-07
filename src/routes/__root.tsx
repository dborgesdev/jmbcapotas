import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { CartProvider } from "../components/cart/CartProvider";
import { NotFound } from "../pages/NotFound";
import { ErrorView } from "../pages/ErrorView";
import css from "../styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JMB Capotas" },
    ],
    links: [
      { rel: "stylesheet", href: css },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  component: () => (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <a className="skip" href="#main">
          Pular para o conteúdo
        </a>
        <CartProvider>
          <Outlet />
        </CartProvider>
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
});
