import { useSiteConfig, useWhatsApp } from "../../lib/site/config-context";
import { phoneLabel, telephoneLink } from "../../lib/contacts";
export function FooterContacts() {
  const config = useSiteConfig();
  const whatsapp = useWhatsApp()();
  return (
    <div>
      <h2 className="eyebrow text-neutral-400">Fale com nossa equipe</h2>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-6">
        {config.telephone && (
          <a href={telephoneLink(config.telephone)}>
            <span aria-hidden="true">☎ </span>
            {phoneLabel(config.telephone)}
          </a>
        )}
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">↗ </span>WhatsApp{" "}
            {phoneLabel(config.whatsapp)}
          </a>
        )}
        {config.email && (
          <a className="break-words" href={`mailto:${config.email}`}>
            <span aria-hidden="true">✉ </span>
            {config.email}
          </a>
        )}
        {config.address &&
          (config.maps ? (
            <a href={config.maps} target="_blank" rel="noopener noreferrer">
              <span aria-hidden="true">⌖ </span>
              {config.address}
            </a>
          ) : (
            <p>{config.address}</p>
          ))}
        <div className="flex flex-wrap gap-4">
          {config.instagram && (
            <a
              href={config.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>
          )}
          {config.facebook && (
            <a href={config.facebook} target="_blank" rel="noopener noreferrer">
              Facebook ↗
            </a>
          )}
        </div>
        {config.payment && <p className="text-neutral-400">{config.payment}</p>}
      </div>
    </div>
  );
}
