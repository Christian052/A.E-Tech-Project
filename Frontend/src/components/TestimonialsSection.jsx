import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

export const DEFAULT_TESTIMONIALS = [
  {
    _id: "default-t-1",
    name: "Eric N.",
    role: "Retail Shop Owner",
    location: "Nyarugenge, Kigali",
    serviceTaken: "CCTV Installation",
    quote: "They installed eight HD night-vision cameras in my retail shop in a single day and configured live viewing on my smartphone. Very neat conduit cabling, clean workshop, and honest pricing!",
    rating: 5,
  },
  {
    _id: "default-t-2",
    name: "Wivine U.",
    role: "University Student",
    location: "Huye / Kigali",
    serviceTaken: "Computer & Motherboard Repair",
    quote: "My Dell laptop wouldn't turn on right before final exams. Other shops told me to replace the whole motherboard, but AUGU Tech repaired the power rail circuit within 24 hours. Saved all my coursework!",
    rating: 5,
  },
  {
    _id: "default-t-3",
    name: "Jean M.",
    role: "Support Technician",
    location: "Kicukiro",
    serviceTaken: "IT Training & Internship",
    quote: "The hands-on internship put me on real client jobs from week one: hardware diagnostics, CCTV termination, and router setups. I got hired two months after finishing.",
    rating: 5,
  },
  {
    _id: "default-t-4",
    name: "Patrick K.",
    role: "Operations Lead",
    location: "Remera, Kigali",
    serviceTaken: "Networking & Wi-Fi Setup",
    quote: "AUGU Tech wired our two-story commercial office with CAT6 structured cabling, eliminated all Wi-Fi dead spots, and connected all our network printers seamlessly. Transparent quote upfront.",
    rating: 5,
  },
  {
    _id: "default-t-5",
    name: "Clarisse M.",
    role: "Pharmacy Manager",
    location: "Nyamirambo",
    serviceTaken: "Printer & Photocopier Repair",
    quote: "Our heavy-duty receipt and prescription printer had continuous paper jams. They diagnosed the gear mechanism and replaced the fuser unit the very same afternoon.",
    rating: 5,
  },
  {
    _id: "default-t-6",
    name: "Samuel B.",
    role: "Studio Director",
    location: "Gasabo, Kigali",
    serviceTaken: "Data Recovery & SSD Upgrade",
    quote: "They successfully recovered over 500GB of client video footage from a corrupted external drive and upgraded our workstations to high-speed NVMe SSDs. Life savers!",
    rating: 5,
  },
];

const AVATAR_COLORS = [
  "bg-teal-500 text-slate-900",
  "bg-navy-800 text-white",
  "bg-cyan-600 text-white",
  "bg-emerald-600 text-white",
  "bg-blue-600 text-white",
  "bg-slate-700 text-white",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    api
      .get("/testimonials")
      .then(({ data }) => {
        const list = Array.isArray(data.testimonials) ? data.testimonials : [];
        if (list.length > 0) {
          setTestimonials(list);
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
        }
        setStatus("ready");
      })
      .catch(() => {
        setTestimonials(DEFAULT_TESTIMONIALS);
        setStatus("ready");
      });
  }, []);

  const displayList = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

  // Extract service categories represented in testimonials
  const serviceCategories = useMemo(() => {
    const categories = new Set();
    displayList.forEach((t) => {
      if (t.serviceTaken) categories.add(t.serviceTaken);
    });
    return ["all", ...Array.from(categories)];
  }, [displayList]);

  // Filtered testimonials
  const filteredList = useMemo(() => {
    if (selectedFilter === "all") return displayList;
    return displayList.filter(
      (t) =>
        t.serviceTaken &&
        t.serviceTaken.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [displayList, selectedFilter]);

  return (
    <section id="testimonials" className="py-16 md:py-24 px-6 sm:px-12 lg:px-20 bg-slate-100/60 border-t border-b border-slate-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">
              <span>Customer Testimonials</span>
              <span aria-hidden="true">·</span>
              <span>Verified Client Stories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
              Trusted by Businesses, Students &amp; Families Across Kigali
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Real feedback from clients who brought their computers, CCTV installations, and office networks to our workshop in Norvege, Karama.
            </p>
          </div>

          {/* Social Proof Trust Summary */}
          <div className="flex items-center gap-3 shrink-0 rounded-xl bg-white border border-slate-200/80 px-4 py-3 shadow-xs">
            <div className="flex text-amber-400 text-sm">
              {"★★★★★"}
            </div>
            <div className="border-l border-slate-200 pl-3 text-xs">
              <p className="font-extrabold text-navy-900">5.0 / 5.0 Rating</p>
              <p className="text-slate-500 text-[11px]">100% Upfront Quotes</p>
            </div>
          </div>
        </div>

        {/* Category Filter Controls */}
        {serviceCategories.length > 2 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Filter by Service:
            </span>
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  selectedFilter === cat
                    ? "bg-teal-500 text-slate-900 shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {cat === "all" ? "All Feedback" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Responsive Testimonial Cards Grid using the 'card' CSS class */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((t, idx) => {
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const ratingStars = Math.min(Math.max(t.rating || 5, 1), 5);

            return (
              <div
                key={t._id || idx}
                className="card flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div>
                  {/* Top: Star Rating & Service Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center text-amber-400 gap-0.5 text-sm" aria-label={`${ratingStars} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <svg
                          key={starIdx}
                          className={`h-4 w-4 ${
                            starIdx < ratingStars ? "text-amber-400 fill-current" : "text-slate-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {t.serviceTaken && (
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 rounded-md px-2 py-0.5 border border-teal-100 line-clamp-1">
                        {t.serviceTaken}
                      </span>
                    )}
                  </div>

                  {/* Testimonial Quote */}
                  <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                    "{t.quote}"
                  </blockquote>
                </div>

                {/* Client Profile Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-2xs ${avatarColor}`}
                  >
                    {getInitials(t.name)}
                  </div>

                  {/* Name and Role */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-navy-900 truncate">
                        {t.name}
                      </p>
                      <svg
                        className="h-3.5 w-3.5 text-teal-500 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        title="Verified Customer"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {t.role || "Client"}{t.location ? ` · ${t.location}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
