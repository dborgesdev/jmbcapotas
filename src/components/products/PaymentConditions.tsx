import { useSiteConfig } from "../../lib/site/config-context";
export function PaymentConditions() {
  const { payment } = useSiteConfig();
  return payment ? (
    <div className="mt-6 border border-neutral-300 bg-white p-5">
      <p className="text-base font-bold">{payment}</p>
    </div>
  ) : null;
}
