// 优化后的轮播功能
let currentScrollPosition = 0;
let scrollAmount = 0;
const carouselInner = document.querySelector('.news-carousel-inner');
const itemWidth = document.querySelector('.news-item').offsetWidth + 30; // 包含间距

// 修改后的轮播初始化
function initCarousel() {
    const carouselInner = document.querySelector('.news-carousel-inner');
    if (!carouselInner) {
        console.error('轮播容器未找到');
        return;
    }

    // 等待DOM更新完成
    setTimeout(() => {
        const items = document.querySelectorAll('.news-item');
        if (items.length === 0) {
            console.error('轮播项未找到');
            return;
        }

        // 克隆前三个项目实现无缝滚动
        items.forEach((item, index) => {
            if (index < 3) {
                const clone = item.cloneNode(true);
                carouselInner.appendChild(clone);
            }
        });

        // 初始化轮播参数
        window.carouselInner = carouselInner;
        window.scrollAmount = 0;
        window.itemWidth = items[0].offsetWidth + 30;
    }, 100); // 给DOM更新留出时间
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

// 统一事件监听器
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 显示加载状态
        document.querySelector('.loading').style.display = 'flex';
        
        // 先获取数据
        await Promise.all([
            fetchPlayers(),
            fetchCompetitions()
        ]);
        
        // 数据加载完成后初始化轮播
        initCarousel();
        
        // 设置自动播放
        let autoPlay = setInterval(scrollNext, 5000);
        
        // 按钮事件绑定
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
        
    } catch (error) {
        console.error('初始化失败:', error);
        // 可以在这里添加错误提示
    } finally {
        // 隐藏加载状态
        document.querySelector('.loading').style.display = 'none';
    }
});


async function fetchCompetitions() {
    try {
        const response = await fetch('http://localhost:3000/api/competition_bases');
        if (!response.ok) throw new Error('获取赛事信息失败');
        const competitions = await response.json();
        console.log('赛事数据:', competitions); // 调试用
        renderCompetitions(competitions);
    } catch (error) {
        console.error('Error:', error);
        alert('获取赛事信息失败，请稍后重试');
    }
}

// 渲染赛事信息
function renderCompetitions(competitions) {
    const competitionsContainer = document.getElementById('competitions-list');
    if (!competitionsContainer) return;

    competitionsContainer.innerHTML = ''; // 清空容器
    
    if (competitions.length === 0) {
        competitionsContainer.innerHTML = '<p>暂无赛事信息</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>赛事名称</th>
                <th>首次举办年份</th>
                <th>最近举办年份</th>
                <th>赛事级别</th>
                <th>赛事描述</th>
            </tr>
        </thead>
        <tbody>
            ${competitions.map(competition => `
                <tr>
                    <td><a href="competitions.html?competition_base_id=${competition.competition_base_id}&competition_name=${encodeURIComponent(competition.competition)}">${competition.competition}</a></td>
                    <td>${competition.first_year}</td>
                    <td>${competition.last_year}</td>
                    <td>${competition.level}</td>
                    <td>${competition.description}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    competitionsContainer.appendChild(table);
}

// 修改后的数据获取函数
async function fetchPlayers() {
    try {
        const response = await fetch('http://localhost:3000/api/players');
        if (!response.ok) throw new Error('获取队员信息失败');
        const players = await response.json();
        console.log('队员数据:', players); // 调试用
        renderPlayers(players);
    } catch (error) {
        console.error('Error:', error);
        alert('获取队员信息失败，请稍后重试');
    }
}

// 渲染队员信息
// 优化后的 renderPlayers 函数
function renderPlayers(players) {
    const playersContainer = document.getElementById('players-list');
    if (!playersContainer) return;

    playersContainer.innerHTML = '';

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.innerHTML = `
            <h3>${player.name}</h3>
            <p>🎓 入学年份: ${player.enroll_year}年</p>
            <p>🏛️ 所在书院: ${player.college}书院</p>
            <p>🏅 业余段位: ${player.amateur_dan}段</p>
            <div class="button-group">
                <button onclick="viewAwards(${player.id}, '${player.name}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    获奖记录
                </button>
                <button onclick="viewHistory(${player.id}, '${player.name}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 2.03V4.05C17.39 4.59 20.5 8.58 19.96 12.97C19.5 16.61 16.64 19.5 13 19.93V21.93C18.55 21.38 22.5 16.5 21.95 11C21.45 6.25 17.73 2.5 13 2.03ZM11 2.06C9.05 2.25 7.19 3 5.67 4.26L7.1 5.74C8.22 4.84 9.57 4.26 11 4.06V2.06M4.26 5.67C3 7.19 2.25 9.04 2.05 11H4.05C4.24 9.58 4.8 8.23 5.69 7.1L4.26 5.67M2.06 13C2.26 14.96 3.03 16.81 4.27 18.33L5.69 16.9C4.81 15.77 4.24 14.42 4.06 13H2.06M7.1 18.37L5.67 19.74C7.18 21 9.04 21.79 11 22V20C9.58 19.82 8.23 19.2 7.1 18.37M16.82 15.19L12 21.07L7.18 15.19C6.45 15.97 5.93 16.93 5.68 18H11V22H13V18H18.32C18.07 16.93 17.55 15.97 16.82 15.19Z"/>
                    </svg>
                    历史战绩
                </button>
                <button onclick="viewRecords(${player.id}, '${player.name}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M7 12H9V17H7V12M15 7H17V17H15V7M11 14H13V17H11V14M11 10H13V12H11V10Z"/>
                    </svg>
                    对局记录
                </button>
            </div>
        `;
        playersContainer.appendChild(playerDiv);
    });
}

// 跳转到 awards.html 页面，并传递 player_id 和 player_name
function viewAwards(playerId, playerName) {
    // 跳转到 awards.html，并将 player_id 和 player_name 作为 URL 参数
    window.location.href = `awards.html?player_id=${playerId}&player_name=${encodeURIComponent(playerName)}`;
}

// 跳转到 records.html 页面，并传递 player_id 和 player_name
function viewRecords(playerId, playerName) {
    // 跳转到 records.html，并将 player_id 和 player_name 作为 URL 参数
    window.location.href = `records.html?player_id=${playerId}&player_name=${encodeURIComponent(playerName)}`;
}

// 跳转到 history.html 页面，并传递 player_id 和 player_name
function viewHistory(playerId, playerName) {
    // 跳转到 records.html，并将 player_id 和 player_name 作为 URL 参数
    window.location.href = `history.html?player_id=${playerId}&player_name=${encodeURIComponent(playerName)}`;
}
