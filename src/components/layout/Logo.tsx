import logo from "../../assets/logo-jmbcapotas.webp";
export function Logo() {
  return (
    <span className="inline-flex rounded-sm bg-white px-2 py-1">
      <img
        src={logo}
        width="500"
        height="212"
        alt="JMB Capotas"
        className="h-10 w-auto md:h-12"
      />
    </span>
  );
}
