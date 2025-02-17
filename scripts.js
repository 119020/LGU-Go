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

    // 获取某个队员的对局记录并渲染到页面（示例：player_id=1）
    const playerId = 1; // 这里可以根据需要动态设置 player_id
    fetchRecords(playerId);
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
            <button onclick="fetchRecords(${player.id})">查看对局记录</button>
        `;
        playersContainer.appendChild(playerDiv);
    });
}

// 获取某个队员的对局记录
function fetchRecords(playerId) {
    fetch(`http://localhost:3000/api/records?player_id=${playerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('获取对局记录失败');
            }
            return response.json();
        })
        .then(records => {
            renderRecords(records);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取对局记录失败，请稍后重试');
        });
}

// 渲染对局记录
function renderRecords(records) {
    const recordsContainer = document.getElementById('records-list');
    if (!recordsContainer) return;

    recordsContainer.innerHTML = ''; // 清空容器

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p>暂无对局记录</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>日期</th>
                <th>对手</th>
                <th>比赛名称</th>
                <th>届次</th>
                <th>轮次</th>
                <th>结果</th>
            </tr>
        </thead>
        <tbody>
            ${records.map(record => `
                <tr>
                    <td>${record.date.getDate()}</td>
                    <td>${record.opponent}</td>
                    <td>${record.competition}</td>
                    <td>${record.edition}</td>
                    <td>${record.round}</td>
                    <td>${record.result}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    recordsContainer.appendChild(table);
}
