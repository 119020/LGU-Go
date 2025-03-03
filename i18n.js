// 初始化i18n实例
const i18n = i18next.createInstance();

// 配置i18n
const initI18n = async () => {
  try {
    // 初始化i18n（同步模式）
    await i18n
      .use(i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: 'zh', // 默认语言
        debug: false, // 关闭调试日志
        defaultNS: 'translation', // 默认命名空间
        resources: {
          zh: { translation: {} }, // 预置空对象占位
        },
        detection: {
          order: ['querystring', 'cookie', 'localStorage', 'navigator'],
          caches: ['localStorage'],
        },
        initImmediate: false, // 强制同步初始化
      });

    // 加载中文资源
    await loadLanguage('zh');
  } catch (error) {
    console.error('i18n初始化失败:', error);
  }
};

// 动态加载语言资源
const loadLanguage = async (lng) => {
  try {
    // 加载语言文件
    const response = await fetch(`locales/${lng}/translation.json`);
    const resources = await response.json();

    // 同步更新资源
    i18n.addResourceBundle(lng, 'translation', resources);
    i18n.store.data[lng].translation = resources.translation;

    // 强制重载语言
    await i18n.changeLanguage(lng, (err) => {
      if (!err) {
        console.log('语言资源已完全加载:', lng);
      }
    });
  } catch (error) {
    console.error('语言加载失败:', error);
  }
};

// 更新页面内容
const updateContent = () => {
  // 使用 requestAnimationFrame 确保DOM更新
  requestAnimationFrame(() => {
    // 翻译所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = i18n.t(el.dataset.i18n, { lng: 'zh' });
    });

    // 翻译所有带 data-i18n-attr 属性的元素
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const [attr, key] = el.getAttribute('data-i18n-attr').split(':');
      el.setAttribute(attr, i18n.t(key, { lng: 'zh' }));
    });
  });
};

// 初始化页面
(async () => {
  // 显示加载遮罩
  document.getElementById('loading-overlay').style.display = 'block';

  // 初始化i18n并加载资源
  await initI18n();

  // 更新页面内容
  updateContent();

  // 隐藏加载遮罩
  document.getElementById('loading-overlay').style.display = 'none';
})();

// 暴露语言切换方法
window.changeLanguage = async (lng) => {
  try {
    // 显示加载遮罩
    document.getElementById('loading-overlay').style.display = 'block';

    // 加载目标语言资源
    await loadLanguage(lng);

    // 更新页面内容
    updateContent();

    // 隐藏加载遮罩
    document.getElementById('loading-overlay').style.display = 'none';
  } catch (error) {
    console.error('语言切换失败:', error);
  }
};
