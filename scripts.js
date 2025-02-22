// 优化后的轮播功能
let currentScrollPosition = 0;
let scrollAmount = 0;
const carouselInner = document.querySelector('.news-carousel-inner');
const itemWidth = document.querySelector('.news-item').offsetWidth + 30; // 包含间距

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

function scrollNext() {
    const maxScroll = carouselInner.scrollWidth - carouselInner.clientWidth;
    scrollAmount = Math.min(scrollAmount + itemWidth, maxScroll);
    smoothScroll();
}

function scrollPrev() {
    scrollAmount = Math.max(scrollAmount - itemWidth, 0);
    smoothScroll();
}

function smoothScroll() {
    carouselInner.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
    
    // 检测是否到达克隆项区域
    if(scrollAmount >= carouselInner.scrollWidth - carouselInner.clientWidth * 2) {
        setTimeout(() => {
            carouselInner.scrollLeft = 0;
            scrollAmount = 0;
        }, 500);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    
    // 自动播放
    setInterval(() => {
        scrollNext();
    }, 5000);
});
