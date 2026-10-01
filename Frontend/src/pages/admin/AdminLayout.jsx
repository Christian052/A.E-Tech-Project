import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  GraduationCap,
  Wrench,
  Image as ImageIcon,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import img from "../../../public/A.E TECH 002.png";

export default function AdminLayout({ tab, setTab, badges = {}, children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { key: "Overview", label: t("dashboard.overview"), icon: LayoutDashboard },
    { key: "Inquiries", label: t("dashboard.inquiries"), icon: Inbox, badgeKey: "inquiries" },
    { key: "Applications", label: t("dashboard.applications"), icon: GraduationCap, badgeKey: "applications" },
    { key: "Services", label: t("dashboard.services"), icon: Wrench },
    { key: "Gallery", label: t("dashboard.gallery"), icon: ImageIcon },
    { key: "Training", label: t("dashboard.training"), icon: GraduationCap },
    { key: "Users", label: t("dashboard.users"), icon: Users },
  ];

  const activeItem = navItems.find((n) => n.key === tab);

  const NavList = ({ onNavigate }) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map(({ key, label, icon: Icon, badgeKey }) => {
        const count = badgeKey ? badges[badgeKey] : 0;
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              onNavigate?.();
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
              active ? "bg-teal-500/15 text-teal-300" : "text-navy-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon size={18} strokeWidth={2} />
              {label}
            </span>
            {count > 0 && (
              <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-semibold text-white">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[calc(100vh-1px)] bg-navy-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] lg:flex">
        <div className="flex items-center gap-2 px-5 py-5 text-white">
          <img className="grid h-9 w-9 place-items-center rounded-lg bg-navy-800 text-sm text-teal-300" src={img} alt="logo" />
          <div>
            <p className="text-sm font-bold leading-tight">AUGU Admin</p>
            <p className="text-xs text-navy-400">{t("dashboard.operationsConsole")}</p>
          </div>
        </div>
        <NavList />
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-2 text-xs text-navy-400">
            {t("dashboard.signedInAs", { name: user?.name || "Admin", role: user?.role || "Staff" })}
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <LogOut size={18} />
            {t("auth.logout")}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/60" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B]">
            <div className="flex items-center justify-between px-5 py-5 text-white">
              <div className="flex items-center gap-2">
                <img className="grid h-9 w-9 place-items-center rounded-lg bg-navy-800 text-sm text-teal-300" src={img} alt="logo" />
                <p className="text-sm font-bold">AUGU Admin</p>
              </div>
              <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="text-navy-300">
                <X size={20} />
              </button>
            </div>
            <NavList onNavigate={() => setMobileNavOpen(false)} />
            <div className="border-t border-white/10 p-3">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white"
              >
                <LogOut size={18} />
                {t("auth.logout")}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-navy-200 text-navy-600 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{t("dashboard.operationsConsole")}</p>
              <h1 className="text-lg font-bold text-navy-800">{activeItem?.label || tab}</h1>
            </div>
          </div>

          {/* Language Switcher in Admin Header */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
