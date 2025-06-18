document.addEventListener('DOMContentLoaded', async () => {
    // 加载赛事数据
    const compData = await loadData('competitions');
    
    // 从 URL 参数中获取 competition_id 和 competition_name
    const urlParams = new URLSearchParams(window.location.search);
    const competitionId = urlParams.get('competition_id');
    const competitionName = urlParams.get('competition_name');

    if (competitionId && competitionName) {
        // 获取对局记录并渲染
        renderCompetitionRecords(compData.competition_records[competitionId], competitionName);
    } else {
        alert('未找到赛事 ID 或名称');
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
function renderCompetitionRecords(records, competitionName) {
    const recordsTitle = document.getElementById('competition-records-title');
    const recordsTable = document.getElementById('competition-records-table');
    if (!recordsTitle || !recordsTable) return;

    if (records.length === 0) {
        recordsTable.innerHTML = '<p>暂无对局记录</p>';
        return;
    }

    // 设置对局记录标题
    recordsTitle.textContent = `${competitionName}赛事对局记录`;

    // 渲染对局记录表格
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>日期</th>
                <th>轮次</th>
                <th>台次</th>
                <th>黑方</th>
                <th>黑方队伍</th>
                <th>白方</th>
                <th>白方队伍</th>
                <th>结果</th>
            </tr>
        </thead>
        <tbody>
            ${records.map(record => {
                const hasValidLink = record.result && 
                                    (record.result.startsWith('http://') || 
                                     record.result.startsWith('https://'));
                
                const sourceDisplay = hasValidLink 
                    ? `<a href="${record.result}" target="_blank" class="source-link">查看棋谱</a>` 
                    : (record.result || '暂无棋谱');
                
                return `
                <tr>
                    <td>${formatBeijingDate(record.date)}</td>
                    <td>${record.round}</td>
                    <td>${record.table}</td>
                    <td>${record.black_player}</td>
                    <td>${record.black_team}</td>
                    <td>${record.white_player}</td>
                    <td>${record.white_team}</td>
                    <td>${sourceDisplay}</td>
                </tr>
                `;
            }).join('')}
        </tbody>
    `;
    recordsTable.appendChild(table);
}
