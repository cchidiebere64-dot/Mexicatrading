import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import esMx from "./locales/es-mx.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";
import ru from "./locales/ru.json";
import de from "./locales/de.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "es-MX": { translation: esMx },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
      ar: { translation: ar },
      zh: { translation: zh },
      ru: { translation: ru },
      de: { translation: de },
    },
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "mexica_language",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
