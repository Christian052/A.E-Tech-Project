import { useSettings } from "../hooks/useSettings";

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const number = (settings?.whatsapp || "+250725900732").replace(/[^\d]/g, "");
  const message = encodeURIComponent("Hello AUGU SMART ELECTRONIC SERVICE, I'd like to ask about your services.");

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16.02 3C9.4 3 4 8.36 4 14.98c0 2.31.63 4.47 1.72 6.33L4 29l7.87-1.65a12.9 12.9 0 0 0 4.15.68h.01c6.62 0 12.02-5.36 12.02-11.98C28.05 8.36 22.65 3 16.02 3zm0 21.86h-.01a10.7 10.7 0 0 1-3.79-.68l-.5-.25-4.36.91.92-3.4-.28-.5A9.85 9.85 0 0 1 5.9 14.98C5.9 9.4 10.44 4.87 16.02 4.87S26.15 9.4 26.15 14.98 21.6 24.86 16.02 24.86z" />
        <path d="M21.4 18.5c-.31-.16-1.84-.91-2.13-1.01-.29-.1-.5-.16-.71.16-.21.31-.81 1.01-1 1.22-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.56-.93-.83-1.55-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.02-.55-.08-.16-.71-1.72-.98-2.35-.26-.63-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.28 3.26c.16.21 2.23 3.4 5.4 4.77.75.32 1.34.51 1.8.66.76.24 1.45.21 2 .13.61-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.29-.21-.6-.37z" />
      </svg>
    </a>
  );
}
