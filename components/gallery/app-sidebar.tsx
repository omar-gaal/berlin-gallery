export default function AppSidebar() {
  const navItems = [
    { label: "Gallery", icon: "◫" },
    { label: "Favorites", icon: "♡" },
  ];

  return (
    <aside className="flex h-screen flex-col border-r border-slate-200/50 bg-white px-6 py-8">
      <h1 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-900">
        Brothers Abroad
      </h1>
      <nav className="mt-12 space-y-2" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto" />
    </aside>
  );
}
