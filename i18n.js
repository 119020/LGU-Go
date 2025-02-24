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
  try {
    const response = await fetch(`locales/${lng}/translation.json`);
    const resources = await response.json();
    
    i18n.addResourceBundle(lng, 'translation', resources);
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      throw new Error(`加载${lng}语言包失败`);
    }
    await i18n.changeLanguage(lng);
  } catch (error) {
    console.error('语言加载错误:', error);
  }
}

// 初始化语言
(async () => {
  const initialLanguage = localStorage.getItem('i18nextLng') || 'zh';
  await loadLanguage(initialLanguage);
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

  // 动态生成新闻内容
  const newsContainer = document.querySelector('.news-carousel-inner');
  const newsTemplate = document.getElementById('news-template');
  newsContainer.innerHTML = '';
  
  i18n.t('news.items', { returnObjects: true }).forEach((item, index) => {
    const clone = newsTemplate.content.cloneNode(true);
    clone.querySelector('img').src = `images/news${index + 1}.${index === 5 ? 'JPG' : 'jpg'}`;
    clone.querySelector('p').setAttribute('data-i18n', `news.items.${index}.text`);
    newsContainer.appendChild(clone);
  });

  // 重新初始化轮播逻辑（原有scripts.js中的功能）
  initCarousel(); 
}

function initCarousel() {
    // 克隆前三个项目添加到末尾实现无缝滚动
    const items = document.querySelectorAll('.news-item');
    items.forEach((item, index) => {
        if(index < 3) {
            const clone = item.cloneNode(true);
            carouselInner.appendChild(clone);
        }
    });
}

// 暴露语言切换方法
window.changeLanguage = async (lng) => {
  await loadLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
  updateContent();
};
