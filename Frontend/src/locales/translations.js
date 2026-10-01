import en from "./en/translation.json";
import rw from "./rw/translation.json";
import fr from "./fr/translation.json";

export const translations = {
  en: {
    ...en,
    langName: "English",
    flag: "🇬🇧",
    shortCode: "EN",
    dir: "ltr",
  },
  rw: {
    ...rw,
    langName: "Ikinyarwanda",
    flag: "🇷🇼",
    shortCode: "RW",
    dir: "ltr",
  },
  fr: {
    ...fr,
    langName: "Français",
    flag: "🇫🇷",
    shortCode: "FR",
    dir: "ltr",
  },
};
