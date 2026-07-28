import React, { createContext, useContext, useState, useCallback } from 'react';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

export type Lang = 'en' | 'hi' | 'mr';

const DICTS: Record<Lang, Record<string, string>> = { en, hi, mr };
const LANG_KEY = 'divya_yoga_lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  translate: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return (saved === 'en' || saved === 'hi' || saved === 'mr') ? saved : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  const translate = useCallback(
    (key: string): string => DICTS[lang][key] ?? DICTS['en'][key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'hi', label: 'हि' },
  { value: 'mr', label: 'म' },
];
