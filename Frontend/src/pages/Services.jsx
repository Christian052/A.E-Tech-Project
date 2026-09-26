import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { SkeletonServiceCardGrid } from "../components/Skeleton";
import { getServiceIcon } from "../components/ServiceCard";
import { mergeServicesWithDefaults } from "../utils/servicesData";
import { useSettings } from "../hooks/useSettings";

export default function Services() {
  const { settings } = useSettings();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedSlug, setHighlightedSlug] = useState("");

  const waNumber = (settings?.whatsapp || settings?.phone || "+250783432438").replace(/[^\d]/g, "");

  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => {
        const activeServices = (data.services || [])
          .filter((s) => s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setServices(activeServices);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const displayServices = useMemo(() => {
    return mergeServicesWithDefaults(services);
  }, [services]);

  // Smooth scroll and highlight card if navigating with anchor hash (e.g., /services#cctv-installation)
  useEffect(() => {
    if (status !== "loading" && location.hash) {
      const slug = location.hash.replace("#", "");
      setHighlightedSlug(slug);
      const el = document.getElementById(slug);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [status, location.hash]);

  // Extract distinct categories from services
  const categories = useMemo(() => {
    const catSet = new Set();
    displayServices.forEach((s) => {
      if (s.category) catSet.add(s.category);
    });
    return ["all", ...Array.from(catSet)];
  }, [displayServices]);

  // Filter services by category and search text
  const filteredServices = useMemo(() => {
    return displayServices.filter((s) => {
      const matchesCategory =
        selectedCategory === "all" ||
        s.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q) ||
        s.fullDescription?.toLowerCase().includes(q) ||
        (s.features && s.features.some((f) => f.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [displayServices, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
            Our Services
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Repair, connect, secure and train
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Every job starts with a diagnosis and a transparent quote. Explore our full suite of computer repair, CCTV security installation, networking, printer maintenance, and professional IT training offerings.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Controls: Search & Category Filter */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-teal-500 text-slate-900 shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat === "all" ? "All Services" : cat}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
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
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="mt-6">
            <SkeletonServiceCardGrid count={6} />
          </div>
        )}

        {/* No Results Message */}
        {status !== "loading" && filteredServices.length === 0 && (
          <div className="card text-center py-12 px-4">
            <p className="text-base font-semibold text-slate-700">No services found matching your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search terms.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-teal-400"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Responsive Grid of Services (Rendered Exactly Once) */}
        {status !== "loading" && filteredServices.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong className="text-slate-800">{filteredServices.length}</strong> {filteredServices.length === 1 ? "service" : "services"}
              </span>
              <span className="text-[11px] text-teal-600 font-medium">Free diagnostic quotes on all requests</span>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((s, idx) => {
                const isTarget = highlightedSlug === s.slug;
                const indexStr = String(s.order || idx + 1).padStart(2, "0");

                return (
                  <article
                    key={s._id || s.slug || idx}
                    id={s.slug}
                    className={`card scroll-mt-28 flex flex-col justify-between transition-all duration-300 ${
                      isTarget
                        ? "border-teal-500 ring-2 ring-teal-500 ring-offset-2 shadow-lg"
                        : "hover:border-teal-400 hover:shadow-lg"
                    }`}
                  >
                    <div>
                      {/* Top Bar: Icon, Number Counter & Category Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-xs">
                          {s.icon ? (
                            <img src={s.icon} alt="" className="h-6 w-6 object-contain" />
                          ) : (
                            getServiceIcon(s.slug)
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {s.category && (
                            <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-[11px] font-semibold text-navy-600">
                              {s.category}
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                            {indexStr}
                          </span>
                        </div>
                      </div>

                      {/* Service Title */}
                      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#031B33]">
                        {s.name}
                      </h2>

                      {/* Service Description */}
                      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                        {s.fullDescription || s.shortDescription}
                      </p>

                      {/* Key Offerings / Inclusions Checklist */}
                      {s.features && s.features.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Key Deliverables
                          </p>
                          <ul className="space-y-1.5">
                            {s.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                                <svg
                                  className="h-4 w-4 shrink-0 text-teal-500 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                      <Link
                        to={`/contact?service=${encodeURIComponent(s.name)}`}
                        className="flex-1 text-center rounded-lg bg-[#032B45] hover:bg-[#021E31] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
                      >
                        Request Service
                      </Link>
                      <a
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `Hello, I would like to inquire about your ${s.name} service.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-colors shadow-xs"
                      >
                        <svg
                          className="h-4 w-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom Contact / Diagnostic Banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 p-8 sm:p-10 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Custom Tech Requirements?
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-extrabold">
                Don't see exactly what you're looking for?
              </h3>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                We handle bespoke IT projects, institutional lab setup, server rollouts, and multi-branch CCTV surveillance. Reach out for a free site assessment and quote.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/contact"
                className="rounded-xl bg-teal-500 hover:bg-teal-400 px-5 py-3 text-xs font-bold text-slate-900 transition-colors"
              >
                Contact Our Engineers
              </Link>
              <a
                href={`tel:${settings?.phone || "+250783432438"}`}
                className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-3 text-xs font-bold text-white transition-colors"
              >
                Call {settings?.phone || "+250 783 432 438"}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
