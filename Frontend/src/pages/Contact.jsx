import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import api from "../api/axios";
import { useSettings } from "../hooks/useSettings";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "A valid phone number is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  serviceInterest: z.string().optional(),
  message: z.string().min(5, "Please tell us a bit about what you need"),
  website: z.string().optional(), // honeypot
});

const serviceOptions = [
  { value: "", label: "General inquiry" },
  { value: "computer-repair", label: "Computer Repair & Maintenance" },
  { value: "printer-photocopier-repair", label: "Printer/Photocopier Repair" },
  { value: "networking-internet", label: "Networking & Internet" },
  { value: "cctv-installation", label: "CCTV Installation" },
  { value: "training-internship", label: "Training & Internship" },
  { value: "other-tech-services", label: "Other Tech Services" },
];

export default function Contact() {
  const { settings } = useSettings();
  const [result, setResult] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) });

  const message = watch("message");
  const phoneVal = watch("phone");
  const nameVal = watch("name");
  const serviceVal = watch("serviceInterest");

  const waNumber = (settings?.whatsapp || "+250725900732").replace(/[^\d]/g, "");
  const rawPhone = (settings?.phone || "+250783432438").replace(/[^\d+]/g, "");

  // Submit form data directly to backend database
  const onSubmit = async (values) => {
    setResult(null);
    try {
      const { data } = await api.post("/contact", values);
      setResult({ type: "success", message: data.message || "Message sent successfully to the system!" });
      reset();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setResult({ type: "error", message: errorMsg });
    }
  };

  // Optional manual WhatsApp trigger
  const handleWhatsAppSend = () => {
    const formattedMsg = `Hello, my name is ${nameVal || "a customer"}.${
      phoneVal ? ` My phone number is ${phoneVal}.` : ""
    }${serviceVal ? ` Service interest: ${serviceVal}.` : ""} ${
      message ? `Message: ${message}` : "I'd like to ask about your services."
    }`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(formattedMsg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white pt-16 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-3">
            CONTACT US
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Talk to a technician today
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-normal max-w-2xl leading-relaxed">
            Call, WhatsApp or send us the details of your problem. We reply during working hours, Monday to Friday.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="grid gap-8 lg:grid-cols-12 items-start">

          {/* Left Column (Direct Lines & Map) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 mb-2">Direct lines</h2>
              <ul className="space-y-3.5 text-xs md:text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="text-teal-500 font-bold">📞</span>
                  <a href={`tel:${rawPhone}`} className="hover:underline text-slate-700 font-medium">
                    {settings?.phone || "+250 783 432 438"}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-teal-500 font-bold">💬</span>
                  <span className="text-slate-700 font-medium">
                    {settings?.whatsapp || "+250 725 900 732"} — WhatsApp
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-teal-500 font-bold">✉️</span>
                  <a href={`mailto:${settings?.email || "augstintech2015@gmail.com"}`} className="hover:underline text-slate-700 font-medium">
                    {settings?.email || "augstintech2015@gmail.com"}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-500 font-bold mt-0.5">📍</span>
                  <span className="text-slate-600">
                    {settings?.address || "Kigali - Nyarugenge - Norvege (Karama, Kigali), Rwanda"}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-teal-500 font-bold">🕒</span>
                  <span className="text-slate-600">
                    {settings?.hours?.days || "Mon - Fri"}: {settings?.hours?.open || "10:00 AM"} – {settings?.hours?.close || "6:00 PM"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Embedded Location Map */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white h-64">
              <iframe
                title="Location map"
                className="h-full w-full border-0"
                loading="lazy"
                src="https://www.google.com/maps?q=Kigali+Nyarugenge+Karama&output=embed"
              />
            </div>
          </div>

          {/* Right Column (Message Form) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Send a message</h2>
              <p className="text-xs text-slate-500 mb-6 mt-1">
                Submit your inquiry directly to our system or connect via WhatsApp.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Honeypot field */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  {...register("website")}
                />

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    NAME
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                    {...register("name")}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                {/* Phone & Email Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      PHONE
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                      {...register("phone")}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      EMAIL (OPTIONAL)
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                      {...register("email")}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Service Dropdown */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    SERVICE INTEREST
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none"
                    {...register("serviceInterest")}
                    defaultValue=""
                  >
                    {serviceOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    MESSAGE
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none resize-y"
                    {...register("message")}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
                </div>

                {/* Buttons Container */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {/* Primary System Submission Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#032B45] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#021E31] transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "📤 Send Message"}
                  </button>

                  {/* Secondary WhatsApp Button */}
                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-teal-600 transition-colors"
                  >
                    💬 WhatsApp
                  </button>
                </div>

                {/* System Feedback Message */}
                {result && (
                  <p className={`mt-2 text-xs font-semibold ${result.type === "success" ? "text-teal-700" : "text-red-600"}`}>
                    {result.message}
                  </p>
                )}
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}