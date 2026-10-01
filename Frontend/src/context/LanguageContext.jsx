import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "../locales/translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "augu_preferred_language";
const DEFAULT_LANGUAGE = "en";

/**
 * Safely resolves nested keys like "home.heroTitle" or "common.save"
 * with interpolation support (e.g. {{name}} or {{count}}).
 * If key is missing in selected language, falls back to English, then returns key.
 */
function resolveTranslation(dict, fallbackDict, keyPath, params = {}) {
  if (!keyPath || typeof keyPath !== "string") return "";

  const keys = keyPath.split(".");
  let current = dict;
  let fallback = fallbackDict;

  for (const k of keys) {
    current = current?.[k];
    fallback = fallback?.[k];
  }

  let result = typeof current === "string" ? current : typeof fallback === "string" ? fallback : keyPath;

  // Perform parameter interpolation (e.g. {{name}})
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([pKey, pVal]) => {
      result = result.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, "g"), String(pVal ?? ""));
    });
  }

  return result;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) return saved;

      // Browser locale detection for first-time visitors
      if (typeof navigator !== "undefined" && navigator.language) {
        const browserCode = navigator.language.slice(0, 2).toLowerCase();
        if (browserCode === "rw" || browserCode === "kin") return "rw";
        if (browserCode === "fr") return "fr";
      }
      return DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      const dir = translations[lang]?.dir || "ltr";
      document.documentElement.dir = dir;
    } catch {}
  }, [lang]);

  const currentDict = translations[lang] || translations.en;
  const fallbackDict = translations.en;

  // t function: t("home.heroTitle", { name: "John" })
  const t = useCallback(
    (keyPath, params = {}) => {
      return resolveTranslation(currentDict, fallbackDict, keyPath, params);
    },
    [currentDict, fallbackDict]
  );

  const setLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
    }
  };

  const availableLanguages = Object.entries(translations).map(([code, data]) => ({
    code,
    name: data.langName,
    flag: data.flag,
    short: data.shortCode,
    dir: data.dir || "ltr",
  }));

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        t,
        currentDict,
        availableLanguages,
        isRTL: currentDict.dir === "rtl",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
