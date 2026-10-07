import { useRouter } from "@tanstack/react-router";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
export function ErrorView() {
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
