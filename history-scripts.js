document.addEventListener('DOMContentLoaded', async () => {
    // 加载赛事数据
    const playData = await loadData('players');
    
    // 从 URL 参数中获取 player_id 和 player_name
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player_id');
    const playerName = urlParams.get('player_name');

    if (playerId && playerName) {
        // 获取对局记录并渲染
        renderHistory(playData.player_history[playerId], playerName);
        renderOpponents(playData.opponent_records[playerId], playerName);
        
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

// 渲染历史战绩
function renderHistory(history, playerName) {
    const historyTable = document.getElementById('history-table');
    if (!historyTable) return;

    historyTable.innerHTML = ''; // 清空容器

    if (history.length === 0) {
        historyTable.innerHTML = `<p>${playerName} 暂无历史战绩</p>`;
        return;
    }

    const title = document.createElement('h3');
    title.textContent = `${playerName}`;
    historyTable.appendChild(title);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>年份</th>
                <th>总胜场</th>
                <th>总负场</th>
                <th>胜率</th>
            </tr>
        </thead>
        <tbody>
            ${history.map(record => `
                <tr>
                    <td>${record.year || '总计'}</td>
                    <td>${record.total_wins}</td>
                    <td>${record.total_losses}</td>
                    <td>${record.win_rate}%</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    historyTable.appendChild(table);
}

// 渲染对手交战记录
function renderOpponents(opponents, playerName) {
    const opponentTable = document.getElementById('opponent-table');
    if (!opponentTable) return;

    opponentTable.innerHTML = ''; // 清空容器

    if (opponents.length === 0) {
        opponentTable.innerHTML = `<p>${playerName} 暂无对手交战记录</p>`;
        return;
    }

    const title = document.createElement('h3');
    title.textContent = `${playerName}`;
    opponentTable.appendChild(title);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>对手</th>
                <th>胜场</th>
                <th>负场</th>
                <th>总场次</th>
            </tr>
        </thead>
        <tbody>
            ${opponents.map(opponent => `
                <tr>
                    <td>${opponent.opponent}</td>
                    <td>${opponent.total_win}</td>
                    <td>${opponent.total_lose}</td>
                    <td>${opponent.total_game}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    opponentTable.appendChild(table);
}
