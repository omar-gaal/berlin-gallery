"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const availableTags = ["Nature", "City", "Travel", "People", "Food"];

type UploadModalProps = {
  onClose: () => void;
  onUploadComplete: () => void;
};

type SelectedFile = {
  id: string;
  name: string;
  previewUrl: string;
  file: File;
};

export default function UploadModal({
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draftTag, setDraftTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }

    const mapped = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setSelectedFiles((current) => [...current, ...mapped]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((current) => {
      const next = current.filter((file) => file.id !== id);
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    );
  };

  const addDraftTag = () => {
    const trimmed = draftTag.trim();
    if (!trimmed) {
      return;
    }

    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!selectedTags.includes(normalized)) {
      setSelectedTags((current) => [...current, normalized]);
    }
    setDraftTag("");
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      return;
    }

    onUploadComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Upload photos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select images and assign tags locally.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            aria-label="Close upload modal"
          >
            Close
          </button>
        </div>

        <label
          htmlFor="photo-upload"
          className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-slate-400"
        >
          <span className="text-sm font-medium text-slate-700">
            Drop files here or browse
          </span>
          <span className="text-sm text-slate-500">
            PNG, JPG, WEBP up to your browser limits
          </span>
          <input
            id="photo-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Choose files
          </button>
        </label>

        {selectedFiles.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-xl border border-slate-200 p-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={file.previewUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-slate-700">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-sm text-slate-500 transition hover:text-slate-800"
                    aria-label={`Remove ${file.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={draftTag}
            onChange={(event) => setDraftTag(event.target.value)}
            placeholder="Add a tag"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-300"
          />
          <button
            type="button"
            onClick={addDraftTag}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Add
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
