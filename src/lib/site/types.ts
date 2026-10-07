import type { Post, Taxonomies, Collection } from "../wordpress/types";
export type Search = {
  q?: string;
  categoria?: string;
  marca?: string;
  modelo?: string;
  pagina?: number;
  blogCategoria?: string;
};
export type SiteData = {
  kind: string;
  title: string;
  path: string;
  tax: Taxonomies;
  pages: Post[];
  cities: Post[];
  list?: Collection<Post>;
  post?: Post;
  works?: Post[];
  posts?: Post[];
  related?: Post[];
  blogCategories?: { id: number; name: string }[];
  search: Search;
  error?: string;
  brandId?: number;
  categoryId?: number;
};
