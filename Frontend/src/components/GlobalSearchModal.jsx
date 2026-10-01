import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { mergeServicesWithDefaults } from "../utils/servicesData";
import { TECHNICAL_DOCS } from "../data/technicalDocs";
import { useLanguage } from "../context/LanguageContext";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "service" | "training" | "docs"
  const [services, setServices] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const navigate = useNavigate();

  // Load search data once modal opens
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    // Auto-focus input
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    // Fetch services and programs
    let isCancelled = false;
    setLoading(true);

    Promise.allSettled([api.get("/services"), api.get("/training-programs")])
      .then(([servicesRes, programsRes]) => {
        if (isCancelled) return;
        if (servicesRes.status === "fulfilled") {
          const raw = servicesRes.value.data?.services || [];
          setServices(mergeServicesWithDefaults(raw));
        } else {
          setServices(mergeServicesWithDefaults([]));
        }

        if (programsRes.status === "fulfilled") {
          setPrograms(programsRes.value.data?.programs || []);
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  // Aggregate results based on query and filter
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results = [];

    // 1. Services
    if (activeFilter === "all" || activeFilter === "service") {
      services.forEach((s) => {
        const titleMatch = s.name?.toLowerCase().includes(q);
        const descMatch = s.shortDescription?.toLowerCase().includes(q) || s.fullDescription?.toLowerCase().includes(q);
        const featureMatch = s.features?.some((f) => f.toLowerCase().includes(q));

        if (!q || titleMatch || descMatch || featureMatch) {
          results.push({
            id: `service-${s._id || s.slug}`,
            type: "service",
            badge: t("search.services"),
            badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
            title: s.name,
            subtitle: s.shortDescription || s.fullDescription,
            category: s.category || "IT & Hardware",
            path: `/services#${s.slug}`,
          });
        }
      });
    }

    // 2. Training Programs
    if (activeFilter === "all" || activeFilter === "training") {
      programs.forEach((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const topicMatch = p.topics?.some((t) => t.toLowerCase().includes(q));

        if (!q || titleMatch || descMatch || topicMatch) {
          results.push({
            id: `training-${p._id}`,
            type: "training",
            badge: t("search.training"),
            badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
            title: p.title,
            subtitle: p.description,
            category: `${p.durationWeeks || "Flexible"} ${t("training.weeks")} · ${p.level || "Practical"}`,
            path: `/training`,
          });
        }
      });
    }

    // 3. Technical Documentation
    if (activeFilter === "all" || activeFilter === "docs") {
      TECHNICAL_DOCS.forEach((d) => {
        const titleMatch = d.title.toLowerCase().includes(q);
        const sumMatch = d.summary.toLowerCase().includes(q);
        const kwMatch = d.keywords.some((k) => k.toLowerCase().includes(q));

        if (!q || titleMatch || sumMatch || kwMatch) {
          results.push({
            id: `doc-${d.id}`,
            type: "docs",
            badge: t("search.docs"),
            badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
            title: d.title,
            subtitle: d.summary,
            category: `${d.category} · ${d.readTime}`,
            path: `/docs/${d.slug}`,
          });
        }
      });
    }

    return results;
  }, [query, activeFilter, services, programs, t]);

  // Reset selected index on filter or query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Keyboard navigation (Escape, Up, Down, Enter)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        if (searchResults[selectedIndex]) {
          e.preventDefault();
          handleSelect(searchResults[selectedIndex]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  // Keep highlighted item in view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const activeEl = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-12 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200 mt-2 sm:mt-10 flex flex-col max-h-[85vh]">
        {/* Search Header Bar */}
        <div className="relative border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-teal-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full bg-transparent text-sm sm:text-base text-navy-900 placeholder:text-slate-400 focus:outline-none"
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear query"
              >
                ✕
              </button>
            ) : (
              <span className="hidden sm:inline-block rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                ESC
              </span>
            )}
          </div>

          {/* Filter Segment Tabs */}
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                activeFilter === "all" ? "bg-navy-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t("search.all")} ({searchResults.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("service")}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "service" ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{t("search.services")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("training")}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "training" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{t("search.training")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("docs")}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFilter === "docs" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{t("search.docs")}</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 space-y-1.5 divide-y divide-slate-100"
        >
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent mb-2" />
              <p>{t("search.searching")}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center px-4">
              <p className="text-sm font-bold text-slate-700">
                {t("search.noResults", { query })}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t("common.noData")}
              </p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-slate-100 text-navy-950 ring-1 ring-teal-500/50"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-navy-900 group-hover:text-teal-600 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <span className="text-slate-300 group-hover:text-teal-600 text-sm mt-1 shrink-0">
                    →
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Quick Tip */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-600 shadow-2xs">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="hidden sm:inline">
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-600 shadow-2xs">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span className="text-[11px] font-medium text-teal-700">
            {t("search.tip")}
          </span>
        </div>
      </div>
    </div>
  );
}
