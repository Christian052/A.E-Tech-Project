import { useState, useMemo } from "react";
import api from "../../api/axios";

const emptyForm = {
  slug: "",
  name: "",
  shortDescription: "",
  fullDescription: "",
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

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      shortDescription: service.shortDescription || "",
      fullDescription: service.fullDescription || "",
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

    const payload = { ...form, order: Number(form.order) || 0 };

    try {
      if (editingId) {
        const { data } = await api.patch(`/services/${editingId}`, payload);
        const updatedService = data.service || data;
        setServices((prev) =>
          prev.map((s) => (s._id === editingId ? updatedService : s))
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
        prev.map((s) => (s._id === id ? updatedService : s))
      );
    } catch (err) {
      // Revert state on failure
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: currentStatus } : s))
      );
      alert("Failed to update service status.");
    }
  };

  const filteredServices = useMemo(() => {
    return services
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .filter((s) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          s.name?.toLowerCase().includes(query) ||
          s.slug?.toLowerCase().includes(query) ||
          s.shortDescription?.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && s.isActive) ||
          (statusFilter === "inactive" && !s.isActive);

        return matchesSearch && matchesStatus;
      });
  }, [services, searchQuery, statusFilter]);

  const activeCount = useMemo(
    () => services.filter((s) => s.isActive).length,
    [services]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Services Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your service offerings, update public details, and reorder card layouts.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <svg
              className="-ml-0.5 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add New Service
          </button>
        )}
      </div>

      {/* Editor View */}
      {isFormOpen ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? "Edit Service Details" : "Create New Service"}
              </h2>
              <p className="text-xs text-gray-500">
                Fill in the fields below to update your public offerings.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              ← Back to List
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. CCTV System Installation"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-xs text-gray-500">
                    /services/
                  </span>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={onChange}
                    required
                    className="w-full min-w-0 rounded-r-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="cctv-installation"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Short Summary <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    form.shortDescription.length > 200
                      ? "font-medium text-amber-600"
                      : "text-gray-400"
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Brief summary displayed on preview cards..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                value={form.fullDescription}
                onChange={onChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Comprehensive breakdown displayed on the detail page..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2">
              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Display Position
                </label>
                <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Visible on website
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : editingId
                  ? "Update Service"
                  : "Publish Service"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="font-medium text-gray-900">
                {services.length}{" "}
                <span className="font-normal text-gray-500">Total</span>
              </span>
              <span className="h-3 w-px bg-gray-200"></span>
              <span className="font-medium text-emerald-600">
                {activeCount}{" "}
                <span className="font-normal text-gray-500">Active</span>
              </span>
              <span className="h-3 w-px bg-gray-200"></span>
              <span className="font-medium text-gray-400">
                {services.length - activeCount}{" "}
                <span className="font-normal text-gray-500">Inactive</span>
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-64"
                />
                <svg
                  className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No services found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or add a new service.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {filteredServices.map((s) => (
                <div
                  key={s._id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-50/80 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="max-w-xl space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium text-gray-400">
                        #{s.order ?? 0}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900">
                        {s.name}
                      </h3>
                      {s.isActive ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-indigo-600">/{s.slug}</p>
                    <p className="line-clamp-2 pt-1 text-sm text-gray-600">
                      {s.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleActive(s._id, s.isActive)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      {s.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(s._id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}