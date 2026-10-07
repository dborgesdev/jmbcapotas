import { NotFound } from "../pages/NotFound";
import { type SiteData } from "../lib/site/types";
import { Home } from "../pages/Home";
import { Catalog } from "../pages/Catalog";
import { Brand } from "../pages/Brand";
import { Category } from "../pages/Category";
import { ReadyDelivery } from "../pages/ReadyDelivery";
import { Product } from "../pages/Product";
import { Article } from "../pages/Article";
import { Work } from "../pages/Work";
import { City } from "../pages/City";
import { WordPressPage } from "../pages/WordPressPage";
import { Cities } from "../pages/Cities";
import { Cart } from "../pages/Cart";
import { Blog } from "../pages/Blog";
import { Works } from "../pages/Works";
import { SiteLayout } from "./layout/SiteLayout";
function PageView({ d }: { d: SiteData }) {
  switch (d.kind) {
    case "home":
      return <Home d={d} />;
    case "catalog": {
      const Page = d.brandId
        ? Brand
        : d.categoryId
          ? Category
          : d.path === "/pronta-entrega/"
            ? ReadyDelivery
            : Catalog;
      return <Page key={d.path + "-" + JSON.stringify(d.search)} d={d} />;
    }
    case "product":
      return <Product d={d} />;
    case "article":
      return <Article d={d} />;
    case "work":
      return <Work d={d} />;
    case "city":
      return <City d={d} />;
    case "page":
      return <WordPressPage d={d} />;
    case "cart":
      return <Cart d={d} />;
    case "cities":
      return <Cities d={d} />;
    case "blog":
      return <Blog d={d} />;
    case "works":
      return <Works d={d} />;
    default:
      return <NotFound />;
  }
}
export function SiteView({ data: d }: { data: SiteData }) {
  return (
    <SiteLayout d={d}>
      <PageView d={d} />
    </SiteLayout>
  );
}
