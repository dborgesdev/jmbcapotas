import { Breadcrumb } from "../components/common/Breadcrumb";
import { CartView } from "../components/cart/CartView";
import { type SiteData } from "../lib/site/types";
export function Cart({ d }: { d: SiteData }) {
  return (
    <div className="wrap pb-20">
      <Breadcrumb title={d.title} />
      <h1 className="section-title py-8">{d.title}</h1>
      <CartView />
    </div>
  );
}
