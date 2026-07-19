import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const messages = {
  en,
  es,
  fr,
  de
};

export const i18n = createI18n({
  legacy: false, // use Composition API
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
