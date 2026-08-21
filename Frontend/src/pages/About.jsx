import { useSettings } from "../hooks/useSettings";
import img from '../../public/A.E TECH 001.jpg'

export default function About() {
  const { settings } = useSettings();

  const steps = [
    {
      num: 1,
      title: "Diagnose",
      desc: "We inspect and test the device or site before saying a price.",
    },
    {
      num: 2,
      title: "Quote",
      desc: "You get a clear cost and timeline, and you decide.",
    },
    {
      num: 3,
      title: "Repair or install",
      desc: "Work is done in the workshop or on-site, with real parts.",
    },
    {
      num: 4,
      title: "Hand over",
      desc: "We show you what changed and how to keep it working.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Dark Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-white pt-16 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest uppercase text-teal-400 block mb-3">
            ABOUT US
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 max-w-2xl leading-tight">
            A workshop built on honest diagnostics
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-normal max-w-2xl leading-relaxed">
            {settings?.businessName || "A.E. Tech"}, known locally as Computer Universe, serves homes, shops and offices across Kigali from our bench in Norvege, Karama.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Column (Story & How We Work) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Our Story */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Our story</h2>
              <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
                <p>
                  We started with a bench, a soldering iron and a simple rule: tell the customer what is actually wrong before charging anything. That rule turned into a workshop handling laptops, desktops, printers, office networks and CCTV systems across Nyarugenge and beyond.
                </p>
                <p>
                  Today the same bench also trains people. Our training and internship line puts students on live repairs and real installations, because IT skills are learned with your hands, not only from slides.
                </p>
              </div>
            </div>

            {/* How We Work Steps */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">How we work</h2>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                      <p className="text-xs md:text-sm text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Featured Image & Location Card) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Workshop Photo Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
              <img
                src={img}
                alt="Technician at work on hardware repair"
                className="h-96 w-full object-cover"
              />
            </div>

            {/* Visit Us Info Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Visit the workshop</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {settings?.address || "Kigali - Nyarugenge - Norvege (Karama, Kigali), Rwanda"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {settings?.hours?.days || "Mon - Fri"}: {settings?.hours?.open || "10:00 AM"} – {settings?.hours?.close || "6:00 PM"}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  settings?.address || "Kigali Nyarugenge Karama"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#032B45] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#021E31] transition-colors"
              >
                Get directions & contact
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}