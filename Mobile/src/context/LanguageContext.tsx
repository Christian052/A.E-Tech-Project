import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  mobileTranslations,
  LanguageCode,
  MobileTranslations,
} from "../locales/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: MobileTranslations;
  availableLanguages: { code: LanguageCode; name: string; flag: string; short: string }[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "AUGU_MOBILE_LANGUAGE";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    async function loadLang() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "en" || stored === "rw" || stored === "fr") {
          setLangState(stored);
        }
      } catch (e) {
        console.warn("[LanguageProvider] Failed to read stored language:", e);
      }
    }
    loadLang();
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    try {
      setLangState(newLang);
      await AsyncStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.error("[LanguageProvider] Failed to persist language:", e);
    }
  };

  const t = mobileTranslations[language] || mobileTranslations.en;

  const availableLanguages: {
    code: LanguageCode;
    name: string;
    flag: string;
    short: string;
  }[] = [
    { code: "en", name: "English", flag: "🇬🇧", short: "EN" },
    { code: "rw", name: "Ikinyarwanda", flag: "🇷🇼", short: "RW" },
    { code: "fr", name: "Français", flag: "🇫🇷", short: "FR" },
  ];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
