import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TECHNICAL_DOCS } from "../data/technicalDocs";
import { useSettings } from "../hooks/useSettings";

export default function TechnicalDocDetail() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const found = TECHNICAL_DOCS.find((d) => d.slug === slug);
    setDoc(found || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!doc) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-navy-900">Technical Document Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The manual or diagnostic reference requested is unavailable.</p>
        <Link
          to="/services"
          className="mt-6 rounded-xl bg-teal-500 hover:bg-teal-400 px-5 py-2.5 text-xs font-bold text-slate-900 transition-colors"
        >
          ← Browse Services & Docs
        </Link>
      </div>
    );
  }

  const phone = settings?.phone || "+250783432438";

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-teal-700 font-semibold">{doc.category}</span>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{doc.title}</span>
        </div>

        {/* Article Container */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
          {/* Header Info */}
          <div className="border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold mb-3">
              <span className="rounded-md bg-teal-50 text-teal-800 px-2.5 py-1 uppercase tracking-wider text-[11px]">
                {doc.category}
              </span>
              <span className="text-slate-400 font-medium">·</span>
              <span className="text-slate-500">{doc.readTime}</span>
              <span className="text-slate-400 font-medium">·</span>
              <span className="text-emerald-700">Workshop Verified Reference</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900 leading-tight">
              {doc.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {doc.summary}
            </p>
          </div>

          {/* Markdown-style Rendered Body */}
          <div className="mt-8 prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
            {doc.content.split("\n\n").map((block, idx) => {
              const trimmed = block.trim();
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-base sm:text-lg font-extrabold text-navy-900 mt-6 mb-2">
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("1. ")) {
                return (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-xs whitespace-pre-line leading-relaxed text-slate-800">
                    {trimmed}
                  </div>
                );
              }
              return (
                <p key={idx} className="text-slate-600 leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Technical Keywords */}
          {doc.keywords && doc.keywords.length > 0 && (
            <div className="mt-10 border-t border-slate-100 pt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Document Tags & Keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {doc.keywords.map((kw, i) => (
                  <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Help CTA Banner */}
          <div className="mt-10 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold">Need Professional Hardware Assistance?</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Our technicians in Kigali provide in-person lab diagnostics, component soldering, and equipment repairs.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/contact?service=${encodeURIComponent(doc.category)}`}
                className="rounded-lg bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-900 transition-colors"
              >
                Book Diagnostic
              </Link>
              <a
                href={`tel:${phone}`}
                className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition-colors"
              >
                Call Engineer
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
