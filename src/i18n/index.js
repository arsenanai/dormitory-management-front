// src/i18n.js
import { createI18n } from 'vue-i18n'
import en from './en.json'
import kk from './kk.json'
import ru from './ru.json'

const messages = {
    en: en,
    kk: kk,
    ru: ru,
}

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages
})

export default i18n