import { afterEach, describe, expect, it, vi } from "vitest";
import { brazilianPhone, phoneLabel, telephoneLink } from "../src/lib/contacts";
import { paymentConditions } from "../src/lib/payment";
import { informationMessage, whatsapp } from "../src/lib/whatsapp";
import { brandSearch } from "../src/lib/site/brand-search";
afterEach(() => vi.unstubAllGlobals());
describe("Contatos brasileiros", () => {
  it.each([
    41998686072,
    "41998686072",
    "+55 (41) 99868-6072",
    "5541998686072",
    "0055 41 99868-6072",
  ])("normaliza %s sem duplicar país", (value) => {
    expect(brazilianPhone(value)).toBe("5541998686072");
    expect(phoneLabel(value)).toBe("(41) 99868-6072");
    expect(telephoneLink(value)).toBe("tel:+5541998686072");
  });
  it("aceita telefone fixo e DDD 55 sem confundir país", () => {
    expect(phoneLabel("4133334444")).toBe("(41) 3333-4444");
    expect(brazilianPhone("55999886072")).toBe("5555999886072");
  });
  it.each([undefined, null, "", "abc", 123, {}, Infinity])(
    "ignora contato inválido %s",
    (value) => expect(brazilianPhone(value)).toBeUndefined(),
  );
});
describe("Parcelamento", () => {
  it.each([undefined, null, "12", NaN, Infinity, 0, 1, -2, 2.5])(
    "omite valor inválido %s",
    (value) => expect(paymentConditions(value, false)).toBeUndefined(),
  );
  it("aplica as duas condições sem presumir juros", () => {
    expect(paymentConditions(12, true)).toBe(
      "Parcelamento em até 12x sem juros",
    );
    expect(paymentConditions(2, false)).toBe(
      "Parcelamento em até 2x. Consulte condições de pagamento.",
    );
    expect(paymentConditions(12, "true")).not.toContain("sem juros");
  });
});
describe("Configuração CMS e mensagens", () => {
  it("deduplica mídias, separa contatos e ignora links inseguros", async () => {
    vi.resetModules();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 875,
            source_url: "https://example.test/image.jpg",
            alt_text: "",
            media_details: { width: 1000, height: 600 },
          }),
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { normalizeSiteConfig } =
      await import("../src/lib/wordpress/site-config");
    const config = await normalizeSiteConfig({
      hero: 875,
      final_cta: 875,
      telefone: "4133334444",
      whatsapp: 41998686072,
      instagram: "javascript:alert(1)",
      parcelamento: 12,
      sem_juros: false,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(config.hero).toBe(config.finalCta);
    expect(config.telephone).toBe("554133334444");
    expect(config.whatsapp).toBe("5541998686072");
    expect(config.instagram).toBeUndefined();
  });
  it("tolera indisponibilidade de configuração", async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { siteConfig } = await import("../src/lib/wordpress/site-config");
    expect(await siteConfig()).toEqual({});
  });
  it("usa o contexto de produto e marca e exige número válido", () => {
    expect(whatsapp()).toBeUndefined();
    expect(whatsapp(undefined, "41998686072", { brand: "Fiat" })).toContain(
      "https://wa.me/5541998686072?text=",
    );
    expect(informationMessage({ brand: "Fiat" })).toContain(
      "produtos para Fiat",
    );
    const message = informationMessage({
      product: {
        name: "Capota",
        url: "/produtos/capota/",
        acf: { codigo_produto: "C1" },
      },
    });
    expect(message).toContain("informações sobre o produto Capota");
    expect(message).toContain("Código: C1");
    expect(message).toContain("https://jmbcapotas.com.br/produtos/capota/");
  });
});
describe("Troca de marca", () => {
  it("preserva busca/categoria, limpa modelo incompatível e paginação", () => {
    const tax = {
      brands: [],
      categories: [{ id: 3 }],
      models: [{ id: 4, acf: { marca: 1 } }],
    } as unknown as Parameters<typeof brandSearch>[2];
    expect(
      brandSearch(
        { q: "capota", categoria: "3", modelo: "4", pagina: 2, marca: "1" },
        "2",
        tax,
      ),
    ).toEqual({ q: "capota", categoria: "3", modelo: undefined });
    expect(brandSearch({ modelo: "4" }, "1", tax).modelo).toBe("4");
  });
});
