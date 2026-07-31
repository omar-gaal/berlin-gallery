export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
