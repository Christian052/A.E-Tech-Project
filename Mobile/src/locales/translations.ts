/**
 * Localization translations for the Mobile App:
 * English, Kinyarwanda, and French.
 */

export type LanguageCode = "en" | "rw" | "fr";

export interface MobileTranslations {
  langName: string;
  flag: string;
  shortCode: string;
  tabs: {
    home: string;
    services: string;
    training: string;
    gallery: string;
    contact: string;
  };
  home: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    requestService: string;
    whatsapp: string;
    coreServices: string;
    coreServicesSubtitle: string;
    viewAll: string;
    trainingTitle: string;
    trainingSubtitle: string;
    explore: string;
    applyNow: string;
    internshipGuaranteed: string;
    whyChooseUs: string;
    why1: string;
    why2: string;
    why3: string;
  };
  services: {
    title: string;
    subtitle: string;
    loading: string;
    offlineMode: string;
  };
  training: {
    title: string;
    subtitle: string;
    loading: string;
    apply: string;
    internship: string;
  };
  contact: {
    title: string;
    subtitle: string;
    callUs: string;
    whatsapp: string;
    sendInquiry: string;
    name: string;
    phone: string;
    email: string;
    serviceNeeded: string;
    message: string;
    submit: string;
  };
  common: {
    search: string;
    offlineNotice: string;
    done: string;
    cancel: string;
    selectLanguage: string;
  };
}

export const mobileTranslations: Record<LanguageCode, MobileTranslations> = {
  en: {
    langName: "English",
    flag: "🇬🇧",
    shortCode: "EN",
    tabs: {
      home: "Home",
      services: "Services",
      training: "Training",
      gallery: "Gallery",
      contact: "Contact",
    },
    home: {
      badge: "Kigali's Premier IT & Electronics Center",
      heroTitle: "AUGU SMART ELECTRONIC SERVICE",
      heroSubtitle:
        "Professional Computer & Printer Repair, CCTV Installation, Networking, and Certified IT Training & Internships in Rwanda.",
      requestService: "Request Service",
      whatsapp: "WhatsApp",
      coreServices: "Our Core Services",
      coreServicesSubtitle: "Diagnostic, repair, and security solutions",
      viewAll: "View All",
      trainingTitle: "IT Training & Internship",
      trainingSubtitle: "Practical hardware and networking skills",
      explore: "Explore",
      applyNow: "Apply Now",
      internshipGuaranteed: "Internship Guaranteed",
      whyChooseUs: "Why Choose AUGU SMART?",
      why1: "Certified Technicians with 10+ Years Experience",
      why2: "Genuine Parts & Clear Warranty on All Repairs",
      why3: "Hands-on practical training with guaranteed internship",
    },
    services: {
      title: "Professional Tech Services",
      subtitle:
        "From micro-soldering and motherboard diagnostics to enterprise CCTV and optical networks across Kigali.",
      loading: "Loading IT & Repair Services...",
      offlineMode: "Offline Mode: Showing cached service requests & catalog.",
    },
    training: {
      title: "Vocational IT Training & Internship",
      subtitle:
        "Hands-on practical electronics & IT repair courses in Kigali. Gain real-world job readiness and guaranteed workshop internship.",
      loading: "Loading Vocational Training Programs...",
      apply: "Apply for Training",
      internship: "Internship Included",
    },
    contact: {
      title: "Contact & Service Booking",
      subtitle:
        "Have an urgent IT issue, printer repair, or CCTV consultation? Get in touch with our certified engineers.",
      callUs: "Call Us",
      whatsapp: "Fast Reply",
      sendInquiry: "Send an Inquiry or Quote Request",
      name: "Your Name *",
      phone: "Phone Number (WhatsApp preferred) *",
      email: "Email Address (Optional)",
      serviceNeeded: "Service Needed",
      message: "Describe Issue / Requirements *",
      submit: "Submit Request",
    },
    common: {
      search: "Search services, courses, docs...",
      offlineNotice: "Offline Mode: Showing cached data",
      done: "Done",
      cancel: "Cancel",
      selectLanguage: "Select Language / Hitamo Ururimi",
    },
  },
  rw: {
    langName: "Ikinyarwanda",
    flag: "🇷🇼",
    shortCode: "RW",
    tabs: {
      home: "Ahabanza",
      services: "Serivisi",
      training: "Amahugurwa",
      gallery: "Amafoto",
      contact: "Twandikire",
    },
    home: {
      badge: "Ikigo cy'Indashyikirwa mu gusana no kwigisha IT i Kigali",
      heroTitle: "SERIVISI YA AUGU SMART ELECTRONIC",
      heroSubtitle:
        "Gusana mudasobwa na za printer by'inzobere, gushyiraho camera za CCTV, imiyoboro ya interineti, n'amahugurwa y'umwuga arimo kwimenyereza umwuga mu Rwanda.",
      requestService: "Saba Serivisi",
      whatsapp: "WhatsApp",
      coreServices: "Serivisi Z'ingenzi Dutanga",
      coreServicesSubtitle: "Gusuzuma, gusana, n'umutekano w'ibikoresho",
      viewAll: "Reba Byose",
      trainingTitle: "Amahugurwa ya IT & Kwimenyereza Umwuga",
      trainingSubtitle: "Ubumenyi ngiro bujyanye n'ibyuma bya mudasobwa n'imiyoboro",
      explore: "Reba Amasomo",
      applyNow: "Iyandikishe Ubu",
      internshipGuaranteed: "Kwimenyereza Bizewe",
      whyChooseUs: "Kuki Uhitamo AUGU SMART?",
      why1: "Abatekinisiye b'inzobere bafite uburambe burenze imyaka 10",
      why2: "Ibyuma by'umwimerere na garanti ifatika kuri buri kintu cyasanywe",
      why3: "Kwiga mu buryo bw'ingiro bishingiye ku kwimenyereza umwuga k'inganda",
    },
    services: {
      title: "Serivisi Z'Umwuga z'Ikoranabuhanga",
      subtitle:
        "Gusana mudasobwa, gusuzuma amakarita (motherboard), gushyiraho camera za CCTV n'imiyoboro y'umurandasi i Kigali.",
      loading: "Turimo gupakira serivisi zo gusana...",
      offlineMode: "Nta Murandasi: Hari kugaragara serivisi ziri muri telefoni.",
    },
    training: {
      title: "Amahugurwa y'Umwuga ya IT & Kwimenyereza",
      subtitle:
        "Amasomo y'ubumenyingiro mu gusana ibyuma by'amashanyarazi na mudasobwa i Kigali. Itegure ku isoko ry'umurimo.",
      loading: "Turimo gupakira porogaramu z'amahugurwa...",
      apply: "Saba Kwiga",
      internship: "Harimo no kwimenyereza",
    },
    contact: {
      title: "Twandikire no Gusaba Serivisi",
      subtitle:
        "Ufite ikibazo cyihutirwa kuri mudasobwa, printer, cyangwa gushyira camera? Twandikire cyangwa udutere telephone.",
      callUs: "Duhamagare",
      whatsapp: "Igisubizo Byihuse",
      sendInquiry: "Ohereza Ubutumwa cyangwa Saba Igiciro",
      name: "Amazina Yawe *",
      phone: "Nimero ya Telefoni (WhatsApp) *",
      email: "Imeri Yawe (Ku babyifuza)",
      serviceNeeded: "Serivisi Wifuza",
      message: "Sobanura Ikibazo cyangwa Icyo Wifuza *",
      submit: "Ohereza Ubutumwa",
    },
    common: {
      search: "Shakisha serivisi, amasomo, amabwiriza...",
      offlineNotice: "Nta Murandasi: Hari kugaragara ibyabitswe mbere",
      done: "Byarangiye",
      cancel: "Kureka",
      selectLanguage: "Hitamo Ururimi",
    },
  },
  fr: {
    langName: "Français",
    flag: "🇫🇷",
    shortCode: "FR",
    tabs: {
      home: "Accueil",
      services: "Services",
      training: "Formations",
      gallery: "Galerie",
      contact: "Contact",
    },
    home: {
      badge: "Premier Centre IT & Électronique à Kigali",
      heroTitle: "AUGU SMART ELECTRONIC SERVICE",
      heroSubtitle:
        "Réparation professionnelle d'ordinateurs et imprimantes, installation de vidéosurveillance CCTV, réseaux et formations certifiantes avec stage au Rwanda.",
      requestService: "Demander un Service",
      whatsapp: "WhatsApp",
      coreServices: "Nos Principaux Services",
      coreServicesSubtitle: "Diagnostics, réparations et solutions de sécurité",
      viewAll: "Voir Tout",
      trainingTitle: "Formations IT & Stages Pratiques",
      trainingSubtitle: "Compétences pratiques en matériel et réseaux",
      explore: "Explorer",
      applyNow: "Postuler",
      internshipGuaranteed: "Stage Garanti",
      whyChooseUs: "Pourquoi Choisir AUGU SMART ?",
      why1: "Techniciens certifiés avec plus de 10 ans d'expérience",
      why2: "Pièces d'origine et garantie transparente sur chaque réparation",
      why3: "Apprentissage pratique sur établi avec stage garanti",
    },
    services: {
      title: "Services Informatiques Professionnels",
      subtitle:
        "De la micro-soudure et diagnostics de cartes mères aux réseaux CCTV et fibre optique à Kigali.",
      loading: "Chargement des services de réparation...",
      offlineMode: "Mode Hors-ligne : Données en cache affichées.",
    },
    training: {
      title: "Formations Professionnelles IT & Stages",
      subtitle:
        "Cours pratiques en réparation électronique et informatique à Kigali avec stage garanti en atelier.",
      loading: "Chargement des programmes de formation...",
      apply: "Postuler à la formation",
      internship: "Stage Inclus",
    },
    contact: {
      title: "Contact & Réservation de Service",
      subtitle:
        "Un problème informatique urgent, une réparation ou une installation CCTV ? Contactez nos ingénieurs certifiés.",
      callUs: "Appelez-nous",
      whatsapp: "Réponse Rapide",
      sendInquiry: "Envoyer une Demande ou un Devis",
      name: "Votre Nom *",
      phone: "Numéro de Téléphone (WhatsApp de préférence) *",
      email: "Adresse E-mail (Optionnel)",
      serviceNeeded: "Service Souhaité",
      message: "Décrivez le Problème ou vos Besoins *",
      submit: "Envoyer la Demande",
    },
    common: {
      search: "Rechercher des services, cours, manuels...",
      offlineNotice: "Mode Hors-ligne : Affichage du cache",
      done: "Terminé",
      cancel: "Annuler",
      selectLanguage: "Sélectionner la Langue",
    },
  },
};
