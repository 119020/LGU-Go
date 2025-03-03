// 初始化配置
const i18n = i18next.createInstance();

// 使用同步初始化配置
await i18n
  .use(i18nextBrowserLanguageDetector)
  .init({
    fallbackLng: 'zh',
    debug: false,
    defaultNS: 'translation', // 关键配置
    resources: {
      zh: { translation: {} }, // 预置空对象占位
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage']
    },
    initImmediate: false // 强制同步初始化
  });

async function loadLanguage(lng) {
  try {
    // 同步加载资源
    const response = await fetch(`locales/${lng}/translation.json`);
    const resources = await response.json();
    
    // 同步更新资源
    i18n.addResourceBundle(lng, 'translation', resources);
    i18n.store.data[lng].translation = resources.translation;
    
    // 强制重载语言
    await i18n.changeLanguage(lng, (err) => {
      if (!err) {
        console.log('语言资源已完全加载');
      }
    });
  } catch (error) {
    console.error('加载失败:', error);
  }
}

// 更新页面内容
function updateContent() {
    // 使用 requestAnimationFrame 确保DOM更新
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = i18n.t(el.dataset.i18n, { lng: 'zh' });
    });
  });
}

// 暴露语言切换方法
window.changeLanguage = async (lng) => {
  await loadLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
  updateContent();
};
