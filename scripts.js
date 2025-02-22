// 修改后的轮播功能
let currentIndex = 0;
let isAnimating = false;
const carouselInner = document.querySelector('.news-carousel-inner');
const items = document.querySelectorAll('.news-item');
const itemCount = items.length;
const itemWidth = items[0].offsetWidth + 30;

function initCarousel() {
    // 移除克隆逻辑（改为纯循环）
    carouselInner.style.gridTemplateColumns = `repeat(${itemCount}, calc((100% - (3 - 1) * 30px) / 3))`;
}

function scrollNext() {
    if (isAnimating) return;
    isAnimating = true;
    
    currentIndex = (currentIndex + 1) % itemCount;
    updateCarousel('next');
}

function scrollPrev() {
    if (isAnimating) return;
    isAnimating = true;
    
    currentIndex = (currentIndex - 1 + itemCount) % itemCount;
    updateCarousel('prev');
}

function updateCarousel(direction) {
    const scrollPos = currentIndex * itemWidth;
    
    // 使用CSS transition实现平滑滚动
    carouselInner.style.transition = 'transform 0.5s ease-in-out';
    carouselInner.style.transform = `translateX(-${scrollPos}px)`;

    // 监听动画结束
    carouselInner.addEventListener('transitionend', () => {
        isAnimating = false;
        carouselInner.style.transition = 'none';
        
        // 循环处理
        if (currentIndex === itemCount - 1 && direction === 'next') {
            currentIndex = 0;
            carouselInner.style.transform = `translateX(0)`;
        } else if (currentIndex === 0 && direction === 'prev') {
            currentIndex = itemCount - 1;
            carouselInner.style.transform = `translateX(-${(itemCount - 1) * itemWidth}px)`;
        }
    }, { once: true });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    
    // 自动播放
    let autoPlay = setInterval(scrollNext, 5000);
    
    // 按钮事件
    document.querySelector('.btn-next').addEventListener('click', () => {
        clearInterval(autoPlay);
        scrollNext();
        autoPlay = setInterval(scrollNext, 5000);
    });
    
    document.querySelector('.btn-prev').addEventListener('click', () => {
        clearInterval(autoPlay);
        scrollPrev();
        autoPlay = setInterval(scrollNext, 5000);
    });
});
