import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { SkeletonServiceCardGrid } from "../components/Skeleton";
import { useSettings } from "../hooks/useSettings";

export default function Home() {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState("loading");

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
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B]  text-white py-12 md:py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Hero Content */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-teal-400 mb-3">
              COMPUTER UNIVERSE · KIGALI, RWANDA
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Your computers, network and cameras fixed properly.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-navy-200 leading-relaxed max-w-xl">
              {settings?.businessName || "AUGU Tech"} repairs computers and printers, builds networks, installs CCTV and trains the next generation of technicians from our workshop in Norvege, Karama.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <a
                href={`tel:${settings?.phone || "+250783432438"}`}
                className="inline-flex items-center gap-2 rounded bg-teal-500 hover:bg-teal-400 px-5 py-2.5 text-xs font-bold text-navy-900 shadow transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {settings?.phone || "+250 783 432 438"}
              </a>

              <a
                href={`https://wa.me/${(settings?.phone || "250783432438").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-navy-900 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-navy-800 pt-6">
              <div>
                <p className="text-xs text-navy-300">Services</p>
                <p className="text-lg font-bold text-white">6</p>
              </div>
              <div>
                <p className="text-xs text-navy-300">Open</p>
                <p className="text-lg font-bold text-white">{settings?.hours?.days || "Mon–Fri"}</p>
              </div>
              <div>
                <p className="text-xs text-navy-300">Diagnostics</p>
                <p className="text-lg font-bold text-white">Free</p>
              </div>
            </div>
          </div>

          {/* Hero Image Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-navy-700 bg-navy-800 aspect-[4/3]">
            <img
              src="/public/A.E TECH 001.jpg"
              alt="Technician repairing equipment"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. INFO BAR */}
      <section className="bg-white border-b border-gray-200 py-4 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-navy-900 uppercase tracking-wider text-[10px]">WORKING HOURS</p>
              <p>{settings?.hours?.days || "Mon - Fri"} · {settings?.hours?.open || "10:00 AM"} – {settings?.hours?.close || "6:00 PM"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <div>
              <p className="font-semibold text-navy-900 uppercase tracking-wider text-[10px]">WORKSHOP</p>
              <p>{settings?.address || "Norvege, Karama — Nyarugenge"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-navy-900 uppercase tracking-wider text-[10px]">PROMISE</p>
              <p>Quote before any repair</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES HIGHLIGHT GRID */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 max-w-6xl mx-auto">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-500">WHAT WE DO</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
            Six service lines, one workshop
          </h2>
        </div>

        {status === "loading" && (
          <div className="mt-8">
            <SkeletonServiceCardGrid count={6} />
          </div>
        )}

        {status === "error" && (
          <p className="mt-8 text-sm text-slate-500">
            Services could not be loaded right now. Reach us directly at{" "}
            <a className="text-teal-600 underline" href={`tel:${settings?.phone || "+250783432438"}`}>
              {settings?.phone || "+250 783 432 438"}
            </a>.
          </p>
        )}

        {status === "ready" && (
          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <div
                key={s._id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                <div>
                  <span className="inline-flex h-7 w-8 items-center justify-center rounded bg-teal-400 text-xs font-bold text-navy-900 mb-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-bold text-navy-900">{s.name}</h3>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {s.shortDescription || s.fullDescription}
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to={`/services#${s.slug}`}
                    className="inline-flex items-center text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    Details <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. CLIENT FEEDBACK SECTION */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 bg-slate-100/70 border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-500">CLIENT FEEDBACK</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
            Trusted around Kigali
          </h2>

          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3 text-xs">★★★★★</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "They installed six cameras in my shop in one day and showed me how to view them on my phone. Very clear work!"
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-navy-900">Eric N.</p>
                <p className="text-[10px] text-slate-500">Shop owner, Nyarugenge</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3 text-xs">★★★★★</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "My laptop would not boot and I thought I lost everything. They recovered all my files the same week!"
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-navy-900">Wivine U.</p>
                <p className="text-[10px] text-slate-500">Student</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 mb-3 text-xs">★★★★★</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  "The internship put me on real jobs from week one. I got hired two months after finishing."
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-navy-900">Jean M.</p>
                <p className="text-[10px] text-slate-500">Training graduate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 5. BOTTOM CTA BANNER */}
      <section className="py-12 px-6 sm:px-12 lg:px-20 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Device down? Bring it in today.
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Free diagnostics, clear quote before we touch anything, and a repair timeline you can plan around.
              </p>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              {/* Request Repair Button */}
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 hover:bg-teal-500 px-5 py-3 text-xs font-bold text-slate-900 shadow transition-colors"
              >
                <svg
                  className="w-4 h-4 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Request a repair
              </Link>

              {/* Call Us Button */}
              <a
                href={`tel:${settings?.phone || "+250783432438"}`}
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 px-6 py-3 text-xs font-bold text-slate-900 shadow transition-colors"
              >
                Call us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}