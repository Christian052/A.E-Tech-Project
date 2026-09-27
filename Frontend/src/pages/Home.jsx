import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ServicesSection from "../components/ServicesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import { mergeServicesWithDefaults } from "../utils/servicesData";
import { useSettings } from "../hooks/useSettings";

const img = "/A.E TECH 001.jpg";

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

  const displayServices = mergeServicesWithDefaults(services);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white py-14 md:py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Hero Content (Left 7 cols on large screens) */}
          <div className="lg:col-span-7">
            {/* Unboxed clean kicker metadata */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">
              <span>AUGU SMART ELECTRONIC SERVICE</span>
              <span aria-hidden="true" className="text-teal-600">·</span>
              <span>Kigali, Rwanda</span>
            </div>

            {/* Bold Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight leading-[1.12] text-white">
              Expert Computer Repair, CCTV Installation &amp; IT Training
            </h1>

            {/* Brief Value Proposition */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl">
              From component-level computer and printer diagnostics to turnkey CCTV security installations and hands-on IT training, we deliver fast, guaranteed technology solutions with transparent quotes before any repair.
            </p>

            {/* Service Pillars Checklist */}
            <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Component-Level Computer Repair</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Turnkey CCTV Surveillance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Practical IT Internships</span>
              </div>
            </div>

            {/* Call To Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3.5 items-center">
              {/* Primary Call-To-Action Button */}
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 hover:bg-teal-300 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition-all duration-200 hover:shadow-teal-400/25 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-[#031B33]"
              >
                <span>Request a Service</span>
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* Secondary CTA: View Offerings Grid */}
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs transition-colors"
              >
                Explore Offerings
              </a>

              {/* Secondary CTA: Direct WhatsApp Contact */}
              <a
                href={`https://wa.me/${(settings?.whatsapp || settings?.phone || "+250783432438").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  "Hello AUGU Tech, I would like to inquire about your repair, CCTV, or IT training services."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 px-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                title="Chat with our technicians on WhatsApp"
              >
                <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 border-t border-white/10 pt-6">
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-400">Core Services</p>
                <p className="text-sm sm:text-xl font-extrabold text-white mt-0.5">{displayServices.length} Offerings</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-400">Diagnostic Fee</p>
                <p className="text-sm sm:text-xl font-extrabold text-white mt-0.5">Free Quote</p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-400">Location</p>
                <p className="text-sm sm:text-xl font-extrabold text-white mt-0.5">Nyarugenge</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card (Right 5 cols on large screens) */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Decorative subtle backdrop blur glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-teal-500/20 to-teal-300/10 blur-xl opacity-75" />

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-navy-700/80 bg-navy-800 aspect-[4/3] group">
                <img
                  src={img}
                  alt="AUGU Tech electronics workshop technician testing circuit boards"
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031B33]/85 via-[#031B33]/20 to-transparent" />

                {/* Service Promise Guarantee Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-[#031B33]/90 backdrop-blur-md border border-white/10 p-3.5 text-white shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Service Guarantee</p>
                      <p className="text-xs font-semibold text-slate-100 mt-0.5">Quote before any repair · 100% genuine parts</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2.5 py-1 text-[11px] font-bold">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

      {/* 3. SERVICES SECTION */}
      <ServicesSection
        services={displayServices}
        loading={status === "loading"}
        title="Company Offerings & Solutions"
        subtitle="Professional computer repair, turnkey CCTV installation, and structured networking tailored for businesses, schools, and individuals in Kigali."
      />

      {/* 4. CUSTOMER TESTIMONIALS SECTION */}
      <TestimonialsSection />
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