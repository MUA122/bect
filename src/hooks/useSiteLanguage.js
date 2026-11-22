import { useEffect, useState } from "react";

const storageKey = "bect-language";

export default function useSiteLanguage() {
  const [language, setLanguage] = useState(() => {
    try {
      return window.localStorage.getItem(storageKey) === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // The switch also works when browser storage is unavailable.
    }
  }, [language]);

  return [language, setLanguage];
}
