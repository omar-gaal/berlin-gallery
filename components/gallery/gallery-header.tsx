type GalleryHeaderProps = {
  onUploadClick: () => void;
  userEmail: string;
};

export default function GalleryHeader({ onUploadClick, userEmail }: GalleryHeaderProps) {
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/50 px-6 py-4">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUploadClick}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Upload
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {initial}
        </div>
      </div>
    </div>
  );
}
