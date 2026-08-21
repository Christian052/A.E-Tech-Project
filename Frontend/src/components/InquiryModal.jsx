export function InquiryModal({ inquiry, onClose }) {
  if (!inquiry) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-navy-800">Inquiry Details</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600">✕</button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-navy-700">
          <p><strong>Name:</strong> {inquiry.name}</p>
          <p><strong>Phone:</strong> <a href={`tel:${inquiry.phone}`} className="text-teal-600 underline">{inquiry.phone}</a></p>
          <p><strong>Service:</strong> {inquiry.serviceInterest || "N/A"}</p>
          <p><strong>Date:</strong> {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : "N/A"}</p>
          <p><strong>Status:</strong> <span className="capitalize">{inquiry.status}</span></p>
          <div className="rounded-lg bg-navy-50 p-3">
            <p><strong>Message:</strong></p>
            <p className="mt-1 whitespace-pre-wrap text-navy-800">{inquiry.message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-navy-100 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}