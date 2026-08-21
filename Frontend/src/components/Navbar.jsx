import { useState } from "react";
import { NavLink } from "react-router-dom";
import img from "../../public/A.E TECH 002.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/training", label: "Training" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 font-extrabold text-navy-800">
          <img className="grid h-9 w-9 place-items-center rounded-lg bg-navy-800 text-sm text-teal-300" src={img} alt="logo" />
          <span className="hidden sm:inline">AUGU SMART ELECTRONIC</span>
        </NavLink>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? "text-teal-600" : "text-navy-600 hover:text-teal-600"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a href="tel:+250783432438" className="btn-secondary !px-4 !py-2 text-sm">
            Call Now
          </a>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-navy-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-navy-100 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-teal-600" : "text-navy-700"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a href="tel:+250783432438" className="btn-primary mt-2 text-sm">
              Call Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
