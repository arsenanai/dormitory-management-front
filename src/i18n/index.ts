// src/i18n.js
import { createI18n, I18nOptions } from 'vue-i18n';
import en from './en.json';
import kk from './kk.json';
import ru from './ru.json';

// Define the type for the messages
type MessageSchema = typeof en;

const messages: Record<string, MessageSchema> = {
  en: en,
  kk: kk,
  ru: ru,
};

const i18nOptions: I18nOptions = {
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
};

const i18n = createI18n<MessageSchema>(i18nOptions);

export default i18n;