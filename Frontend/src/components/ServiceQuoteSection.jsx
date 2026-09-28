import { useState, useEffect } from "react";
import {
  Wrench,
  ShieldCheck,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";
import { useSettings } from "../hooks/useSettings";
import { useToast } from "../context/ToastContext";

const SERVICE_OPTIONS = [
  { value: "computer-repair", label: "Computer & Laptop Repair (Hardware / Board / OS)" },
  { value: "printer-photocopier-repair", label: "Printer & Photocopier Repair & Servicing" },
  { value: "cctv-installation", label: "CCTV Camera Surveillance & Security Setup" },
  { value: "networking-internet", label: "Structured Networking, WiFi & Server Cabling" },
  { value: "training-internship", label: "Hands-on Practical IT Training & Internship" },
  { value: "other-tech-services", label: "Other Electronics Repair or Custom Diagnostics" },
];

const URGENCY_OPTIONS = [
  { value: "standard", label: "Standard Diagnosis (24 - 48 hours)" },
  { value: "urgent", label: "Priority / Same-Day Emergency Service" },
  { value: "onsite", label: "On-Site Technician Visit (Kigali Metro)" },
  { value: "budgeting", label: "Planning / Requesting Budget Price Estimate" },
];

export default function ServiceQuoteSection({
  title = "Request a Service Quote",
  subtitle = "Tell us what equipment is malfunctioning or what technical installation you require. We diagnose the issue and provide a transparent, upfront cost estimate before touching any screws.",
  defaultService = "computer-repair",
}) {
  const { settings } = useSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceInterest: defaultService,
    deviceDetails: "",
    urgency: "standard",
    message: "",
    website: "", // honeypot
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const rawPhone = (settings?.phone || "+250783432438").replace(/[^\d+]/g, "");
  const waNumber = (
    settings?.whatsapp ||
    settings?.phone ||
    "+250783432438"
  ).replace(/[^\d]/g, "");

  // Update default service if passed
  useEffect(() => {
    if (defaultService) {
      setFormData((prev) => ({ ...prev, serviceInterest: defaultService }));
    }
  }, [defaultService]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please provide your full name or company name";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      newErrors.phone = "A valid phone number is required (e.g. 078... or +250...)";
    }
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      newErrors.message = "Please describe the problem or installation requirements";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionResult(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    // Build comprehensive message body for inquiry records
    const fullMessage = [
      formData.message.trim(),
      "",
      "--- QUOTE REQUEST METADATA ---",
      `Service: ${formData.serviceInterest || "General"}`,
      formData.deviceDetails ? `Equipment / Model: ${formData.deviceDetails.trim()}` : null,
      `Urgency / Timeline: ${formData.urgency}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        serviceInterest: formData.serviceInterest,
        message: fullMessage,
        website: formData.website, // honeypot
      };

      const { data } = await api.post("/contact", payload);
      const successMsg =
        data?.message ||
        "Your quote request has been received! Our workshop technician will review your details and reach out with a transparent quote.";

      setSubmissionResult({
        status: "success",
        message: successMsg,
        inquiryId: data?.inquiryId || `QT-${Date.now().toString().slice(-5)}`,
      });

      toast.success(successMsg, {
        title: "Quote Request Received",
        duration: 6000,
      });

      // Reset form but retain service interest
      setFormData({
        name: "",
        phone: "",
        email: "",
        serviceInterest: formData.serviceInterest,
        deviceDetails: "",
        urgency: "standard",
        message: "",
        website: "",
      });
      setErrors({});
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Could not submit your quote request right now. Please try calling or messaging us directly.";
      setSubmissionResult({
        status: "error",
        message: errorMsg,
      });
      toast.error(errorMsg, {
        title: "Quote Request Error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppQuote = () => {
    const serviceLabel =
      SERVICE_OPTIONS.find((s) => s.value === formData.serviceInterest)?.label ||
      formData.serviceInterest;
    const text = `Hello AUGU Smart Tech! I would like to request a service quote:%0A%0A` +
      `*Name:* ${encodeURIComponent(formData.name || "Customer")}%0A` +
      `*Phone:* ${encodeURIComponent(formData.phone || "N/A")}%0A` +
      `*Service:* ${encodeURIComponent(serviceLabel)}%0A` +
      (formData.deviceDetails ? `*Device/Model:* ${encodeURIComponent(formData.deviceDetails)}%0A` : "") +
      `*Urgency:* ${encodeURIComponent(formData.urgency)}%0A` +
      `*Issue Details:* ${encodeURIComponent(formData.message || "Requesting service quotation and diagnostics.")}`;

    window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank");
  };

  return (
    <section
      id="quote-section"
      className="relative py-14 sm:py-20 bg-slate-50 border-t border-slate-200/80 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-600 mb-2.5">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Official Estimates · Kigali Workshop &amp; On-Site</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy-950">
            {title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Workshop Guarantees & Direct Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Guarantee Highlights Card */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>Our Quote &amp; Repair Guarantee</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-teal-50 p-1.5 text-teal-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">Zero Hidden Costs</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      We diagnose component failures first. You get an itemized quote before any soldering or part replacement starts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-teal-50 p-1.5 text-teal-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">Rapid Diagnostics</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      Laptops and printers are inspected within 24 hours. Urgent same-day emergency repairs available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-teal-50 p-1.5 text-teal-700">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900">90-Day Service Warranty</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      All repaired boards, installed CCTV setups, and replaced hardware components carry a 90-day peace-of-mind guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Alternatives Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-navy-900 to-navy-950 p-6 text-white shadow-md">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-2">
                Need Immediate Assistance?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Have a device that needs urgent attention right now? Speak directly with our lead hardware technician:
              </p>

              <div className="space-y-3">
                <a
                  href={`tel:${rawPhone}`}
                  className="flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-teal-400">📞</span>
                    <span>{settings?.phone || "+250 783 432 438"}</span>
                  </span>
                  <span className="text-[11px] text-teal-300 font-bold">Call Now →</span>
                </a>

                <button
                  type="button"
                  onClick={generateWhatsAppQuote}
                  className="w-full flex items-center justify-between rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-xs sm:text-sm font-bold text-white transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Quote Desk</span>
                  </span>
                  <span className="text-[11px] bg-white/20 rounded-md px-2 py-0.5">Live Chat</span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Workshop: {settings?.address || "Norvege, Karama — Nyarugenge"}</span>
                <span>Mon – Fri 10am–6pm</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form with .input-field (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-navy-950">
                    Service Quote Request Form
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill in your device details for an itemized estimate.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700 border border-teal-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free Diagnostics
                </span>
              </div>

              {/* Submission Result Notification */}
              {submissionResult && (
                <div
                  className={`mb-6 rounded-xl p-4 text-xs sm:text-sm transition-all ${
                    submissionResult.status === "success"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-rose-50 text-rose-900 border border-rose-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {submissionResult.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">
                        {submissionResult.status === "success"
                          ? "Quote Request Submitted Successfully!"
                          : "Submission Problem"}
                      </p>
                      <p className="mt-1 leading-relaxed text-xs">
                        {submissionResult.message}
                      </p>

                      {submissionResult.status === "success" && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-emerald-200/60">
                          <button
                            type="button"
                            onClick={generateWhatsAppQuote}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Send details to our WhatsApp also
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Contact / Quote Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Honeypot field for anti-spam */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                    >
                      Your Full Name / Company <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="quote-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Jean Damascene / Horizon Ltd"
                      className="input-field"
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-phone"
                      className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                    >
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="quote-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0783 432 438 or +250..."
                      className="input-field"
                      required
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Email & Service Needed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                    >
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="quote-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. yourname@gmail.com"
                      className="input-field"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-service"
                      className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                    >
                      Primary Service Required <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="quote-service"
                      name="serviceInterest"
                      value={formData.serviceInterest}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Device / Equipment Details & Urgency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quote-device"
                      className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                    >
                      Equipment Brand &amp; Model
                    </label>
                    <input
                      id="quote-device"
                      name="deviceDetails"
                      type="text"
                      value={formData.deviceDetails}
                      onChange={handleChange}
                      placeholder="e.g. Dell Latitude 5420 / Canon 2520"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quote-urgency"
                      className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                    >
                      Turnaround / Urgency
                    </label>
                    <select
                      id="quote-urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="input-field cursor-pointer"
                    >
                      {URGENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Problem Description / Scope */}
                <div>
                  <label
                    htmlFor="quote-message"
                    className="block text-[11px] font-bold uppercase tracking-wider text-navy-800 mb-1.5"
                  >
                    Describe the Issue or Installation Scope <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="quote-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what happened (e.g. laptop shut down abruptly and won't turn on, fan spinning loudly, need 6 CCTV cameras installed in our office with remote phone monitoring)..."
                    className="input-field"
                    required
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.message}</p>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition-all duration-200 hover:shadow-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Quote Request</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={generateWhatsAppQuote}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 px-5 py-3 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-colors"
                    title="Transfer details directly to WhatsApp chat"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Quote via WhatsApp</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center sm:text-left pt-1">
                  🔒 We respect your privacy. Inquiries are stored securely and never shared with 3rd parties.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
