// 轮播图功能（示例）
let currentNewsIndex = 0;
const newsItems = document.querySelectorAll('.news-item');

function showNextNews() {
    newsItems[currentNewsIndex].style.display = 'none';
    currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
    newsItems[currentNewsIndex].style.display = 'block';
}
setInterval(showNextNews, 5000); // 每5秒切换一次

// 可以在这里添加一些交互功能，比如动态加载数据
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/players')
        .then(response => response.json())
        .then(data => {
            console.log('队员信息:', data);
            // 在这里将数据渲染到页面
            renderPlayers(data);
        })
        .catch(error => {
            console.error('获取队员信息失败:', error);
        });
});

// 获取所有队员信息
function renderPlayers(players) {
    const container = document.getElementById('players-container');
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.innerHTML = `
            <h3>${player.name}</h3>
            <p>等级分: ${player.rank}</p>
            <p>简介: ${player.bio}</p>
            <img src="${player.photo}" alt="${player.name}" width="100">
        `;
        container.appendChild(playerElement);
    });
}

// 获取某个队员的比赛记录
function fetchRecords(playerId) {
    fetch(`http://localhost:3000/api/records?player_id=${playerId}`)
        .then(response => response.json())
        .then(data => {
            console.log('比赛记录:', data);
            // 在这里将数据渲染到页面
            renderRecords(data);
        })
        .catch(error => {
            console.error('获取比赛记录失败:', error);
        });
}

function renderRecords(records) {
    const container = document.getElementById('records-container');
    records.forEach(record => {
        const recordElement = document.createElement('div');
        recordElement.innerHTML = `
            <h4>${record.tournament_name}</h4>
            <p>日期: ${record.date}</p>
            <p>地点: ${record.location}</p>
            <p>结果: ${record.result}</p>
        `;
        container.appendChild(recordElement);
    });
}
