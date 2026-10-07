import { useState } from "react";
import { Header, Footer } from "./layout";
import { CartView, useCart } from "./cart";
import { SITE, WHATSAPP } from "../lib/config";
import { whatsapp, buyMessage } from "../lib/whatsapp";
import { brandUrl } from "../lib/paths";
import type { SiteData } from "../lib/wordpress/site";
import type { Media, Post } from "../lib/wordpress/types";

function Picture({
  image,
  alt,
  className = "",
  eager = false,
}: {
  image?: Media;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return image ? (
    <img
      src={image.url}
      srcSet={image.srcSet || undefined}
      sizes="(max-width: 768px) 100vw, 80vw"
      width={image.width}
      height={image.height}
      alt={image.alt || alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={className}
    />
  ) : null;
}
function Breadcrumb({
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
function Structured({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
function Cards({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((p) => (
        <a key={p.id} href={p.url} className="group block">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
            <Picture
              image={p.images[0]}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            />
            {p.acf?.pronta_entrega && (
              <span className="absolute bottom-4 left-4 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider">
                Pronta entrega
              </span>
            )}
          </div>
          <div className="flex justify-between gap-4 pt-5">
            <h3 className="text-lg font-bold leading-snug">{p.name}</h3>
            <span aria-hidden="true">↗</span>
          </div>
          {p.acf?.codigo_produto && (
            <p className="mt-2 text-xs text-neutral-500">
              Código {p.acf.codigo_produto}
            </p>
          )}
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
            {p.summary}
          </p>
        </a>
      ))}
    </div>
  );
}
function Empty({
  text = "Nenhum conteúdo publicado por aqui ainda.",
}: {
  text?: string;
}) {
  return (
    <div className="border-y border-neutral-200 py-14">
      <h2 className="text-xl font-bold">{text}</h2>
      <p className="mt-3 text-neutral-600">
        Você também pode falar com nossa equipe para encontrar o que precisa.
      </p>
      <a className="mt-6 inline-block font-bold underline" href={whatsapp()}>
        Falar com a JMB ↗
      </a>
    </div>
  );
}
function Cta({ image }: { image?: Media }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#1b1e21] text-white">
      {image && (
        <Picture
          image={image}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-black/70" />
      <div className="wrap py-24 text-center md:py-32">
        <p className="eyebrow text-neutral-300">
          Sua picape. Seu próximo caminho.
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
          Vamos encontrar a<br className="hidden md:block" /> capota certa para
          você.
        </h2>
        <a
          className="btn mt-9"
          href={whatsapp()}
          target="_blank"
          rel="noreferrer"
        >
          Converse com nossa equipe ↗
        </a>
      </div>
    </section>
  );
}
function Home({ d }: { d: SiteData }) {
  const hero = d.works?.[0]?.images[0] || d.post?.images[0];
  const institutional = d.pages.find((p) => /quem|empresa/.test(p.slug));
  return (
    <>
      <section className="relative isolate flex min-h-[760px] items-center overflow-hidden bg-[#25282b] text-white md:min-h-[860px] md:h-[95svh] md:max-h-[1080px]">
        {hero && (
          <Picture
            image={hero}
            alt="Picape com capota de fibra JMB"
            eager
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-black/65" />
        <div className="wrap w-full pb-16 pt-36 text-center">
          <p className="eyebrow mb-7 text-white/80">
            JMB Capotas / Feita para sua picape
          </p>
          <h1 className="mx-auto max-w-4xl text-[44px] font-black leading-[1.02] tracking-[-.045em] md:text-[68px]">
            Pronta para o trabalho.
            <br />
            Feita para o seu caminho.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/85 md:text-lg">
            Encontre a capota ideal para sua picape.
            <br />
            Escolha sua marca. Explore as possibilidades.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a className="btn" href="/produtos/">
              Explore os produtos ↗
            </a>
            <a
              className="btn-outline"
              href={whatsapp()}
              target="_blank"
              rel="noreferrer"
            >
              Fale com a JMB ↗
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-5 right-5 flex justify-between border-t border-white/25 pt-5 text-[10px] uppercase tracking-[.2em] md:left-16 md:right-16">
          <span>Proteção que acompanha você</span>
          <a href="#marcas" aria-label="Escolha sua marca abaixo">
            Explore ↓
          </a>
        </div>
      </section>
      <section id="marcas" className="wrap py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-red-600">01 / Encontre a sua</p>
            <h2 className="section-title mt-4">Qual é a sua picape?</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-neutral-500">
            Comece pela marca e encontre os produtos
            <br className="hidden md:block" /> para o seu modelo.
          </p>
        </div>
        {d.error && (
          <p role="status" className="mt-6">
            {d.error}
          </p>
        )}
        <div className="my-10 flex flex-wrap gap-3 border-y border-neutral-200 py-8">
          {d.tax.brands.map((b) => (
            <a
              key={b.id}
              href={brandUrl(b)}
              className="group flex min-h-32 min-w-44 flex-col items-center justify-center gap-3 px-10 transition-colors hover:bg-neutral-100"
            >
              {b.image && (
                <Picture
                  image={b.image}
                  alt={b.name}
                  className="h-16 w-24 object-contain"
                />
              )}
              <span className="text-xs font-bold tracking-widest">
                {b.name} ↗
              </span>
            </a>
          ))}
        </div>
        <a
          href="/produtos/"
          className="inline-flex gap-10 border-b-2 border-red-600 pb-3 text-sm font-bold"
        >
          Ver todos os produtos <span>↗</span>
        </a>
      </section>
      <section className="bg-[#171a1d] text-white">
        <div className="wrap py-16 md:py-24">
          <p className="eyebrow text-red-400">02 / Linhas e possibilidades</p>
          <h2 className="section-title mb-12 mt-4 max-w-2xl">
            Sua rotina pede.
            <br />
            Sua picape leva.
          </h2>
          {d.tax.categories
            .filter((c) => !c.parent)
            .map((c, i) => (
              <a
                href={`/produtos/${c.slug}/`}
                key={c.id}
                className="group grid items-center gap-8 border-t border-white/20 py-10 md:grid-cols-[.8fr_1.2fr]"
              >
                <div>
                  <span className="eyebrow text-neutral-500">
                    {String(i + 1).padStart(2, "0")} / Linha JMB
                  </span>
                  <h3 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                    {c.name}
                  </h3>
                  {c.description && (
                    <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400">
                      {c.description}
                    </p>
                  )}
                  <span className="mt-8 inline-flex gap-14 border-b border-white/40 pb-3 text-sm">
                    Explore a linha <span>↗</span>
                  </span>
                </div>
                <div className="overflow-hidden">
                  {(c.background ||
                    c.image ||
                    (d.post?.categoria_produto?.includes(c.id)
                      ? d.post.images[0]
                      : undefined)) && (
                    <Picture
                      image={c.background || c.image || d.post?.images[0]}
                      alt={c.name}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}
                </div>
              </a>
            ))}
        </div>
      </section>
      <section
        id="sobre"
        className="wrap grid items-center gap-10 py-20 md:grid-cols-2 md:gap-20 md:py-28"
      >
        <div className="relative">
          {(institutional?.images[0] || d.post?.images[1]) && (
            <Picture
              image={institutional?.images[0] || d.post?.images[1]}
              alt={
                institutional
                  ? institutional.name
                  : "Detalhe da capota de fibra"
              }
              className="aspect-[4/5] w-full object-cover"
            />
          )}
          <span className="absolute bottom-6 left-6 bg-white px-5 py-4 text-xs font-bold uppercase tracking-wider">
            JMB Capotas
          </span>
        </div>
        <div>
          <p className="eyebrow text-red-600">03 / Acompanhe seu caminho</p>
          <h2 className="section-title mt-5">
            Uma nova possibilidade
            <br />
            para sua picape.
          </h2>
          <p className="mt-7 text-base leading-8 text-neutral-600">
            {institutional?.summary ||
              "Conheça as capotas disponíveis para o seu veículo e fale com a nossa equipe para escolher a solução para sua rotina."}
          </p>
          <a
            href={institutional?.url || whatsapp()}
            className="mt-8 inline-flex gap-12 border-b-2 border-red-600 pb-3 text-sm font-bold"
          >
            {institutional ? "Conheça a JMB" : "Converse com a JMB"} ↗
          </a>
        </div>
      </section>
      {!!d.works?.length && (
        <section className="bg-[#efefeb]">
          <div className="wrap py-20">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-red-600">04 / Na prática</p>
                <h2 className="section-title mt-4">Da escolha à estrada.</h2>
              </div>
              <a
                href="/trabalhos/"
                className="border-b border-neutral-400 pb-2 text-sm font-bold"
              >
                Ver trabalhos ↗
              </a>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {d.works.map((p) => (
                <a href={p.url} key={p.id} className="group">
                  <Picture
                    image={p.images[0]}
                    alt={p.name}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <h3 className="mt-5 flex justify-between text-lg font-bold">
                    {p.name}
                    <span>↗</span>
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      {!!d.posts?.length && (
        <section className="wrap py-20">
          <div className="mb-12 flex flex-wrap justify-between gap-6">
            <h2 className="section-title">Na estrada com a JMB.</h2>
            <a href="/blog/" className="font-bold">
              Explore o blog ↗
            </a>
          </div>
          <Cards posts={d.posts} />
        </section>
      )}
      <Cta image={hero} />
    </>
  );
}
function Pagination({ d }: { d: SiteData }) {
  const page = d.search.pagina || 1;
  const href = (p: number) =>
    `${d.path}?${new URLSearchParams(
      Object.entries({ ...d.search, pagina: p })
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    )}`;
  return (d.list?.pages || 0) > 1 ? (
    <nav
      aria-label="Paginação"
      className="mt-14 flex items-center justify-center gap-6"
    >
      {page > 1 && (
        <a className="btn-outline" href={href(page - 1)}>
          ← Anterior
        </a>
      )}
      <span className="text-sm">
        {page} / {d.list?.pages}
      </span>
      {page < (d.list?.pages || 0) && (
        <a className="btn-outline" href={href(page + 1)}>
          Próxima →
        </a>
      )}
    </nav>
  ) : null;
}
function Catalog({ d }: { d: SiteData }) {
  const [brand, setBrand] = useState(String(d.brandId || d.search.marca || ""));
  const [model, setModel] = useState(d.search.modelo || "");
  const models = d.tax.models.filter((m) => String(m.acf?.marca) === brand);
  const currentBrand = d.tax.brands.find((b) => b.id === d.brandId);
  return (
    <>
      <div className="wrap pb-16">
        <Breadcrumb
          title={d.title}
          parent={{ name: "Produtos", url: "/produtos/" }}
        />
        <p className="eyebrow text-red-600">
          Catálogo JMB / Encontre sua solução
        </p>
        <h1 className="section-title mt-5 max-w-3xl">{d.title}</h1>
        {currentBrand && (
          <div className="my-10 border-y border-neutral-200 py-8">
            <h2 className="mb-6 text-lg font-bold">
              Escolha seu modelo {currentBrand.name}
            </h2>
            <div className="flex flex-wrap gap-6">
              {models.map((m) => (
                <a
                  key={m.id}
                  href={`${d.path}?modelo=${m.id}`}
                  className="w-48 border-b-2 border-neutral-200 pb-4 hover:border-red-600"
                >
                  <Picture
                    image={m.image}
                    alt={m.name}
                    className="h-28 w-full object-contain"
                  />
                  <span className="mt-4 block text-sm font-bold">
                    {m.name} ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
        <form
          action={d.path}
          method="get"
          className="my-10 grid items-end gap-4 border-y border-neutral-200 py-7 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
        >
          <label className="text-xs font-bold">
            Busca
            <input
              className="field mt-2"
              name="q"
              type="search"
              placeholder="O que sua picape precisa?"
              defaultValue={d.search.q}
            />
          </label>
          <label className="text-xs font-bold">
            Categoria
            <select
              className="field mt-2"
              name="categoria"
              defaultValue={d.categoryId || d.search.categoria || ""}
              disabled={!!d.categoryId}
            >
              <option value="">Todas as categorias</option>
              {d.tax.categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.parent ? "— " : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold">
            Marca
            <select
              className="field mt-2"
              name="marca"
              value={brand}
              disabled={!!d.brandId}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
              }}
            >
              <option value="">Todas as marcas</option>
              {d.tax.brands.map((b) => (
                <option value={b.id} key={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold">
            Modelo
            <select
              className="field mt-2"
              name="modelo"
              value={model}
              disabled={!brand}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="">
                {brand ? "Todos os modelos" : "Selecione a marca"}
              </option>
              {models.map((m) => (
                <option value={m.id} key={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn">Buscar ↗</button>
        </form>
        <div className="mb-8 flex justify-between text-xs text-neutral-500">
          <p>{d.list?.total || 0} produto(s) encontrado(s)</p>
          <a className="underline" href={d.path}>
            Limpar filtros
          </a>
        </div>
        {d.list?.items.length ? (
          <Cards posts={d.list.items} />
        ) : (
          <Empty text="Nenhum produto encontrado para esta seleção." />
        )}
        <Pagination d={d} />
      </div>
      <Cta />
    </>
  );
}
function Gallery({ post }: { post: Post }) {
  const [active, setActive] = useState(0);
  return post.images.length ? (
    <div>
      <Picture
        image={post.images[active]}
        alt={post.name}
        eager
        className="aspect-[4/3] w-full bg-neutral-100 object-contain"
      />
      {post.images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {post.images.map((m, i) => (
            <button
              aria-label={`Ver imagem ${i + 1} de ${post.name}`}
              aria-pressed={active === i}
              className={`w-24 border-2 ${active === i ? "border-red-600" : "border-transparent"}`}
              onClick={() => setActive(i)}
              key={m.id}
            >
              <Picture
                image={m}
                alt=""
                className="aspect-square object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  ) : (
    <p className="border-y border-neutral-200 py-10 text-neutral-500">
      Imagens deste produto ainda não disponíveis.
    </p>
  );
}
function Product({ d }: { d: SiteData }) {
  const p = d.post!;
  const { add, notice } = useCart();
  const categories = d.tax.categories.filter((c) =>
    p.categoria_produto?.includes(c.id),
  );
  const brands = d.tax.brands.filter((c) => p.marca?.includes(c.id));
  const models = d.tax.models.filter((c) => p.modelo?.includes(c.id));
  return (
    <div className="wrap pb-20">
      <Breadcrumb
        title={p.name}
        parent={{ name: "Produtos", url: "/produtos/" }}
      />
      <div className="grid gap-10 py-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <Gallery post={p} />
        <div>
          <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest text-red-600">
            {categories.map((c) => (
              <a key={c.id} href={`/produtos/${c.slug}/`}>
                {c.name}
              </a>
            ))}
          </div>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight md:text-4xl">
            {p.name}
          </h1>
          {p.acf?.codigo_produto && (
            <p className="mt-4 text-sm text-neutral-500">
              Código {p.acf.codigo_produto}
            </p>
          )}
          <div className="my-6 flex flex-wrap gap-3 text-sm">
            {brands.map((b) => (
              <a className="border-b" href={brandUrl(b)} key={b.id}>
                {b.name}
              </a>
            ))}
            {models.map((m) => (
              <span key={m.id}>{m.name}</span>
            ))}
          </div>
          {p.acf?.pronta_entrega && (
            <p className="mb-6 text-xs font-bold uppercase tracking-wider">
              ● Pronta entrega · Consulte disponibilidade
            </p>
          )}
          <p className="text-sm leading-7 text-neutral-600">{p.summary}</p>
          <div className="mt-8 flex flex-col gap-3">
            <a
              className="btn"
              href={whatsapp(buyMessage(p))}
              target="_blank"
              rel="noreferrer"
            >
              Comprar agora pelo WhatsApp ↗
            </a>
            <button className="btn-outline" onClick={() => add(p)}>
              Adicionar ao carrinho +
            </button>
          </div>
          {notice && (
            <p className="mt-4 text-sm">
              Adicionado!{" "}
              <a href="/carrinho/" className="underline">
                Ver carrinho →
              </a>
            </p>
          )}
          <p className="mt-7 text-xs leading-6 text-neutral-500">
            Parcelamento em até 12x. Consulte condições de pagamento.
          </p>
        </div>
      </div>
      <section className="border-t border-neutral-200 py-12">
        <h2 className="mb-8 text-2xl font-bold">Conheça os detalhes</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
      </section>
      {!!d.related?.length && (
        <section className="border-t border-neutral-200 pt-12">
          <h2 className="section-title mb-10">Outras possibilidades.</h2>
          <Cards posts={d.related} />
        </section>
      )}
      <Structured
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.summary,
          image: p.images.map((m) => m.url),
          ...(p.acf?.codigo_produto ? { sku: p.acf.codigo_produto } : {}),
          url: `${SITE}${p.url}`,
        }}
      />
    </div>
  );
}
function Editorial({ d }: { d: SiteData }) {
  const p = d.post!;
  return (
    <article className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <header className="max-w-4xl py-8">
        <p className="eyebrow text-red-600">
          {d.kind === "article"
            ? "Blog / Na estrada"
            : d.kind === "work"
              ? "Trabalhos / Galeria"
              : "JMB Capotas"}
        </p>
        <h1 className="section-title mt-5">{d.title}</h1>
        {d.kind === "article" && (
          <time
            className="mt-6 block text-sm text-neutral-500"
            dateTime={p.date}
          >
            {new Date(p.date).toLocaleDateString("pt-BR")}
          </time>
        )}
      </header>
      {d.kind === "work" ? (
        <div className="my-8 max-w-4xl">
          <Gallery post={p} />
        </div>
      ) : (
        <Picture
          image={p.images[0]}
          alt={p.name}
          className="my-10 max-h-[640px] w-full object-cover"
        />
      )}
      <div
        className="prose mt-8"
        dangerouslySetInnerHTML={{ __html: p.html }}
      />
      {!!d.related?.length && (
        <section className="mt-14">
          <h2 className="mb-8 text-2xl font-bold">Produtos deste trabalho</h2>
          <Cards posts={d.related} />
        </section>
      )}
      <a href={whatsapp()} className="btn mt-10">
        Fale com a JMB ↗
      </a>
      {d.kind === "article" && (
        <Structured
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.name,
            datePublished: p.date,
            dateModified: p.modified,
            image: p.images.map((m) => m.url),
            mainEntityOfPage: `${SITE}${p.url}`,
          }}
        />
      )}
    </article>
  );
}
export function SiteView({ data: d }: { data: SiteData }) {
  return (
    <>
      <Header home={d.kind === "home"} pages={d.pages} />
      <main id="main">
        {d.kind === "home" ? (
          <Home d={d} />
        ) : d.kind === "catalog" ? (
          <Catalog key={`${d.path}-${JSON.stringify(d.search)}`} d={d} />
        ) : d.kind === "product" ? (
          <Product d={d} />
        ) : d.post ? (
          <Editorial d={d} />
        ) : (
          <div className="wrap pb-20">
            <Breadcrumb title={d.title} />
            <h1 className="section-title py-8">{d.title}</h1>
            {d.kind === "cart" ? (
              <CartView />
            ) : d.kind === "cities" ? (
              d.cities.length ? (
                <ul className="mt-6 grid gap-4 md:grid-cols-3">
                  {d.cities.map((c) => (
                    <li key={c.id}>
                      <a
                        href={c.url}
                        className="block border-y border-neutral-300 py-6 text-xl font-bold"
                      >
                        {c.name} {c.acf?.estado} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty />
              )
            ) : (
              <>
                {d.kind === "blog" && (
                  <form action={d.path} className="mb-10 flex flex-wrap gap-3">
                    <label className="flex-1">
                      {" "}
                      <span className="sr-only">Buscar artigos</span>
                      <input
                        className="field"
                        name="q"
                        type="search"
                        placeholder="Buscar no blog"
                        defaultValue={d.search.q}
                      />
                    </label>
                    <label>
                      <span className="sr-only">Categoria do blog</span>
                      <select
                        className="field"
                        name="blogCategoria"
                        defaultValue={d.search.blogCategoria}
                      >
                        <option value="">Todas as categorias</option>
                        {d.blogCategories?.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="btn">Buscar ↗</button>
                  </form>
                )}
                {d.list?.items.length ? (
                  <Cards posts={d.list.items} />
                ) : (
                  <Empty
                    text={
                      d.kind === "blog"
                        ? "Em breve, novas histórias e dicas por aqui."
                        : "Nenhum trabalho publicado ainda."
                    }
                  />
                )}
                <Pagination d={d} />
              </>
            )}
          </div>
        )}
      </main>
      <Footer pages={d.pages} cities={d.cities} />
      {d.path !== "/" && (
        <Structured
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Início",
                item: SITE + "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: d.title,
                item: SITE + d.path,
              },
            ],
          }}
        />
      )}
      {d.kind === "home" && (
        <Structured
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "JMB Capotas",
            url: SITE,
            telephone: `+${WHATSAPP}`,
          }}
        />
      )}
    </>
  );
}
