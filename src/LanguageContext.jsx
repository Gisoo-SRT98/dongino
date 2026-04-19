import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const DICT = {
  fa: {
    settings: "تنظیمات",
    home: "خانه",
    profile: "پروفایل",
    theme: "تم",
    dark: "تیره",
    light: "روشن",
    language: "زبان",
    newGroup: "ساخت گروه جدید",
    myGroups: "لیست گروه های من",
  },
  en: {
    settings: "Settings",
    home: "Home",
    profile: "Profile",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    newGroup: "Create new group",
    myGroups: "My groups",
  },
};

function normalizeLang(raw) {
  return raw === "en" || raw === "fa" ? raw : "fa";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("fa");

  useEffect(() => {
    const saved = normalizeLang(localStorage.getItem("lang"));
    setLangState(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (next) => setLangState(normalizeLang(next));

  const value = useMemo(() => {
    const dict = DICT[lang] ?? DICT.fa;
    const t = (key) => dict[key] ?? DICT.fa[key] ?? key;
    return { lang, setLang, t, languages: ["fa", "en"] };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

