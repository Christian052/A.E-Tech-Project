import { useState, useMemo, useEffect } from "react";
import api from "../../api/axios";
import { getImageUrl } from "../utils/getImageUrl";

const CATEGORIES = [
  "all",
  "computer-repair",
  "printer-repair",
  "networking",
  "cctv",
  "training",
  "general",
];

const getImageUrl = (url) => {
  if (!url) return "https://placehold.co/400x300?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  
  const backendBase = import.meta.env.VITE_API_BASE_URL || "https://a-e-tech-project.onrender.com";
  const origin = backendBase.replace(/\/api.*$/, "").replace(/\/$/, "");
  let cleanPath = url.startsWith("/") ? url : `/${url}`;
  
  if (!cleanPath.startsWith("/uploads/") && !cleanPath.startsWith("/public/")) {
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

  // =========================================================
  // FILE SELECT & CLEANUP
  // =========================================================

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Select JPEG, PNG, or WEBP file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be ≤ 5MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile);
    e.target.value = "";
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // =========================================================
  // DRAG & DROP
  // =========================================================

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
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  // =========================================================
  // ACTIONS (UPLOAD / DELETE)
  // =========================================================

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }

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

      const { data } = await api.post("/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newItem = data.item || data;
      setItems((prev) => [newItem, ...prev]);

      setTitle("");
      setCategory("computer-repair");
      clearFile();
      setShowUpload(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload photo."
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete photo?")) return;

    try {
      await api.delete(`/gallery/${id}`);
      setItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete photo");
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // =========================================================
  // UPLOAD FORM VIEW
  // =========================================================

  if (showUpload) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Dark Hero Banner */}
        <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white py-10 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-1">
                MANAGEMENT
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Upload New Work
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowUpload(false);
                setError(null);
              }}
              className="rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-600 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              ← Back to Gallery
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          <form
            onSubmit={onSubmit}
            className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-md"
          >
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Server Maintenance Kigali"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {CATEGORIES.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>
                    {c.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Image File <span className="text-red-500">*</span>
              </label>

              {previewUrl ? (
                <div className="relative h-64 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-sm text-white hover:bg-slate-900"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${
                    isDragging
                      ? "border-teal-500 bg-teal-50/50"
                      : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <p className="text-sm text-slate-600">Drag & drop image here or</p>
                  <label className="mt-3 cursor-pointer rounded-full bg-teal-500 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-teal-600">
                    Select File
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span className="mt-2 text-xs text-slate-400">
                    JPEG, PNG, WEBP • Max 5MB
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="w-1/2 rounded-full border border-slate-300 bg-white py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 rounded-full bg-teal-500 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-teal-600 disabled:opacity-50"
              >
                {saving ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================
  // GALLERY MAIN MANAGER VIEW
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dark Hero Banner */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white py-14 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-2">
              GALLERY MANAGER
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
              Work from the bench and the field
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl font-light">
              Manage, upload, and clean up photos of repairs, installations, and training sessions in Kigali.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowUpload(true);
            }}
            className="shrink-0 rounded-full bg-teal-500 hover:bg-teal-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all self-start md:self-auto"
          >
            + Upload New Image
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedCategory === c
                  ? "bg-teal-500 text-white shadow-xs"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm my-8">
            No photos in this category yet.
          </div>
        )}

        {/* Gallery Grid */}
        {filteredItems.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const itemId = item._id || item.id;
              const rawImageUrl = item.imageUrl || item.image || item.url || item.path || item.src;
              const fullUrl = getImageUrl(rawImageUrl);

              return (
                <figure
                  key={itemId}
                  onClick={() => setSelectedImage({ url: fullUrl, title: item.title })}
                  className="group cursor-pointer overflow-hidden rounded bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
                >
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.title || "Gallery Item"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
                      }}
                    />

                    {/* Delete Action Button Overlay */}
                    <button
                      type="button"
                      onClick={(e) => onDelete(e, itemId)}
                      className="absolute top-3 right-3 rounded-md bg-red-600/90 hover:bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Caption Bar */}
                  {item.title && (
                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={item.title}>
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

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 text-white bg-slate-800/80 hover:bg-slate-700 rounded-full p-2.5 px-4 text-sm font-bold transition-colors z-10"
          >
            ✕ Close
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title || "Full preview"}
              className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            {selectedImage.title && (
              <p className="text-white text-center mt-3 text-sm font-medium bg-slate-900/60 px-4 py-1.5 rounded-full">
                {selectedImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}