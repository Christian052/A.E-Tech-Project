import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api/axios";
import { SkeletonProgramList } from "../components/Skeleton";
import { useSettings } from "../hooks/useSettings";

const applicationSchema = z.object({
  programId: z.string().min(1, "Please select a program"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "A valid phone number is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().optional(),
});

// Helper to format dates cleanly
function formatStartDate(dateStr) {
  if (!dateStr) return "Rolling Admissions";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Upcoming Intake";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Upcoming Intake";
  }
}

// Fallback banner vector icons when course has no custom uploaded image
function getCourseDefaultIcon(title = "") {
  const t = title.toLowerCase();
  if (t.includes("cctv") || t.includes("security") || t.includes("camera")) {
    return (
      <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        <circle cx="9" cy="12" r="2" strokeWidth="2" />
      </svg>
    );
  }
  if (t.includes("network") || t.includes("cable") || t.includes("wifi")) {
    return (
      <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.393 9.322c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    );
  }
  return (
    <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function Training() {
  const { settings } = useSettings();
  const [programs, setPrograms] = useState([]);
  const [status, setStatus] = useState("loading");
  const [submitResult, setSubmitResult] = useState(null);

  // Step state: "list" shows programs catalog, "form" shows application form
  const [activeStep, setActiveStep] = useState("list");

  const waNumber = (settings?.whatsapp || settings?.phone || "+250783432438").replace(/[^\d]/g, "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      programId: "",
      fullName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  const selectedProgramId = watch("programId");
  const selectedProgram = programs.find((p) => p._id === selectedProgramId);

  useEffect(() => {
    api
      .get("/training-programs")
      .then(({ data }) => {
        setPrograms(data.programs || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // When clicking apply on a program card
  const handleSelectProgram = (id) => {
    setValue("programId", id, { shouldValidate: true });
    setActiveStep("form");
    setSubmitResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setActiveStep("list");
  };

  const onSubmit = async (values) => {
    setSubmitResult(null);
    try {
      const { data } = await api.post("/applications", values);
      setSubmitResult({
        type: "success",
        message: data.message || "Application received! Our admissions coordinator will contact you with intake details.",
      });
      reset();
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again or reach out on WhatsApp.";
      setSubmitResult({ type: "error", message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-6 py-14 sm:px-12 lg:px-20 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-teal-400 mb-2">
            <span>Career Pathways</span>
            <span aria-hidden="true" className="text-teal-600">·</span>
            <span>Practical IT Training &amp; Internships</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Learn IT on real jobs, not just slides
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            Hands-on technical apprenticeships in Kigali. Work directly on diagnostic benches, terminate live CCTV security cameras, configure enterprise networks, and graduate with a portfolio and certificate.
          </p>

          {/* Quick Pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Real Client Hardware Practice</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Direct Technician Mentorship</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Official Completion Certificate</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* VIEW 1: PROGRAMS CATALOG */}
        {activeStep === "list" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  Open Catalog
                </p>
                <h2 className="text-2xl font-extrabold text-navy-900 mt-1">
                  Available Training &amp; Internship Programs
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Small cohort sizes · Limited seats per intake
              </span>
            </div>

            {status === "loading" && <SkeletonProgramList count={3} />}

            {status === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-xs text-red-700">
                Couldn't load programs right now. Please refresh or contact our workshop directly.
              </div>
            )}

            {status === "ready" && programs.length === 0 && (
              <div className="card text-center py-12 px-4">
                <p className="text-base font-semibold text-slate-700">No open programs right now.</p>
                <p className="text-xs text-slate-500 mt-1">Check back soon or contact us to join the upcoming waitlist.</p>
              </div>
            )}

            {/* Responsive Card Grid matching TrainingManager Architecture */}
            {status === "ready" && programs.length > 0 && (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((p) => {
                  const hasSeats = (p.seatsAvailable ?? 0) > 0;
                  const dateLabel = formatStartDate(p.startDate);

                  return (
                    <article
                      key={p._id}
                      className="card flex flex-col justify-between hover:border-teal-400 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden p-0"
                    >
                      {/* Top Media Banner */}
                      <div className="relative h-44 w-full bg-gradient-to-br from-[#031B33] to-[#004B5B] overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            {getCourseDefaultIcon(p.title)}
                            <span className="text-xs font-bold text-teal-300 mt-2 tracking-wide uppercase">
                              Hands-On Practical Lab
                            </span>
                          </div>
                        )}

                        {/* Top Overlay Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="rounded-md bg-navy-900/85 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-teal-300 border border-teal-500/30">
                            {p.level || "Beginner & Intermediate"}
                          </span>
                          <span
                            className={`rounded-md px-2.5 py-1 text-[11px] font-bold shadow-xs ${
                              hasSeats
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            {hasSeats ? `${p.seatsAvailable} Seats Left` : "Open Enrollment"}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-extrabold tracking-tight text-navy-900 leading-snug">
                            {p.title}
                          </h3>

                          {/* Key Program Specifications */}
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 font-medium">
                              <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{p.durationWeeks ? `${p.durationWeeks} weeks` : "Flexible"}</span>
                            </div>
                            <span className="text-slate-300">·</span>
                            <div className="flex items-center gap-1.5 font-medium">
                              <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{dateLabel}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {p.description}
                          </p>

                          {/* Topics / Curriculum Checklist (matches Services and TrainingManager) */}
                          {p.topics && p.topics.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                What You Will Master
                              </p>
                              <ul className="space-y-1.5">
                                {p.topics.slice(0, 4).map((topic, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                                    <svg
                                      className="h-3.5 w-3.5 shrink-0 text-teal-500 mt-0.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleSelectProgram(p._id)}
                            className="flex-1 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs transition-colors cursor-pointer text-center"
                          >
                            Apply for Program →
                          </button>
                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `Hello, I would like to inquire about enrolling in the ${p.title} training program.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-colors"
                            title="Inquire via WhatsApp"
                          >
                            <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: APPLICATION FORM */}
        {activeStep === "form" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy-900 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ← Back to Program Catalog
            </button>

            {/* Selected Program Summary Card */}
            {selectedProgram && (
              <div className="card bg-teal-50/50 border-teal-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Applying For:
                    </span>
                    <h3 className="text-base font-extrabold text-navy-900 mt-0.5">
                      {selectedProgram.title}
                    </h3>
                  </div>
                  <span className="rounded-md bg-white border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-800">
                    {selectedProgram.durationWeeks} weeks
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {selectedProgram.description}
                </p>
              </div>
            )}

            {/* Application Form Card */}
            <div className="card p-6 sm:p-8 bg-white shadow-md">
              <h2 className="text-xl font-extrabold text-navy-900">Program Application</h2>
              <p className="mt-1 text-xs text-slate-500 leading-normal">
                Submit your contact information and our training coordinator will reach out to confirm your slot, schedule, and orientation dates.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {/* Program Selector Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    CHOSEN COURSE <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-navy-900 font-semibold focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("programId")}
                    value={selectedProgramId || ""}
                    onChange={(e) => setValue("programId", e.target.value, { shouldValidate: true })}
                  >
                    <option value="" disabled>
                      Select a training program
                    </option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} ({p.durationWeeks} wks)
                      </option>
                    ))}
                  </select>
                  {errors.programId && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.programId.message}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    FULL NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jean Pierre Habimana"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    PHONE NUMBER <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 078 343 2438"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    EMAIL ADDRESS (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@example.com"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    BACKGROUND OR GOALS (OPTIONAL)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your prior technical experience or career goals..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y"
                    {...register("message")}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-xs font-bold text-slate-900 shadow hover:bg-teal-400 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {isSubmitting ? "Submitting Application..." : "Submit Application Now"}
                </button>

                {submitResult && (
                  <div
                    className={`rounded-lg p-3 text-xs font-medium text-center ${
                      submitResult.type === "success"
                        ? "bg-teal-50 text-teal-800 border border-teal-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitResult.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
