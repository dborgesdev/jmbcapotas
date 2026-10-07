import { Picture } from "../common/Picture";
import { type SiteData } from "../../lib/site/types";
export function ModelSelector({ d }: { d: SiteData }) {
  const currentBrand = d.tax.brands.find((b) => b.id === d.brandId);
  const models = d.tax.models.filter(
    (m) => String(m.acf?.marca) === String(d.brandId),
  );
  return (
    <>
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
                <span className="mt-4 block text-sm font-bold">{m.name} ↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
