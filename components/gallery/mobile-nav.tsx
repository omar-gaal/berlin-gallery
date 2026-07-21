const navItems = [
  { label: "Photos", icon: "🖼" },
  { label: "Favorites", icon: "♡" },
];

export default function MobileNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-slate-200/30 bg-white/95 backdrop-blur-sm lg:hidden">
      <div
        className="flex items-center justify-between gap-2 px-3 py-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex min-w-[0] flex-1 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[0.75rem] font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
