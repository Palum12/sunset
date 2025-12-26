import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pl from '../../src/locales/pl.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'pl',
  fallbackLng: 'pl',
  resources: {
    pl: { translation: pl },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
