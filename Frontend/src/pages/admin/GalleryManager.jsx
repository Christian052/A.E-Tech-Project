import { useState, useMemo, useEffect } from "react";
import api from "../../api/axios";

const CATEGORIES = [
  "all",
  "computer-repair",
  "printer-repair",
  "networking",
  "cctv",
  "training",
  "general",
];

/* =========================================================
   IMAGE URL HELPER

   Supabase Storage / External HTTPS URLs:
   https://uokidhjbmmlquhijgzd.supabase.co/...
   are returned directly.

   Old/local image paths:
   /uploads/...
   are converted to the backend URL.
========================================================= */

const getImageUrl = (url) => {
  if (!url) {
    return "https://placehold.co/400x300?text=No+Image";
  }

  // Supabase / External HTTPS URLs
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const backendBase =
    import.meta.env.VITE_API_BASE_URL ||
    "https://a-e-tech-project.onrender.com";

  const origin = backendBase
    .replace(/\/api.*$/, "")
    .replace(/\/$/, "");

  let cleanPath = url.startsWith("/") ? url : `/${url}`;

  // Keep existing /uploads and /public paths
  if (
    !cleanPath.startsWith("/uploads/") &&
    !cleanPath.startsWith("/public/")
  ) {
    cleanPath = `/uploads${cleanPath}`;
  }

  return `${origin}${cleanPath}`;
};

export default function GalleryManager({ items = [], setItems }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("computer-repair");

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  /* =========================================================
     FILE SELECT
  ========================================================= */

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    /* -----------------------------------------------
       Validate file type
    ------------------------------------------------ */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Select a JPEG, PNG, or WEBP image.");
      return;
    }

    /* -----------------------------------------------
       Validate file size
    ------------------------------------------------ */

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be 5MB or smaller.");
      return;
    }

    /* -----------------------------------------------
       Clean previous preview
    ------------------------------------------------ */

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    /* -----------------------------------------------
       Set new file
    ------------------------------------------------ */

    setError(null);
    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  /* =========================================================
     FILE INPUT
  ========================================================= */

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    handleFileSelect(selectedFile);

    // Allows selecting the same file again
    e.target.value = "";
  };

  /* =========================================================
     CLEAR FILE
  ========================================================= */

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl(null);
  };

  /* =========================================================
     CLEANUP OBJECT URL
  ========================================================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];

    handleFileSelect(droppedFile);
  };

  /* =========================================================
     UPLOAD
     
     Flow: React -> Express API -> Supabase Storage -> MongoDB
  ========================================================= */

  const onSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    /* -----------------------------------------------
       Validate title
    ------------------------------------------------ */

    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }

    /* -----------------------------------------------
       Validate image
    ------------------------------------------------ */

    if (!file) {
      setError("Please select an image.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("image", file);

      const { data } = await api.post(
        "/gallery",
        formData
      );

      const newItem = data?.item;

      if (!newItem) {
        throw new Error(
          "Upload succeeded but the server did not return the gallery item."
        );
      }

      /* -----------------------------------------------
         Add new item to gallery
      ------------------------------------------------ */

      setItems((prev) => [newItem, ...prev]);

      /* -----------------------------------------------
         Reset form
      ------------------------------------------------ */

      setTitle("");
      setCategory("computer-repair");

      clearFile();

      setShowUpload(false);
    } catch (err) {
      console.error("Gallery upload error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload photo."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const onDelete = async (e, id) => {
    e.stopPropagation();

    if (!id) {
      alert("Invalid gallery item.");
      return;
    }

    if (!window.confirm("Delete this photo?")) {
      return;
    }

    try {
      await api.delete(`/gallery/${id}`);

      setItems((prev) =>
        prev.filter(
          (item) => (item._id || item.id) !== id
        )
      );

      /* Close modal if deleted item was selected */
      setSelectedImage(null);
    } catch (err) {
      console.error("Gallery delete error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete photo."
      );
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return items;
    }

    return items.filter(
      (item) => item.category === selectedCategory
    );
  }, [items, selectedCategory]);

  /* =========================================================
     UPLOAD FORM
  ========================================================= */

  if (showUpload) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* HERO */}
        <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-4 py-8 text-white sm:px-6 md:px-12 md:py-10 lg:px-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-teal-400">
                MANAGEMENT
              </span>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                Upload New Work
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowUpload(false);
                setError(null);
              }}
              className="w-full rounded-full border border-slate-600 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 sm:w-auto"
            >
              ← Back to Gallery
            </button>
          </div>
        </div>

        {/* FORM */}
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
          <form
            onSubmit={onSubmit}
            className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md sm:p-6 md:p-8"
          >
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                required
                disabled={saving}
                placeholder="e.g. Server Maintenance Kigali"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100"
              >
                {CATEGORIES.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>
                    {c.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Image File <span className="text-red-500">*</span>
              </label>

              {previewUrl ? (
                <div className="relative h-56 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-64">
                  <img
                    src={previewUrl}
                    alt="Selected preview"
                    className="h-full w-full object-cover"
                  />

                  {!saving && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-sm text-white transition hover:bg-slate-900"
                      aria-label="Remove selected image"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex min-h-[220px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition sm:p-8 ${
                    isDragging
                      ? "border-teal-500 bg-teal-50/50"
                      : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="mb-3 text-4xl">🖼️</div>

                  <p className="text-sm text-slate-600">
                    Drag & drop image here or
                  </p>

                  <label className="mt-3 cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-teal-600">
                    Select File
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onFileChange}
                      disabled={saving}
                      className="sr-only"
                    />
                  </label>

                  <span className="mt-2 text-xs text-slate-400">
                    JPEG, PNG, WEBP • Max 5MB
                  </span>
                </div>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowUpload(false);
                  setError(null);
                }}
                className="w-full rounded-full border border-slate-300 bg-white py-3 text-xs font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-1/2"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !file || !title.trim()}
                className="w-full rounded-full bg-teal-500 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-1/2"
              >
                {saving
                  ? "Uploading to Supabase..."
                  : "Upload Photo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN GALLERY
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-4 py-10 text-white sm:px-6 md:px-12 md:py-14 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-teal-400">
              GALLERY MANAGER
            </span>

            <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Work from the bench and the field
            </h1>

            <p className="max-w-2xl text-sm font-light text-slate-300 md:text-base">
              Manage, upload, and clean up photos of repairs, installations, and
              training sessions in Kigali.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowUpload(true);
            }}
            className="w-full shrink-0 rounded-full bg-teal-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-teal-600 sm:w-auto"
          >
            + Upload New Image
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-12 lg:px-20">
        {/* CATEGORY FILTERS */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedCategory === c
                  ? "bg-teal-500 text-white shadow-sm"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredItems.length === 0 && (
          <div className="my-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 sm:p-12">
            No photos in this category yet.
          </div>
        )}

        {/* GALLERY GRID */}
        {filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const itemId = item._id || item.id;

              const rawImageUrl =
                item.imageUrl ||
                item.image ||
                item.url ||
                item.path ||
                item.src;

              const fullUrl = getImageUrl(rawImageUrl);

              return (
                <figure
                  key={itemId}
                  onClick={() =>
                    setSelectedImage({
                      url: fullUrl,
                      title: item.title,
                    })
                  }
                  className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                >
                  {/* IMAGE */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 sm:h-60">
                    <img
                      src={fullUrl}
                      alt={item.title || "Gallery Item"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/400x300?text=Image+Not+Found";
                      }}
                    />

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={(e) => onDelete(e, itemId)}
                      className="absolute right-3 top-3 rounded-md bg-red-600/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md transition-colors hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>

                  {/* CAPTION */}
                  {item.title && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-white p-3">
                      <p
                        className="truncate text-xs font-semibold text-slate-800"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                    </div>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-3 top-3 z-10 rounded-full bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 sm:right-5 sm:top-5"
          >
            ✕ Close
          </button>

          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title || "Full preview"}
              className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl sm:max-h-[80vh]"
            />

            {selectedImage.title && (
              <p className="mt-3 max-w-[90vw] rounded-full bg-slate-900/60 px-4 py-1.5 text-center text-sm font-medium text-white">
                {selectedImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}