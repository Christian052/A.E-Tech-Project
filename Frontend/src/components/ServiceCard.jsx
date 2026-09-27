import { Link } from "react-router-dom";
import {
  Laptop,
  Camera,
  Network,
  Printer,
  GraduationCap,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function getServiceIcon(slug = "") {
  const normalized = (slug || "").toLowerCase();

  if (
    normalized.includes("computer") ||
    normalized.includes("repair") ||
    normalized.includes("hardware")
  ) {
    return <Laptop className="h-6 w-6" />;
  }

  if (
    normalized.includes("cctv") ||
    normalized.includes("camera") ||
    normalized.includes("security")
  ) {
    return <Camera className="h-6 w-6" />;
  }

  if (
    normalized.includes("network") ||
    normalized.includes("internet") ||
    normalized.includes("wifi") ||
    normalized.includes("cabling")
  ) {
    return <Network className="h-6 w-6" />;
  }

  if (
    normalized.includes("training") ||
    normalized.includes("internship") ||
    normalized.includes("education") ||
    normalized.includes("it")
  ) {
    return <GraduationCap className="h-6 w-6" />;
  }

  if (
    normalized.includes("printer") ||
    normalized.includes("photocopier") ||
    normalized.includes("copier")
  ) {
    return <Printer className="h-6 w-6" />;
  }

  return <Wrench className="h-6 w-6" />;
}

export default function ServiceCard({ service, index = 0 }) {
  const indexStr = String(index + 1).padStart(2, "0");
  const categoryName = service.category || "Technical Service";

  return (
    <article
      id={service.slug}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-500/50 hover:shadow-xl overflow-hidden"
    >
      {/* Top Accent Gradient on Hover */}
      <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-teal-400 via-teal-500 to-[#004B5B] transition-all duration-300 group-hover:w-full" />

      {/* Card Header & Body */}
      <div>
        {/* Unboxed Metadata & Icon Bar */}
        <div className="flex items-center justify-between gap-4 mb-5">
          {/* Icon Container */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#032B45] transition-all duration-300 group-hover:bg-[#031B33] group-hover:text-teal-400 group-hover:scale-105 shadow-xs shrink-0">
            {service.icon ? (
              <img
                src={service.icon}
                alt=""
                className="h-6 w-6 object-contain"
              />
            ) : (
              getServiceIcon(service.slug)
            )}
          </div>

          {/* Clean Unboxed Metadata (Zero-Pill Rule) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
            <span className="uppercase tracking-wider text-[11px] text-teal-700">
              {categoryName}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-[11px] font-bold text-slate-400">
              {indexStr}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
          <Link to={`/services#${service.slug}`} className="hover:underline focus:outline-none">
            {service.name}
          </Link>
        </h3>

        {/* Short / Full Description */}
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
          {service.shortDescription || service.fullDescription}
        </p>

        {/* Feature Highlights / Technical Checklist */}
        {service.features && service.features.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">
            {service.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2
                  size={14}
                  className="text-teal-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="leading-snug">{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Card Action Controls */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Secondary: Details */}
        <Link
          to={`/services#${service.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition-colors group/link focus:outline-none"
        >
          <span>Learn details</span>
          <ArrowRight
            size={13}
            className="transition-transform duration-200 group-hover/link:translate-x-1 text-teal-500"
          />
        </Link>

        {/* Primary Action Button */}
        <Link
          to={`/contact?service=${encodeURIComponent(service.name)}`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-teal-500 text-white hover:text-slate-950 px-3.5 py-2 text-xs font-bold shadow-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
        >
          Request Service
        </Link>
      </div>
    </article>
  );
}
