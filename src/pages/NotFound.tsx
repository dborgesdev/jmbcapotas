import { Eyebrow } from "../components/common/Eyebrow";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { FloatingWhatsApp } from "../components/common/FloatingWhatsApp";
export function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="wrap py-28">
        <Eyebrow className="text-red-600">404 / Caminho não encontrado</Eyebrow>
        <h1 className="mt-5 text-4xl font-black md:text-6xl">
          Vamos voltar à estrada
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
      <FloatingWhatsApp />
    </>
  );
}
