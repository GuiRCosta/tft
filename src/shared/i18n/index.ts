import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ptBR } from './locales/pt-BR';
import { enUS } from './locales/en-US';

const STORAGE_KEY = 'tft-overlay-language';

function getSavedLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? 'pt-BR';
  } catch {
    return 'pt-BR';
  }
}

export function saveLanguage(lng: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // localStorage indisponivel
  }
}

export const supportedLanguages = [
  { code: 'pt-BR', label: 'Portugues (BR)' },
  { code: 'en-US', label: 'English (US)' },
] as const;

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
