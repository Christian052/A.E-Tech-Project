import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Cpu,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";

const logoImg = "/A.E TECH 002.png";

export default function AdminLogin() {
  const { user, login, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: localStorage.getItem("augu_saved_admin_email") || "",
    password: "",
  });
  const [rememberEmail, setRememberEmail] = useState(
    Boolean(localStorage.getItem("augu_saved_admin_email"))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated, redirect straight to the admin dashboard
  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const cleanEmail = form.email.trim();
      const res = await login(cleanEmail, form.password);

      if (res?.success) {
        if (rememberEmail) {
          localStorage.setItem("augu_saved_admin_email", cleanEmail);
        } else {
          localStorage.removeItem("augu_saved_admin_email");
        }
        navigate("/admin/dashboard");
      } else {
        setError(res?.message || t("auth.invalidCredentials"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        t("common.errorOccurred")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || authLoading;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Background Decorative Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[450px] w-[450px] rounded-full bg-[#004B5B]/20 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-[#032B45]/30 blur-[120px]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top Header / Back Navigation */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 text-teal-400" />
          <span>{t("auth.backToWebsite")}</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 hidden sm:inline">
              Console Active · Kigali
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper with Subtle Border Glow */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-9 shadow-2xl backdrop-blur-xl">
            {/* Top Brand & Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4 relative">
                <div className="absolute -inset-2 rounded-2xl bg-teal-400/20 blur-md opacity-70" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#031B33] to-[#004B5B] border border-teal-500/30 p-2 shadow-inner">
                  <img
                    src={logoImg}
                    alt="AUGU SMART ELECTRONIC logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-2">
                <ShieldCheck size={13} className="text-teal-400" />
                {t("auth.staffPortal")}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                {t("auth.adminConsole")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">
                {t("auth.loginDesc")}
              </p>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-in fade-in duration-200">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email Input Field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t("auth.emailLabel")}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, email: e.target.value }));
                      if (error) setError(null);
                    }}
                    placeholder="admin@aetech.rw"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-slate-600 focus:border-teal-400 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input Field with Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t("auth.passwordLabel")}
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {t("auth.encryptedAuth")}
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, password: e.target.value }));
                      if (error) setError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-teal-400 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Email Option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-400/20 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-xs text-slate-300">{t("auth.rememberEmail")}</span>
                </label>

                <a
                  href={`https://wa.me/${(settings?.whatsapp || "+250725900732").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    "Hello AUGU Tech Administrator, I need assistance recovering my staff login access."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium hover:underline"
                >
                  {t("auth.forgotPassword")}
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-slate-950" />
                    <span>{t("auth.verifying")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("auth.signInBtn")}</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security Guarantee Footer Note */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Cpu size={12} className="text-teal-400" />
                AES-256 JWT
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <KeyRound size={12} className="text-teal-400" />
                Role-Based RBAC
              </span>
              <span>·</span>
              <span>SSL Protected</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Credits */}
      <footer className="relative z-10 w-full px-4 py-4 text-center text-xs text-slate-600 border-t border-white/5">
        <p>
          © {new Date().getFullYear()} {settings?.businessName || "AUGU SMART ELECTRONIC SERVICE LTD"} · {t("footer.allRightsReserved")}
        </p>
      </footer>
    </div>
  );
}
