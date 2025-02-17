document.addEventListener('DOMContentLoaded', function () {
    // 从 URL 参数中获取 player_id
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player_id');

    if (playerId) {
        // 获取对局记录并渲染
        fetchRecords(playerId);
    } else {
        alert('未找到队员 ID');
    }
});

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
                    <td>${record.date}</td>
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
