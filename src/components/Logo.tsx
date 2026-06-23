export function Logo({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={compact ? "relative h-10 w-10 overflow-hidden" : "relative h-12 w-12 overflow-hidden"}>
        <img
          src="/brand/molare-logo.svg"
          alt="Molarè logo"
          className="h-full w-full object-contain"
        />
      </div>
      <span className={`serif-title ${inverted ? "text-ivory" : "text-aubergine"} ${compact ? "text-2xl" : "text-3xl"}`}>Molarè</span>
    </div>
  );
}
