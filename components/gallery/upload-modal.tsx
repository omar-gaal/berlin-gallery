"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const availableTags = ["Nature", "City", "Travel", "People", "Food"];

type UploadModalProps = {
  onClose: () => void;
  onUploadComplete: () => void | Promise<void>;
};

type SelectedFile = {
  id: string;
  name: string;
  previewUrl: string;
  file: File;
};

const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;
const SUPPORTED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function UploadModal({
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [draftTag, setDraftTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(selectedFile.previewUrl);
      }
    };
  }, [selectedFile]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const [file] = Array.from(files);

    if (!file) {
      return;
    }

    if (!SUPPORTED_UPLOAD_MIME_TYPES.has(file.type)) {
      setErrorMessage(
        "Unsupported file type. Use JPEG, PNG, or WebP. iPhone HEIC photos are not supported yet.",
      );
      return;
    }

    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }

    setSelectedFile({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    });
    setErrorMessage(null);
  };

  const removeFile = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }

    setSelectedFile(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTag((current) => (current === tag ? "" : tag));
    setErrorMessage(null);
  };

  const addDraftTag = () => {
    const trimmed = draftTag.trim();
    if (!trimmed) {
      return;
    }

    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    setSelectedTag(normalized);
    setDraftTag("");
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || isSubmitting) {
      return;
    }

    if (!selectedTag.trim()) {
      setErrorMessage("Please choose a tag before uploading.");
      return;
    }

    if (selectedFile.file.size <= 0) {
      setErrorMessage("The selected file is empty.");
      return;
    }

    if (selectedFile.file.size > MAX_UPLOAD_SIZE_BYTES) {
      setErrorMessage("File is too large. Maximum size is 15 MB.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile.file);
      formData.append("tag", selectedTag.trim());

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Upload failed. Please try again.";

        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            message = payload.error;
          }
        } catch {
          // Keep fallback message when response body is unavailable.
        }

        setErrorMessage(message);
        return;
      }

      setSelectedFile(null);
      setSelectedTag("");
      setDraftTag("");
      await onUploadComplete();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="my-3 w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:my-0 sm:max-h-[calc(100dvh-3rem)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Upload photos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select one image and one tag to upload.
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
            PNG, JPG, WEBP up to 15 MB
          </span>
          <input
            id="photo-upload"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
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

        {selectedFile ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              key={selectedFile.id}
              className="rounded-xl border border-slate-200 p-2"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={selectedFile.previewUrl}
                  alt={selectedFile.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm text-slate-700">
                  {selectedFile.name}
                </p>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-sm text-slate-500 transition hover:text-slate-800"
                  aria-label={`Remove ${selectedFile.name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = selectedTag === tag;
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
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 outline-none focus:border-slate-300 sm:text-sm"
          />
          <button
            type="button"
            onClick={addDraftTag}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Add
          </button>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            aria-live="polite"
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {errorMessage}
          </p>
        ) : null}

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
            disabled={!selectedFile || isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
