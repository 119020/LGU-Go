// 轮播图功能（示例）
let currentNewsIndex = 0;
const newsItems = document.querySelectorAll('.news-item');

function showNextNews() {
    newsItems[currentNewsIndex].style.display = 'none';
    currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    newsItems[currentNewsIndex].style.display = 'block';
}
setInterval(showNextNews, 5000); // 每5秒切换一次

document.addEventListener('DOMContentLoaded', function () {
    // 获取所有队员信息并渲染到页面
    fetchPlayers();
});

// 获取所有队员信息
function fetchPlayers() {
    fetch('http://localhost:3000/api/players')
        .then(response => {
            if (!response.ok) {
                throw new Error('获取队员信息失败');
            }
            return response.json();
        })
        .then(players => {
            renderPlayers(players);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取队员信息失败，请稍后重试');
        });
}

// 渲染队员信息
function renderPlayers(players) {
    const playersContainer = document.getElementById('players-list');
    if (!playersContainer) return;

    playersContainer.innerHTML = ''; // 清空容器

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.innerHTML = `
            <h3>${player.name}</h3>
            <p>入学年份: ${player.enroll_year}年</p>
            <p>所在书院: ${player.college}书院</p>
            <p>业余段位: ${player.amateur_dan}段</p>
            <button onclick="fetchAwards(${player.id}, '${player.name}')">查询获奖记录</button>
            <button onclick="viewRecords(${player.id}, '${player.name}')">查看对局记录</button>
        `;
        playersContainer.appendChild(playerDiv);
    });
}

// 跳转到 record.html 页面，并传递 player_id 和 player_name
function viewRecords(playerId, playerName) {
    // 跳转到 record.html，并将 player_id 和 player_name 作为 URL 参数
    window.location.href = `records.html?player_id=${playerId}&player_name=${encodeURIComponent(playerName)}`;
}

// 获取某个队员的获奖记录
function fetchAwards(playerId, playerName) {
    fetch(`http://localhost:3000/api/awards?player_id=${playerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('获取获奖记录失败');
            }
            return response.json();
        })
        .then(awards => {
            renderAwards(awards, playerName);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取获奖记录失败，请稍后重试');
        });
}

// 渲染获奖记录
function renderAwards(awards, playerName) {
    const awardsContainer = document.getElementById('awards-list');
    if (!awardsContainer) return;

    awardsContainer.innerHTML = ''; // 清空容器

    if (awards.length === 0) {
        awardsContainer.innerHTML = `<p>${playerName} 暂无获奖记录</p>`;
        return;
    }

    const title = document.createElement('h3');
    title.textContent = `${playerName} 的获奖记录`;
    awardsContainer.appendChild(title);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>年份</th>
                <th>比赛名称</th>
                <th>荣誉</th>
            </tr>
        </thead>
        <tbody>
            ${awards.map(award => `
                <tr>
                    <td>${award.year}</td>
                    <td>${award.competition}</td>
                    <td>${award.honor}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    awardsContainer.appendChild(table);
}
