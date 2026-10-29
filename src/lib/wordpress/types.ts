export type Media = {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
  srcSet: string;
};
export type AcfImage =
  | number
  | string
  | null
  | false
  | Media
  | {
      ID: number;
      url: string;
      alt: string;
      width: number;
      height: number;
      sizes?: Record<string, string | number>;
    };
export type RawPost = {
  _embedded?: { "wp:featuredmedia"?: unknown[] };
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  date: string;
  modified: string;
  categoria_produto?: number[];
  marca?: number[];
  modelo?: number[];
  categories?: number[];
  acf?: {
    codigo_produto?: string;
    pronta_entrega?: boolean;
    estado?: string;
    produto?: number[];
    galeria?: Record<string, AcfImage>;
  };
};
export type Term = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent?: number;
  acf?: {
    marca?: number;
    logo?: AcfImage;
    imagem?: AcfImage;
    imagem_fundo?: AcfImage;
  };
  image?: Media;
  background?: Media;
};
export type Post = Omit<RawPost, "title" | "content" | "_embedded"> & {
  name: string;
  html: string;
  summary: string;
  introduction?: string;
  images: Media[];
  url: string;
};
export type Collection<T> = { items: T[]; total: number; pages: number };
export type Taxonomies = { brands: Term[]; models: Term[]; categories: Term[] };
