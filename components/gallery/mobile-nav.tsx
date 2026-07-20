const navItems = [
  { label: "Photos", icon: "🖼" },
  { label: "Tags", icon: "#" },
  { label: "Favorites", icon: "♥" },
  { label: "Albums", icon: "📁" },
];

export default function MobileNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-slate-200/30 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex flex-1 items-center justify-between gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex min-w-[0] flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[0.65rem] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-lg font-semibold text-white transition hover:bg-slate-800"
          aria-label="Upload photo"
        >
          +
        </button>
      </div>
    </nav>
  );
}
