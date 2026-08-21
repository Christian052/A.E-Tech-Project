import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { SkeletonServiceRowList } from "../components/Skeleton";
import { useSettings } from "../hooks/useSettings";

export default function Services() {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");

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

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
            Our Services
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Repair, connect, secure and train
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Every job starts with a diagnosis and a quote. Here is exactly what we handle and what you get.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading State */}
        {status === "loading" && (
          <div className="space-y-6">
            <SkeletonServiceRowList count={5} />
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
            <p className="text-sm font-medium">
              Couldn't load services right now. Please try again shortly.
            </p>
          </div>
        )}

        {/* Empty State */}
        {status === "ready" && services.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
            <p className="text-sm">No services are currently listed.</p>
          </div>
        )}

        {/* Services List View */}
        {status === "ready" && services.length > 0 && (
          <div className="space-y-12">
            {services.map((s, i) => (
              <article
                key={s._id}
                id={s.slug}
                className="scroll-mt-28 border-b border-slate-200 pb-12 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Teal Number Badge */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500 font-bold text-slate-900 shadow-sm text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex-1">
                    {/* Service Title */}
                    <h2 className="text-2xl font-extrabold tracking-tight text-[#031B33] sm:text-3xl">
                      {s.name}
                    </h2>

                    {/* Description */}
                    <p className="mt-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
                      {s.fullDescription || s.shortDescription}
                    </p>

                    {/* Features Grid */}
                    {s.features && s.features.length > 0 && (
                      <ul className="mt-6 grid max-w-2xl grid-cols-1 gap-y-3 gap-x-8 sm:grid-cols-2">
                        {s.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                            <svg
                              className="h-4 w-4 shrink-0 text-teal-500"
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
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <Link
                        to={`/contact?service=${encodeURIComponent(s.name)}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#032B45] hover:bg-[#021E31] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
                      >
                        Request this service
                      </Link>

                      <a
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `Hello, I would like to inquire about your ${s.name} service.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-colors"
                      >
                        <svg
                          className="h-4 w-4 text-slate-700"
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
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}