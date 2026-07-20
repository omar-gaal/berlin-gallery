type FilterChipsProps = {
  chips: string[];
  activeChip: string;
  onSelectChip: (chip: string) => void;
};

export default function FilterChips({
  chips,
  activeChip,
  onSelectChip,
}: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-6 py-3">
      {chips.map((chip) => {
        const isActive = chip === activeChip;

        return (
          <button
            key={chip}
            type="button"
            onClick={() => onSelectChip(chip)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
