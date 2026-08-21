import { useState } from "react";
import api from "../../api/axios";

// Helper to sanitize and resolve backend image paths
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const backendBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const origin = backendBase.replace(/\/api\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
};

const emptyForm = {
  title: "",
  description: "",
  durationWeeks: 4,
  startDate: "",
  seatsAvailable: 0,
  isActive: true,
  imageUrl: "",
};

export default function TrainingManager({ programs = [], setPrograms }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title,
      description: p.description,
      durationWeeks: p.durationWeeks,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      seatsAvailable: p.seatsAvailable ?? 0,
      isActive: p.isActive,
      imageUrl: p.imageUrl || "",
    });
    setError(null);
    setActiveTab("form");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setActiveTab("list");
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    setError(null);

    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let returnedUrl = data.url || data.imageUrl;
      setForm((f) => ({ ...f, imageUrl: returnedUrl }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Build safe payload - convert empty string imageUrl to undefined or trimmed string
      const payload = {
        ...form,
        durationWeeks: Number(form.durationWeeks) || 1,
        seatsAvailable: Number(form.seatsAvailable) || 0,
        startDate: form.startDate || undefined,
        imageUrl: form.imageUrl?.trim() ? form.imageUrl.trim() : "",
      };

      if (editingId) {
        const { data } = await api.patch(`/training-programs/${editingId}`, payload);
        setPrograms((prev) => prev.map((p) => (p._id === editingId ? data.program : p)));
      } else {
        const { data } = await api.post("/training-programs", payload);
        setPrograms((prev) => [...prev, data.program]);
      }
      resetForm();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        errs
          ? errs.map((x) => x.message).join(", ")
          : err.response?.data?.message || "Failed to save program"
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this program? This action cannot be undone.")) return;
    try {
      await api.delete(`/training-programs/${id}`);
      setPrograms((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete program");
    }
  };

  const activeCount = programs.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Program Management</h2>
          <p className="text-sm text-slate-500">
            Create, edit, and publish technical training courses and internships.
          </p>
        </div>

        <div>
          {activeTab === "list" ? (
            <button
              onClick={() => {
                resetForm();
                setActiveTab("form");
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-700 transition-colors"
            >
              <span>+ Create Course</span>
            </button>
          ) : (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ← Back to Catalog
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Offered</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{programs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Publicly</p>
          <p className="mt-1 text-2xl font-bold text-teal-600">{activeCount}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Drafts / Inactive</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{programs.length - activeCount}</p>
        </div>
      </div>

      {activeTab === "form" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {editingId ? "Update Course Details" : "New Course Configuration"}
            </h3>
            <p className="text-xs text-slate-500">
              Fill out the parameters below to publish or revise program details.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Course Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                required
                className="w-full rounded-lg border bg-navy-100 border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="e.g. Fiber Optics & Network Infrastructure"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Overview & Syllabus Summary
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                required
                rows={4}
                className="w-full rounded-lg border bg-navy-100 border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Provide a brief summary of learning outcomes..."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Cover Image
              </label>
              <div className="grid gap-3 sm:grid-cols-2 items-start">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500  bg-navy-100 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {uploadingImage && (
                    <p className="mt-1 text-xs text-teal-600 animate-pulse">Uploading file...</p>
                  )}
                  <input
                    type="text"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={onChange}
                    placeholder="Or paste external image URL"
                    className="mt-2 w-full rounded-lg border  bg-navy-100 border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {form.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 w-full bg-slate-50">
                    <img
                      src={getImageUrl(form.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/70 text-white p-1 hover:bg-slate-900 transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                    No image uploaded
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Duration (Weeks)
                </label>
                <input
                  name="durationWeeks"
                  type="number"
                  min={1}
                  value={form.durationWeeks}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border  bg-navy-100 border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Total Seats
                </label>
                <input
                  name="seatsAvailable"
                  type="number"
                  min={0}
                  value={form.seatsAvailable}
                  onChange={onChange}
                  className="w-full rounded-lg border bg-navy-100 border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Scheduled Start Date
              </label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={onChange}
                className="w-full rounded-lg border bg-navy-100 border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  className="rounded bg-navy-100 border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Publish course publicly
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Course" : "Publish Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "list" && (
        <div className="space-y-4">
          {programs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-slate-500 text-sm">No courses currently in the catalog.</p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("form");
                }}
                className="mt-3 text-sm text-teal-600 font-semibold hover:underline"
              >
                Add your first course
              </button>
            </div>
          ) : (
            programs.map((p) => (
              <div
                key={p._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md flex flex-col sm:flex-row items-start justify-between gap-5"
              >
                <div className="flex gap-4 items-start w-full">
                  {p.imageUrl ? (
                    <img
                      src={getImageUrl(p.imageUrl)}
                      alt={p.title}
                      className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-semibold text-slate-900 text-base">{p.title}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {p.isActive ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">{p.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                      <span>
                        <strong className="text-slate-700">Duration:</strong> {p.durationWeeks} weeks
                      </span>
                      <span>
                        <strong className="text-slate-700">Capacity:</strong> {p.seatsAvailable} seats
                      </span>
                      {p.startDate && (
                        <span>
                          <strong className="text-slate-700">Starts:</strong>{" "}
                          {new Date(p.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 sm:flex-none rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p._id)}
                    className="flex-1 sm:flex-none rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}