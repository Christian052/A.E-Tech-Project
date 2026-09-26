export function InquiryModal({ inquiry, onClose }) {
  if (!inquiry) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-navy-900">Inquiry Details</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-900 text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700">
          <p><strong>Name:</strong> {inquiry.name}</p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${inquiry.phone}`} className="text-teal-600 font-semibold underline">
              {inquiry.phone}
            </a>
          </p>
          {inquiry.email && <p><strong>Email:</strong> {inquiry.email}</p>}
          <p><strong>Service:</strong> {inquiry.serviceInterest || "General Inquiry"}</p>
          <p><strong>Date:</strong> {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : "N/A"}</p>
          <p><strong>Status:</strong> <span className="capitalize font-semibold">{inquiry.status}</span></p>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
            <p className="font-bold text-navy-900 text-xs mb-1">Message:</p>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-xs sm:text-sm">{inquiry.message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
