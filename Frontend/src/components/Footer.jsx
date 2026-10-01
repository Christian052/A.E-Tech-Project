import { Link } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";
import { useLanguage } from "../context/LanguageContext";

const img = "/A.E TECH 002.png";

export default function Footer() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-gradient-to-r from-[#031B33] via-[#032B45] to-[#004B5B] text-navy-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2 font-extrabold text-white">
            <img className="grid h-9 w-9 place-items-center rounded-lg bg-navy-800 text-sm text-teal-300" src={img} alt="logo" />
            {settings?.businessName || "AUGU SMART ELECTRONIC SERVICE LTD"}
          </div>
          <p className="text-sm text-navy-300">{settings?.brandTagline || "Computer Universe"}</p>
          <p className="mt-3 text-sm text-navy-300">{settings?.address || "Kigali - Nyarugenge - Norvege (Karama, Kigali)"}</p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">{t("nav.contact")}</h3>
          <ul className="space-y-2 text-sm text-navy-300">
            <li>
              <a className="hover:text-teal-300" href={`tel:${settings?.phone || "+250783432438"}`}>
                {settings?.phone || "+250 783 432 438"}
              </a>
            </li>
            <li>
              <a
                className="hover:text-teal-300"
                href={`https://wa.me/${(settings?.whatsapp || "+250725900732").replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp: {settings?.whatsapp || "+250 725 900 732"}
              </a>
            </li>
            <li>
              <a className="hover:text-teal-300" href={`mailto:${settings?.email || "augstintech2015@gmail.com"}`}>
                {settings?.email || "augstintech2015@gmail.com"}
              </a>
            </li>
            <li>
              {t("common.workingHours")}: {settings?.hours?.days || "Mon-Fri"}: {settings?.hours?.open || "10:00"} - {settings?.hours?.close || "18:00"}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">{t("footer.quickLinks")}</h3>
          <ul className="space-y-2 text-sm text-navy-300">
            <li><Link className="hover:text-teal-300" to="/services">{t("nav.services")}</Link></li>
            <li><Link className="hover:text-teal-300" to="/training">{t("nav.training")}</Link></li>
            <li><Link className="hover:text-teal-300" to="/gallery">{t("nav.gallery")}</Link></li>
            <li><Link className="hover:text-teal-300" to="/contact">{t("nav.contact")}</Link></li>
            <li><Link className="hover:text-teal-300" to="/admin/login">{t("nav.admin")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800 py-4 text-center text-xs text-navy-400">
        © {year} {settings?.businessName || "AUGU SMART ELECTRONIC SERVICE LTD"}. {t("footer.allRightsReserved")}
      </div>
    </footer>
  );
}
