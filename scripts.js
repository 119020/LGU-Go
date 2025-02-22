// 修改后的轮播功能
let currentIndex = 0;
let isAnimating = false;
const carouselInner = document.querySelector('.news-carousel-inner');
const items = document.querySelectorAll('.news-item');
const itemCount = items.length;
const itemWidth = items[0].offsetWidth + 30;

function initCarousel() {
    // 动态计算可见列数
    const containerWidth = carouselInner.parentElement.offsetWidth;
    const visibleColumns = Math.floor(containerWidth / (items[0].offsetWidth + 30));
    carouselInner.style.gridTemplateColumns = `repeat(${itemCount}, calc((100% - ${visibleColumns - 1} * 30px) / ${visibleColumns}))`;
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
    const maxScroll = (itemCount - 3) * itemWidth; // 3为可见项数
    
    carouselInner.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    carouselInner.style.transform = `translateX(-${Math.min(scrollPos, maxScroll)}px)`;

    carouselInner.addEventListener('transitionend', () => {
        // 边界处理：当滚动到真实最后一项时重置位置
        if (currentIndex === itemCount - 1 && direction === 'next') {
            currentIndex = 0;
            carouselInner.style.transition = 'none';
            carouselInner.style.transform = 'translateX(0)';
        }
        isAnimating = false;
    }, { once: true });
}

// 窗口大小变化时重新初始化
window.addEventListener('resize', () => {
    initCarousel();
    carouselInner.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
});

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
