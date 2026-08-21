import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api/axios";
import { SkeletonProgramList } from "../components/Skeleton";

const applicationSchema = z.object({
  programId: z.string().min(1, "Please select a program"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "A valid phone number is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().optional(),
});

export default function Training() {
  const [programs, setPrograms] = useState([]);
  const [status, setStatus] = useState("loading");
  const [submitResult, setSubmitResult] = useState(null);
  
  // Step state: "list" shows programs, "form" shows application form
  const [activeStep, setActiveStep] = useState("list");

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setActiveStep("list");
  };

  const onSubmit = async (values) => {
    setSubmitResult(null);
    try {
      const { data } = await api.post("/applications", values);
      setSubmitResult({ type: "success", message: data.message });
      reset();
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setSubmitResult({ type: "error", message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800">
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] px-6 py-14 sm:px-12 lg:px-20 text-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest font-semibold text-teal-400 mb-2">
            TRAINING & INTERNSHIP
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Learn IT on real jobs, not just slides
          </h1>
          <p className="mt-3 text-sm sm:text-base text-navy-200 max-w-2xl leading-relaxed">
            Our trainees work on real repairs and installations alongside technicians, and finish with a portfolio and a certificate.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-6 sm:px-12 py-12">
        
        {/* VIEW 1: PROGRAMS LIST */}
        {activeStep === "list" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy-900">Available Programs</h2>

            {status === "loading" && <SkeletonProgramList count={4} />}

            {status === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-xs text-red-700">
                Couldn't load programs right now. Please refresh or contact us directly.
              </div>
            )}

            {status === "ready" && programs.length === 0 && (
              <p className="text-xs text-slate-500">
                No open programs right now — check back soon or contact us directly.
              </p>
            )}

            {status === "ready" && programs.length > 0 && (
              <div className="space-y-4">
                {programs.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-teal-500 shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-navy-900">{p.title}</h3>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500 pl-8">
                      {p.durationWeeks && (
                        <div className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{p.durationWeeks} weeks</span>
                        </div>
                      )}
                      {p.level && (
                        <div className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{p.level}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pl-8">
                      <button
                        type="button"
                        onClick={() => handleSelectProgram(p._id)}
                        className="rounded bg-teal-500 hover:bg-teal-400 text-navy-900 px-4 py-2 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Apply for this program →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: APPLICATION FORM */}
        {activeStep === "form" && (
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-navy-900 mb-6 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all programs
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-navy-900">Apply now</h2>
              <p className="mt-1 text-xs text-slate-500 leading-normal">
                Send your application straight to our team and we'll reply with the next intake dates.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {/* Program Selected Display / Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    SELECTED PROGRAM
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-lg border border-teal-500 bg-teal-50/30 px-3 py-2.5 text-xs text-navy-900 font-bold focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none pr-8"
                      {...register("programId")}
                      value={selectedProgramId || ""}
                      onChange={(e) => setValue("programId", e.target.value, { shouldValidate: true })}
                    >
                      <option value="" disabled>
                        Select a program
                      </option>
                      {programs.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.programId && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.programId.message}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    PHONE
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    EMAIL (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    WHY THIS PROGRAM? (OPTIONAL)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-navy-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y"
                    {...register("message")}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 py-3 text-xs font-bold text-navy-900 shadow hover:bg-teal-400 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {isSubmitting ? "Sending..." : "Send application"}
                </button>

                {submitResult && (
                  <p
                    className={`text-xs mt-2 text-center font-medium ${
                      submitResult.type === "success" ? "text-teal-700" : "text-red-600"
                    }`}
                  >
                    {submitResult.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}