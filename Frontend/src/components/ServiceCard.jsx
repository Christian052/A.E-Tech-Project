import { Link } from "react-router-dom";

export function getServiceIcon(slug = "") {
  const normalized = (slug || "").toLowerCase();

  if (normalized.includes("computer") || normalized.includes("repair") || normalized.includes("hardware")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v3m-1.5-1.5h3" />
      </svg>
    );
  }

  if (normalized.includes("cctv") || normalized.includes("camera") || normalized.includes("security")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        <circle cx="9" cy="12" r="2" strokeWidth="2" />
      </svg>
    );
  }

  if (normalized.includes("training") || normalized.includes("internship") || normalized.includes("education") || normalized.includes("it")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
      </svg>
    );
  }

  if (normalized.includes("network") || normalized.includes("internet") || normalized.includes("wifi") || normalized.includes("cabling")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.393 9.322c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    );
  }

  if (normalized.includes("printer") || normalized.includes("photocopier") || normalized.includes("copier")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ServiceCard({ service, index = 0 }) {
  const indexStr = String(index + 1).padStart(2, "0");

  return (
    <div className="card group flex flex-col justify-between hover:border-teal-400 hover:shadow-lg transition-all duration-200">
      <div>
        {/* Top bar with icon and index */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white shadow-xs">
            {service.icon ? (
              <img src={service.icon} alt="" className="h-6 w-6 object-contain" />
            ) : (
              getServiceIcon(service.slug)
            )}
          </div>
          <span className="inline-flex items-center rounded-md bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-600">
            {indexStr}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-navy-900 group-hover:text-teal-600 transition-colors">
          <Link to={`/services#${service.slug}`}>
            {service.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-navy-600 line-clamp-3 leading-relaxed">
          {service.shortDescription || service.fullDescription}
        </p>

        {/* Highlight features if available */}
        {service.features && service.features.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-navy-100/70 pt-3">
            {service.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-navy-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                <span className="truncate">{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Card actions */}
      <div className="mt-6 pt-4 border-t border-navy-50 flex items-center justify-between gap-3">
        <Link
          to={`/services#${service.slug}`}
          className="inline-flex items-center text-xs font-bold text-teal-600 hover:text-teal-700 group-hover:underline"
        >
          Details <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link
          to={`/contact?service=${encodeURIComponent(service.name)}`}
          className="inline-flex items-center rounded-lg bg-navy-50 hover:bg-teal-50 hover:text-teal-700 px-3 py-1.5 text-xs font-semibold text-navy-700 transition-colors"
        >
          Inquire
        </Link>
      </div>
    </div>
  );
}
