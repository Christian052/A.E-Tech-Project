import { useSettings } from "../hooks/useSettings";
import { useLanguage } from "../context/LanguageContext";

const img = "/A.E TECH 001.jpg";

export default function About() {
  const { settings } = useSettings();
  const { t } = useLanguage();

  const steps = [
    {
      num: 1,
      title: t("about.step1Title"),
      desc: t("about.step1Desc"),
    },
    {
      num: 2,
      title: t("about.step2Title"),
      desc: t("about.step2Desc"),
    },
    {
      num: 3,
      title: t("about.step3Title"),
      desc: t("about.step3Desc"),
    },
    {
      num: 4,
      title: t("about.step4Title"),
      desc: t("about.step4Desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Dark Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-2 sm:mb-3">
            {t("about.badge")}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 max-w-2xl leading-tight">
            {t("about.title")}
          </h1>
          <p className="text-slate-300 text-xs sm:text-base font-normal max-w-2xl leading-relaxed">
            {settings?.businessName || "AUGU SMART ELECTRONIC SERVICE LTD"}, {t("about.subtitle")}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Column (Story & How We Work) */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-10">
            {/* Our Story */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">{t("about.storyTitle")}</h2>
              <div className="space-y-3 sm:space-y-4 text-slate-600 text-xs sm:text-base leading-relaxed">
                <p>{t("about.storyP1")}</p>
                <p>{t("about.storyP2")}</p>
              </div>
            </div>

            {/* How We Work (4 Simple Steps) */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">{t("about.howWeWork")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {steps.map((s) => (
                  <div key={s.num} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-xs">
                        {s.num}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-normal pl-10">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Visual Image & Bench Values) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
              <img
                src={img}
                alt="Workshop workbench in Kigali"
                className="h-64 sm:h-72 w-full object-cover"
              />
              <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{t("common.workshop")}</p>
                <p className="text-xs text-slate-500 mt-0.5">{settings?.address || "Norvege, Karama, Kigali"}</p>
              </div>
            </div>

            {/* Why Trust Us Box */}
            <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5 sm:p-6">
              <h3 className="text-sm font-bold text-teal-900 mb-2">{t("about.whyTrustUs")}</h3>
              <ul className="space-y-2 text-xs text-teal-800">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{t("about.trust1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{t("about.trust2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{t("about.trust3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{t("about.trust4")}</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
