document.addEventListener('DOMContentLoaded', function () {
    // 从 URL 参数中获取 player_id 和 player_name
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player_id');
    const playerName = urlParams.get('player_name');

    if (playerId && playerName) {
        // 显示队员姓名
        const awardsTitle = document.getElementById('awards-title');
        awardsTitle.textContent = `${playerName} 的对局记录`;

        // 获取对局记录并渲染
        fetchAwards(playerId);
    } else {
        alert('未找到队员 ID 或姓名');
    }
});

// 获取某个队员的获奖记录
function fetchAwards(playerId) {
    fetch(`http://localhost:3000/api/awards?player_id=${playerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('获取获奖记录失败');
            }
            return response.json();
        })
        .then(awards => {
            renderAwards(awards);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取获奖记录失败，请稍后重试');
        });
}

// 渲染获奖记录
function renderAwards(awards) {
    const awardsContainer = document.getElementById('awards-list');
    if (!awardsContainer) return;

    awardsContainer.innerHTML = ''; // 清空容器

    if (awards.length === 0) {
        awardsContainer.innerHTML = `<p>暂无获奖记录</p>`;
        return;
    }

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
