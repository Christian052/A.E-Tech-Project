import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  ShieldCheck,
  Clock,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import ServiceCard from "./ServiceCard";
import { SkeletonServiceCardGrid } from "./Skeleton";
import { useSettings } from "../hooks/useSettings";

export default function ServicesSection({
  services = [],
  loading = false,
  showAllLink = true,
  title = "Company Offerings & Technical Solutions",
  subtitle = "Certified computer motherboard repair, commercial CCTV camera installations, and structured office networking designed for businesses, schools, and individuals across Kigali.",
}) {
  const { settings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const waNumber = (
    settings?.whatsapp ||
    settings?.phone ||
    "+250783432438"
  ).replace(/[^\d]/g, "");

  // Distinct category tabs
  const categories = useMemo(() => {
    const catMap = new Map();
    services.forEach((s) => {
      const cat = s.category || "General";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const list = [{ id: "all", label: "All Offerings", count: services.length }];
    catMap.forEach((count, cat) => {
      list.push({ id: cat, label: cat, count });
    });
    return list;
  }, [services]);

  // Filtered services based on selected category tab
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter(
      (s) => (s.category || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [services, selectedCategory]);

  return (
    <section id="services" className="relative py-16 sm:py-24 bg-slate-50/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-teal-600">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>Services & Engineering Expertise</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {showAllLink && (
            <Link
              to="/services"
              className="inline-flex items-center gap-2 self-start md:self-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:border-teal-500 hover:text-teal-600 transition-all shrink-0 group focus:outline-none"
            >
              <span>Explore all offerings</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1 text-teal-600"
              />
            </Link>
          )}
        </div>

        {/* Interactive Filter Control Tabs (Zero-Pill: functional segmented tabs with active state) */}
        {categories.length > 2 && (
          <div className="mb-10 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((tab) => {
              const isActive = selectedCategory.toLowerCase() === tab.id.toLowerCase();
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-tight transition-all duration-200 shrink-0 focus:outline-none ${
                    isActive
                      ? "bg-[#031B33] text-teal-300 shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] font-semibold ${
                      isActive ? "text-teal-400" : "text-slate-400"
                    }`}
                  >
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Service Offerings Card Grid */}
        {loading ? (
          <SkeletonServiceCardGrid count={6} />
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service._id || service.slug || index}
                service={service}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No services found for the selected category.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="mt-3 text-xs font-bold text-teal-600 hover:underline"
            >
              Reset to view all offerings
            </button>
          </div>
        )}

        {/* Workshop Assurances Strip */}
        <div className="mt-14 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex items-start gap-3.5 sm:pr-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Wrench size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Transparent Diagnostics
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  We inspect your laptop or device, explain the hardware root cause, and provide a clear quote before touching anything.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4 sm:pt-0 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Genuine Components
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  All motherboard chips, replacement screens, batteries, and camera lenses are sourced from trusted, verified suppliers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4 sm:pt-0 sm:pl-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Rapid Workshop Turnaround
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Routine repairs and software restores completed within 24–48 hours; on-site CCTV visits booked on your schedule.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Consultation Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-6 py-5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <MessageCircle size={22} className="text-teal-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Need an Immediate Quote or Site Assessment?
              </p>
              <p className="text-xs text-slate-300">
                Chat with our Kigali technicians directly for fast scheduling and answers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                "Hello AUGU SMART ELECTRONIC, I would like to inquire about your repair, CCTV, or networking services."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-400 hover:bg-teal-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 transition-colors shadow-xs"
            >
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              <span>Submit Inquiry</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
