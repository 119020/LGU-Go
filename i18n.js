// 配置i18n
const i18n = i18next.createInstance();

i18n.use(i18nextBrowserLanguageDetector).init({
  fallbackLng: 'zh',
  debug: false,
  resources: {
    zh: { translation: {} },
    en: { translation: {} },
    jp: { translation: {} }
  },
  detection: {
    order: ['querystring', 'cookie', 'localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

// 动态加载语言文件
async function loadLanguage(lng) {
  const response = await fetch(`locales/${lng}/translation.json`);
  const resources = await response.json();
  i18n.addResourceBundle(lng, 'translation', resources);
  i18n.changeLanguage(lng);
}

// 初始化加载默认语言
loadLanguage(i18n.language || 'zh');

export default i18n;
