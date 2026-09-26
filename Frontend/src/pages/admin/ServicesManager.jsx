import { useState, useMemo } from "react";
import api from "../../api/axios";
import { getServiceIcon } from "../../components/ServiceCard";

const STANDARD_CATEGORIES = [
  "Hardware & Systems",
  "Security & Safety",
  "Education & Career",
  "Infrastructure",
  "Office Equipment",
  "Data & Performance",
];

const emptyForm = {
  slug: "",
  name: "",
  category: "Hardware & Systems",
  shortDescription: "",
  fullDescription: "",
  featuresText: "",
  order: 0,
  isActive: true,
};

export default function ServicesManager({ services = [], setServices }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);

  // Filters State matching public services page
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" matches public page structure, "table" for compact view

  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");

  const startCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setForm({
      slug: service.slug || "",
      name: service.name || "",
      category: service.category || "Hardware & Systems",
      shortDescription: service.shortDescription || "",
      fullDescription: service.fullDescription || "",
      featuresText: Array.isArray(service.features) ? service.features.join("\n") : "",
      order: service.order ?? 0,
      isActive: service.isActive ?? true,
    });
    setIsSlugCustomized(true);
    setError(null);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsSlugCustomized(false);
    setError(null);
    setIsFormOpen(false);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "slug") {
      setIsSlugCustomized(true);
    }

    setForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "name" && !editingId && !isSlugCustomized) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const parsedFeatures = (form.featuresText || "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      category: form.category.trim() || "Hardware & Systems",
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      features: parsedFeatures,
      order: Number(form.order) || 0,
      isActive: Boolean(form.isActive),
    };

    try {
      if (editingId) {
        const { data } = await api.patch(`/services/${editingId}`, payload);
        const updatedService = data.service || data;
        setServices((prev) =>
          prev.map((s) => (s._id === editingId ? { ...s, ...updatedService } : s))
        );
      } else {
        const { data } = await api.post("/services", payload);
        const newService = data.service || data;
        setServices((prev) =>
          [...prev, newService].sort((a, b) => (a.order || 0) - (b.order || 0))
        );
      }
      resetForm();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(
        errs
          ? errs.map((x) => x.message).join(", ")
          : err.response?.data?.message || "Failed to save service"
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this service? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete service");
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const nextStatus = !currentStatus;

    // Optimistic Update
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isActive: nextStatus } : s))
    );

    try {
      const { data } = await api.patch(`/services/${id}`, { isActive: nextStatus });
      const updatedService = data.service || data;
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, ...updatedService } : s))
      );
    } catch {
      // Revert state on failure
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: currentStatus } : s))
      );
      alert("Failed to update service status.");
    }
  };

  // Derive categories list from existing services + standard set
  const categoriesList = useMemo(() => {
    const set = new Set(STANDARD_CATEGORIES);
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  const filteredServices = useMemo(() => {
    return services
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .filter((s) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          s.name?.toLowerCase().includes(query) ||
          s.slug?.toLowerCase().includes(query) ||
          s.category?.toLowerCase().includes(query) ||
          s.shortDescription?.toLowerCase().includes(query) ||
          s.fullDescription?.toLowerCase().includes(query) ||
          (s.features && s.features.some((f) => f.toLowerCase().includes(query)));

        const matchesCategory =
          selectedCategory === "all" ||
          s.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && s.isActive) ||
          (statusFilter === "inactive" && !s.isActive);

        return matchesSearch && matchesCategory && matchesStatus;
      });
  }, [services, searchQuery, selectedCategory, statusFilter]);

  const activeCount = useMemo(
    () => services.filter((s) => s.isActive).length,
    [services]
  );

  // Parse preview features for form
  const formPreviewFeatures = useMemo(() => {
    return (form.featuresText || "")
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  }, [form.featuresText]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
            <span>Admin Control</span>
            <span aria-hidden="true">·</span>
            <span>Services Page Architecture</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900 mt-1">
            Services Manager
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage services with the same card structure, category taxonomy, and key deliverables shown on the public Services page.
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
                title="Public Services Card Grid Structure"
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
              className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs hover:bg-teal-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
            >
              <svg
                className="-ml-0.5 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add New Service
            </button>
          </div>
        )}
      </div>

      {/* Editor View */}
      {isFormOpen ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/75 px-6 py-4">
            <div>
              <h2 className="text-base font-extrabold text-navy-900">
                {editingId ? "Edit Service Offering" : "Create New Service Offering"}
              </h2>
              <p className="text-xs text-slate-500">
                Configure details matching the public Services page: Category, Deliverables, and Descriptions.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Overview
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
            {/* Form Inputs (7 Cols) */}
            <form onSubmit={onSubmit} className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Service Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="e.g. Computer Repair and Maintenance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="category"
                      list="categories-datalist"
                      value={form.category}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholder="e.g. Hardware & Systems"
                    />
                    <datalist id="categories-datalist">
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                  URL Anchor Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-lg shadow-xs">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
                    /services#
                  </span>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={onChange}
                    required
                    className="w-full min-w-0 rounded-r-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="computer-repair"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Targeted by homepage links like /services#cctv-installation.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800">
                    Short Summary <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-xs ${
                      form.shortDescription.length > 200
                        ? "font-medium text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {form.shortDescription.length} / 220
                  </span>
                </div>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={onChange}
                  required
                  rows={2}
                  maxLength={220}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                  placeholder="Concise overview shown in cards on landing and services page..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                  Full Description
                </label>
                <textarea
                  name="fullDescription"
                  value={form.fullDescription}
                  onChange={onChange}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                  placeholder="Complete diagnostic and technical scope of this service..."
                />
              </div>

              {/* Key Deliverables / Features Checklist (Matching Services Page structure) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800">
                    Key Deliverables / Checklist
                  </label>
                  <span className="text-[11px] text-teal-600 font-semibold">
                    One bullet item per line
                  </span>
                </div>
                <textarea
                  name="featuresText"
                  value={form.featuresText}
                  onChange={onChange}
                  rows={4}
                  className="w-full font-mono rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder={`Motherboard diagnostics & chip repair\nScreen & battery replacements\nOS reinstallation & malware removal\nPreventive cooling system maintenance`}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  These appear as the checklist deliverables with teal checkmarks on the Services page.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-800 mb-1">
                    Display Order Position
                  </label>
                  <input
                    name="order"
                    type="number"
                    value={form.order}
                    onChange={onChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={onChange}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-400"></div>
                    <span className="ml-3 text-xs font-bold text-navy-900">
                      Visible on Public Website
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-slate-900 shadow-xs hover:bg-teal-400 disabled:opacity-50 transition-colors"
                >
                  {saving
                    ? "Saving Changes…"
                    : editingId
                    ? "Update Service"
                    : "Publish Service"}
                </button>
              </div>
            </form>

            {/* Live Card Preview (5 Cols) - Identical to Services Page Card Structure */}
            <div className="lg:col-span-5 bg-slate-50/70 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Public Card Preview
                </p>
                <span className="text-[11px] text-teal-600 font-semibold">
                  .card utility class
                </span>
              </div>

              {/* Exact Service Card Replica */}
              <article className="card flex flex-col justify-between shadow-sm bg-white">
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-xs">
                      {getServiceIcon(form.slug)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-semibold text-navy-600">
                        {form.category || "Hardware & Systems"}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                        #{String(form.order || 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-extrabold tracking-tight text-[#031B33]">
                    {form.name || "Your Service Title"}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {form.shortDescription ||
                      "Short summary of the offering as displayed on public cards..."}
                  </p>

                  {/* Features Deliverables Checklist */}
                  {formPreviewFeatures.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Key Deliverables
                      </p>
                      <ul className="space-y-1.5">
                        {formPreviewFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                            <svg
                              className="h-3.5 w-3.5 shrink-0 text-teal-500 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer preview buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="text-teal-600">Request Service →</span>
                  <span className="text-slate-400">WhatsApp Preview</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : (
        /* List / Grid Views */
        <div className="space-y-5">
          {/* Controls Bar: Counts, Search, Category Pills, Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Counts */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-bold text-navy-900">
                  {services.length} Total
                </span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="font-semibold text-emerald-600">
                  {activeCount} Active
                </span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="font-semibold text-slate-400">
                  {services.length - activeCount} Hidden
                </span>
              </div>

              {/* Search & Status Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services or deliverables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <svg
                    className="absolute left-2.5 top-2 h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Visible Only</option>
                  <option value="inactive">Hidden Only</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills (Same as public Services Page) */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Category:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-teal-500 text-slate-900 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({services.length})
              </button>
              {categoriesList.map((cat) => {
                const count = services.filter((s) => s.category?.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-teal-500 text-slate-900 shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <svg
                className="mx-auto h-10 w-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-bold text-navy-900">
                No matching services found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Adjust your search or category filter, or add a new service.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Responsive Grid View (Same structure as public Services page) */
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((s) => {
                const indexStr = String(s.order || 1).padStart(2, "0");

                return (
                  <article
                    key={s._id}
                    className={`card flex flex-col justify-between transition-all duration-200 ${
                      !s.isActive ? "opacity-75 bg-slate-50/80 border-dashed" : "hover:border-teal-400 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Top Bar with Icon, Category, Order and Active Status */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-xs">
                          {s.icon ? (
                            <img src={s.icon} alt="" className="h-6 w-6 object-contain" />
                          ) : (
                            getServiceIcon(s.slug)
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {s.category && (
                              <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-semibold text-navy-600">
                                {s.category}
                              </span>
                            )}
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">
                              #{indexStr}
                            </span>
                          </div>
                          {s.isActive ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-inset ring-slate-400/20">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Slug */}
                      <h3 className="text-base font-extrabold tracking-tight text-[#031B33]">
                        {s.name}
                      </h3>
                      <p className="font-mono text-[11px] text-teal-600 mt-0.5">
                        /services#{s.slug}
                      </p>

                      {/* Description */}
                      <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                        {s.shortDescription || s.fullDescription}
                      </p>

                      {/* Deliverables / Features Checklist (Matching Services Page) */}
                      {s.features && s.features.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Key Deliverables ({s.features.length})
                          </p>
                          <ul className="space-y-1">
                            {s.features.slice(0, 4).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-snug">
                                <svg
                                  className="h-3.5 w-3.5 shrink-0 text-teal-500 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                            {s.features.length > 4 && (
                              <li className="text-[10px] text-slate-400 font-medium pl-5">
                                + {s.features.length - 4} more deliverables
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions Footer */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(s._id, s.isActive)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {s.isActive ? "Hide" : "Show"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-navy-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(s._id)}
                          className="rounded-lg border border-rose-200 bg-white hover:bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors"
                        >
                          Delete
                        </button>
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
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Service Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Deliverables</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">
                          #{s.order ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-extrabold text-navy-900">{s.name}</p>
                          <p className="font-mono text-[11px] text-teal-600">/{s.slug}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">
                            {s.category || "Hardware & Systems"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {s.features && s.features.length > 0
                            ? `${s.features.length} items`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {s.isActive ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => toggleActive(s._id, s.isActive)}
                            className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {s.isActive ? "Hide" : "Show"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(s)}
                            className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-navy-800 hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(s._id)}
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
