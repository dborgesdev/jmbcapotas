import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { CartProvider } from "../components/cart";
import { Header, Footer } from "../components/layout";
import css from "../styles/app.css?url";
function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="wrap py-28">
        <p className="eyebrow text-red-600">404 / Caminho não encontrado</p>
        <h1 className="mt-5 text-4xl font-black md:text-6xl">
          Vamos voltar à estrada.
        </h1>
        <p className="my-6 text-neutral-600">
          A página que você procura não está disponível.
        </p>
        <a href="/produtos/" className="btn">
          Explorar produtos ↗
        </a>
        <a href="/" className="ml-6 underline">
          Ir para o início
        </a>
      </main>
      <Footer />
    </>
  );
}
function ErrorView() {
  const router = useRouter();
  return (
    <>
      <Header />
      <main id="main" className="wrap py-24">
        <h1 className="text-4xl font-bold">
          Conteúdo temporariamente indisponível
        </h1>
        <p className="my-6">
          Não conseguimos consultar o catálogo agora. Tente novamente em
          instantes.
        </p>
        <button className="btn" onClick={() => router.invalidate()}>
          Tentar novamente
        </button>
      </main>
      <Footer />
    </>
  );
}
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
