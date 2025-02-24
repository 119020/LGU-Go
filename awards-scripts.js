document.addEventListener('DOMContentLoaded', function () {
    const playData = await loadData('players');
    
    // 从 URL 参数中获取 player_id 和 player_name
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player_id');
    const playerName = urlParams.get('player_name');

    if (playerId && playerName) {
        // 显示队员姓名
        const awardsTitle = document.getElementById('awards-title');
        awardsTitle.textContent = `${playerName} 的获奖记录`;

        // 获取对局记录并渲染
        renderAwards(playData.awards[playerId]);
    } else {
        alert('未找到队员 ID 或姓名');
    }
});

// 数据加载函数
async function loadData(type) {
  try {
    const response = await fetch(`data/${type}.json`);
    return await response.json();
  } catch (error) {
    console.error('数据加载失败:', error);
    return {};
  }
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
