import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Language,
  getTranslation,
  translations,
} from "@/lib/i18n/translations";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "@floodsync:language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("my"); // Default to Myanmar
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load saved language preference
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((savedLang) => {
        if (savedLang === "en" || savedLang === "my") {
          setLanguageState(savedLang as Language);
        } else {
          // If no saved preference, default to Myanmar
          setLanguageState("my");
        }
        setIsReady(true);
      })
      .catch(() => {
        setIsReady(true);
      });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
