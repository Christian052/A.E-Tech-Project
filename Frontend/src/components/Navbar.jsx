import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";
import { useLanguage } from "../context/LanguageContext";
import GlobalSearchModal from "./GlobalSearchModal";
import LanguageSwitcher from "./LanguageSwitcher";

const img = "/A.E TECH 002.png";

export default function Navbar() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on page navigation
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Global hotkey: Ctrl+K or Cmd+K to open search anywhere
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const rawPhone = (settings?.phone || "+250783432438").replace(/[^\d+]/g, "");
  const waNumber = (settings?.whatsapp || settings?.phone || "+250783432438").replace(/[^\d]/g, "");

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/training", label: t("nav.training") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-2.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <NavLink to="/" className="flex items-center gap-2.5 font-extrabold text-navy-900 group">
            <img
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-navy-800 object-contain p-0.5 shadow-2xs group-hover:scale-105 transition-transform"
              src={img}
              alt="AUGU Tech logo"
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-navy-900 leading-tight">
                <span className="sm:hidden">AUGU TECH</span>
                <span className="hidden sm:inline">AUGU SMART ELECTRONIC</span>
              </span>
              <span className="text-[10px] text-teal-600 font-semibold tracking-wide hidden xs:inline uppercase">
                {t("nav.tagline")}
              </span>
            </div>
          </NavLink>

          {/* Desktop Search Trigger Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4 lg:mx-6">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-2xs group"
            >
              <span className="flex items-center gap-2 truncate">
                <svg
                  className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-slate-400 group-hover:text-slate-600 truncate">{t("nav.searchPlaceholder")}</span>
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Desktop Navigation Links & Language Switcher */}
          <div className="hidden items-center gap-4 md:flex lg:gap-5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-xs sm:text-sm font-bold transition-colors py-1 ${
                    isActive ? "text-teal-600 border-b-2 border-teal-500" : "text-navy-700 hover:text-teal-600"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {/* Language Switcher Component */}
            <LanguageSwitcher />

            <a
              href={`tel:${rawPhone}`}
              className="inline-flex items-center justify-center rounded-xl bg-teal-500 hover:bg-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xs transition-colors shrink-0"
            >
              {t("common.callNow")}
            </a>
          </div>

          {/* Mobile Actions: Language Switcher, Search, Phone, Hamburger */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Quick Language Switcher on Mobile Header */}
            <LanguageSwitcher />

            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg border border-slate-200 bg-slate-50 text-slate-700 p-2 text-xs hover:bg-slate-100 transition-colors"
              title="Search Services & Courses"
              aria-label="Search"
            >
              <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <a
              href={`tel:${rawPhone}`}
              className="rounded-lg bg-teal-50 text-teal-700 p-2 text-xs font-bold hover:bg-teal-100 transition-colors"
              title="Call Workshop"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-navy-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle mobile navigation menu"
              aria-expanded={open}
            >
              {open ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Navigation with Smooth Backdrop */}
        {open && (
          <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden animate-in slide-in-from-top duration-200">
            {/* Search Input Bar in Drawer */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500"
              >
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{t("nav.searchPlaceholder")}</span>
              </button>
            </div>

            <div className="flex flex-col space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                      isActive ? "bg-teal-50 text-teal-700" : "text-navy-800 hover:bg-slate-50"
                    }`
                  }
                >
                  <span>{l.label}</span>
                  <span className="text-xs text-slate-400">→</span>
                </NavLink>
              ))}

              <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${rawPhone}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-500 py-2.5 text-xs font-bold text-slate-950 shadow-xs"
                >
                  <span>{t("common.callNow")}</span>
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-xs"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
