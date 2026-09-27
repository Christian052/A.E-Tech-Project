import { useState, useMemo } from "react";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/getImageUrl";

// Helper to format dates cleanly
function formatStartDate(dateStr) {
  if (!dateStr) return "Rolling Admissions";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Upcoming Intake";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Upcoming Intake";
  }
}

const emptyForm = {
  title: "",
  description: "",
  level: "Beginner to Intermediate",
  durationWeeks: 8,
  startDate: "",
  seatsAvailable: 8,
  topicsText: "",
  isActive: true,
  imageUrl: "",
};

export default function TrainingManager({ programs = [], setPrograms }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" matches public page, "table" for compact view
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const startCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      level: p.level || "Beginner to Intermediate",
      durationWeeks: p.durationWeeks ?? 8,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      seatsAvailable: p.seatsAvailable ?? 0,
      topicsText: Array.isArray(p.topics) ? p.topics.join("\n") : "",
      isActive: p.isActive ?? true,
      imageUrl: p.imageUrl || "",
    });
    setError(null);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setIsFormOpen(false);
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

      const returnedUrl = data.url || data.imageUrl;
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

    const parsedTopics = (form.topicsText || "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        level: form.level.trim() || "Beginner to Intermediate",
        durationWeeks: Number(form.durationWeeks) || 1,
        seatsAvailable: Number(form.seatsAvailable) || 0,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        topics: parsedTopics,
        isActive: Boolean(form.isActive),
        imageUrl: form.imageUrl?.trim() || "",
      };

      if (editingId) {
        const { data } = await api.patch(`/training-programs/${editingId}`, payload);
        const updatedProgram = data.program || data;
        setPrograms((prev) => prev.map((p) => (p._id === editingId ? { ...p, ...updatedProgram } : p)));
      } else {
        const { data } = await api.post("/training-programs", payload);
        const newProgram = data.program || data;
        setPrograms((prev) => [...prev, newProgram]);
      }
      resetForm();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        errs
          ? errs.map((x) => x.message).join(", ")
          : err.response?.data?.message || "Failed to save training program"
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program? This action cannot be undone.")) return;
    try {
      await api.delete(`/training-programs/${id}`);
      setPrograms((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete program");
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    setPrograms((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: nextStatus } : p)));

    try {
      const { data } = await api.patch(`/training-programs/${id}`, { isActive: nextStatus });
      const updatedProgram = data.program || data;
      setPrograms((prev) => prev.map((p) => (p._id === id ? { ...p, ...updatedProgram } : p)));
    } catch {
      setPrograms((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: currentStatus } : p)));
      alert("Failed to update program visibility status.");
    }
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.level?.toLowerCase().includes(q) ||
        (p.topics && p.topics.some((t) => t.toLowerCase().includes(q)));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [programs, searchQuery, statusFilter]);

  const activeCount = useMemo(() => programs.filter((p) => p.isActive).length, [programs]);

  const previewTopics = useMemo(() => {
    return (form.topicsText || "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [form.topicsText]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
            <span>Admin Control</span>
            <span aria-hidden="true">·</span>
            <span>Training &amp; Internships Catalog</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy-900 mt-1">
            Program Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure technical courses and apprenticeships matching the public Training page architecture.
          </p>
        </div>

        {!isFormOpen && (
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-navy-900 shadow-xs"
                    : "text-slate-600 hover:text-navy-900"
                }`}
                title="Public Card Grid Structure"
              >
                Card Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-md px-3 py-1.5 transition-all ${
                  viewMode === "table"
                    ? "bg-white text-navy-900 shadow-xs"
                    : "text-slate-600 hover:text-navy-900"
                }`}
                title="Compact Table List"
              >
                Table View
              </button>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs hover:bg-teal-400 transition-colors"
            >
              <span>+ Add Course</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor View */}
      {isFormOpen ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-6 py-4">
            <div>
              <h3 className="text-base font-extrabold text-navy-900">
                {editingId ? "Edit Training Program" : "New Training Course Configuration"}
              </h3>
              <p className="text-xs text-slate-500">
                Set course syllabus, duration, intake dates, and learning outcomes matching the public Training page.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Catalog
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
            {/* Form Inputs (7 Cols) */}
            <form onSubmit={onSubmit} className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g. Networking & CCTV Security Internship"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Audience / Skill Level
                  </label>
                  <input
                    name="level"
                    value={form.level}
                    onChange={onChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="e.g. Beginner to Intermediate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Duration (Weeks) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="durationWeeks"
                    type="number"
                    min={1}
                    value={form.durationWeeks}
                    onChange={onChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                  Overview &amp; Learning Objectives <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                  placeholder="Describe the practical hands-on experience, equipment handled, and student takeaways..."
                />
              </div>

              {/* Topics / Curriculum Checklist (matches Services and Training page) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800">
                    What Students Will Master (Curriculum Topics)
                  </label>
                  <span className="text-[11px] text-teal-600 font-semibold">One topic per line</span>
                </div>
                <textarea
                  name="topicsText"
                  value={form.topicsText}
                  onChange={onChange}
                  rows={4}
                  className="w-full font-mono rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder={`CAT6 structured cabling & patch panel termination\nIP & analog camera termination\nNVR/DVR storage setup & mobile app viewing\nRouter, switch & access point configuration`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Scheduled Start Date
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={onChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Available Cohort Seats
                  </label>
                  <input
                    name="seatsAvailable"
                    type="number"
                    min={0}
                    value={form.seatsAvailable}
                    onChange={onChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                  Course Media / Cover Image
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {uploadingImage && (
                    <p className="text-xs text-teal-600 animate-pulse">Uploading course banner...</p>
                  )}
                  <input
                    type="text"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={onChange}
                    placeholder="Or enter direct image URL"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Public Visibility Toggle */}
              <div className="pt-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={onChange}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  <span className="ml-3 text-xs font-bold text-navy-900">
                    Visible on Public Training Page
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
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-slate-900 shadow hover:bg-teal-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : editingId ? "Update Program" : "Publish Program"}
                </button>
              </div>
            </form>

            {/* Live Card Preview (5 Cols) - Identical to Training Page Card Structure */}
            <div className="lg:col-span-5 bg-slate-50/70 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Public Course Card Preview
                </p>
                <span className="text-[11px] text-teal-600 font-semibold">.card utility</span>
              </div>

              {/* Exact Training Card Replica */}
              <article className="card flex flex-col justify-between shadow-sm bg-white overflow-hidden p-0 border border-slate-200">
                <div className="relative h-40 w-full bg-gradient-to-br from-[#031B33] to-[#004B5B] overflow-hidden flex items-center justify-center">
                  {form.imageUrl ? (
                    <img
                      src={getImageUrl(form.imageUrl)}
                      alt="Course Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-xs font-bold text-teal-300 tracking-wide uppercase">
                        Hands-On Practical Lab
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-md bg-navy-900/85 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                      {form.level || "Beginner & Intermediate"}
                    </span>
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950">
                      {form.seatsAvailable > 0 ? `${form.seatsAvailable} Seats` : "Open"}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-navy-900">
                      {form.title || "Course Title"}
                    </h4>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span>{form.durationWeeks} weeks</span>
                      <span>·</span>
                      <span>{form.startDate ? formatStartDate(form.startDate) : "Upcoming"}</span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {form.description || "Course description summary..."}
                    </p>

                    {previewTopics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Topics Covered
                        </p>
                        <ul className="space-y-1">
                          {previewTopics.slice(0, 3).map((topic, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                              <span className="text-teal-500 font-bold">✓</span>
                              <span className="line-clamp-1">{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="block text-center rounded-lg bg-teal-500 py-2 text-xs font-bold text-slate-900">
                      Apply for Program →
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : (
        /* List / Grid Views */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-navy-900">{programs.length} Courses Total</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="font-semibold text-emerald-600">{activeCount} Published</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="font-semibold text-slate-400">{programs.length - activeCount} Drafts</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Published Only</option>
                <option value="inactive">Drafts Only</option>
              </select>
            </div>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-slate-500 text-sm">No training courses match your search.</p>
              <button
                onClick={startCreate}
                className="mt-3 text-xs text-teal-600 font-bold hover:underline"
              >
                + Create a new course
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Card Grid View (Exact match to Public Training Page) */
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((p) => {
                const dateLabel = formatStartDate(p.startDate);

                return (
                  <article
                    key={p._id}
                    className={`card flex flex-col justify-between transition-all duration-200 overflow-hidden p-0 bg-white ${
                      !p.isActive ? "opacity-75 bg-slate-50/80 border-dashed" : "hover:border-teal-400 hover:shadow-md"
                    }`}
                  >
                    {/* Top Banner Media */}
                    <div className="relative h-40 w-full bg-gradient-to-br from-[#031B33] to-[#004B5B] overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        <img
                          src={getImageUrl(p.imageUrl)}
                          alt={p.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="text-center p-3">
                          <span className="text-xs font-bold text-teal-300 uppercase">
                            Practical Workshop
                          </span>
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="rounded-md bg-navy-900/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                          {p.level || "All Levels"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {p.isActive ? (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-inset ring-slate-400/20">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-extrabold text-navy-900">
                          {p.title}
                        </h4>

                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 pb-2 border-b border-slate-100">
                          <span>{p.durationWeeks} weeks</span>
                          <span>·</span>
                          <span>{dateLabel}</span>
                          <span>·</span>
                          <span>{p.seatsAvailable ?? 0} seats</span>
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                          {p.description}
                        </p>

                        {p.topics && p.topics.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Topics ({p.topics.length})
                            </p>
                            <ul className="space-y-1">
                              {p.topics.slice(0, 3).map((topic, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                  <span className="text-teal-500 font-bold">✓</span>
                                  <span className="line-clamp-1">{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(p._id, p.isActive)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {p.isActive ? "Hide" : "Publish"}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1 text-xs font-bold text-navy-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(p._id)}
                            className="rounded-lg border border-rose-200 bg-white hover:bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Course Title</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Start Date</th>
                      <th className="px-4 py-3">Seats</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrograms.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-extrabold text-navy-900">{p.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {p.level || "All Levels"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.durationWeeks} wks
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatStartDate(p.startDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.seatsAvailable ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          {p.isActive ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => toggleActive(p._id, p.isActive)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {p.isActive ? "Hide" : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-navy-800 hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(p._id)}
                            className="rounded border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
