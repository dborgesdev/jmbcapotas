export function ProductAvailability() {
  return (
    <div className="my-6 flex items-start gap-4 border border-red-800 border-b-4 bg-[#b91c27] p-5 text-white shadow-[4px_4px_0_#e5e5e5]">
      <span aria-hidden="true" className="text-2xl">
        ✓
      </span>
      <div>
        <h2 className="text-lg font-bold">Pronta entrega</h2>
        <p className="mt-1 text-sm text-white/90">
          Consulte a disponibilidade com nossa equipe.
        </p>
      </div>
    </div>
  );
}
