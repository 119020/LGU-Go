// 初始化i18n空实例
const i18n = i18next.createInstance();

// 初始化配置
i18n.use(i18nextBrowserLanguageDetector).init({
  fallbackLng: ['zh', 'zh-CN', 'zh-Hans'],
  debug: false,
  defaultNS: 'translation', // 关键配置
  resources: {
      zh: { translation: {} }, // 预置空对象占位
  },
  detection: {
    order: ['querystring', 'cookie', 'localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

// 增强版加载函数
async function loadLanguage(lng) {
  const normalizedLng = lng.toLowerCase();
  
  try {
    // 清理旧资源
    i18n.store.data[normalizedLng] && delete i18n.store.data[normalizedLng].translation;
    
    // 加载新资源
    const response = await fetch(`locales/${normalizedLng}/translation.json`);
    const resources = await response.json();
    
    i18n.addResourceBundle(normalizedLng, 'translation', resources);
    await i18n.changeLanguage(normalizedLng);
    
    // 双重验证
    if (!i18n.hasResourceBundle(normalizedLng, 'translation')) {
      throw new Error('资源挂载失败');
    }
  } catch (error) {
    console.error('语言加载失败，启用紧急回退');
    await i18n.changeLanguage('zh');
  }
}

// 安全初始化流程
(async () => {
  localStorage.removeItem('i18nextLng'); // 清除污染数据
  await loadLanguage('zh');
  await new Promise(resolve => setTimeout(resolve, 50));
  updateContent();
})();

// 更新页面内容
function updateContent() {
  // 基础文本翻译
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = i18n.t(key);
  });

  // 属性翻译
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const [attr, key] = el.getAttribute('data-i18n-attr').split(':');
    el.setAttribute(attr, i18n.t(key));
  });
}

// 暴露语言切换方法
window.changeLanguage = async (lng) => {
  await loadLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
  updateContent();
};
