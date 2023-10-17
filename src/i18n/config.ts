import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import zh from "./zh.json";

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};


const rendererInit = (lng: string = "") => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
      lng: lng || navigator.language,
      debug: false,
      interpolation: {
        escapeValue: false, // 不需要对翻译文本进行转义
      },
    });
}

// try {
//   rendererInit()
//   // console.log('i18n', i18n)
// } catch (error) {
//   // console.log('i18n error', error)
// }

const mainInit = (lng: string) => {
  return new Promise((res, rej) => {
    i18n.init({
      resources,
      fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
      lng,
      debug: false,
      interpolation: {
        escapeValue: false, // 不需要对翻译文本进行转义
      },
    }, () => res(true));
  })

}

export {
  rendererInit, mainInit
}