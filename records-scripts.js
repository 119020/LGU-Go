document.addEventListener('DOMContentLoaded', function () {
    // 从 URL 参数中获取 player_id 和 player_name
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player_id');
    const playerName = urlParams.get('player_name');

    if (playerId && playerName) {
        // 显示队员姓名
        const recordsTitle = document.getElementById('records-title');
        recordsTitle.textContent = `${playerName} 的对局记录`;

        // 获取对局记录并渲染
        fetchRecords(playerId);
    } else {
        alert('未找到队员 ID 或姓名');
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

/**
 * 将 UTC 时间转换为北京时间，并格式化为 yyyy-mm-dd
 * @param {string} utcDate - UTC 时间字符串（如 "2023-10-01T16:00:00.000Z"）
 * @returns {string} - 格式化后的北京时间（如 "2023-10-02"）
 */
function formatBeijingDate(utcDate) {
    // 1. 将 UTC 时间字符串转换为 Date 对象
    const date = new Date(utcDate);

    // 2. 转换为北京时间（UTC+8）
    const beijingOffset = 8 * 60; // 北京时区偏移量（分钟）
    const localTime = date.getTime() + (date.getTimezoneOffset() + beijingOffset) * 60 * 1000;

    // 3. 创建新的 Date 对象表示北京时间
    const beijingDate = new Date(localTime);

    // 4. 格式化日期为 yyyy-mm-dd
    const year = beijingDate.getFullYear();
    const month = String(beijingDate.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
    const day = String(beijingDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
                    <td>${formatBeijingDate(record.date)}</td>
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
