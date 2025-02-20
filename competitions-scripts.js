document.addEventListener('DOMContentLoaded', function () {
    // 从 URL 参数中获取 competition_base_id 和 competition_name
    const urlParams = new URLSearchParams(window.location.search);
    const competitionBaseId = urlParams.get('competition_base_id');
    const competitionName = urlParams.get('competition_name');

    if (competitionBaseId && competitionName) {
        // 设置赛事标题
        const competitionTitle = document.getElementById('competition-title');
        competitionTitle.textContent = `${competitionName}`;
        
        // 获取赛事详情并渲染
        fetchCompetitionDetails(competitionBaseId);
    } else {
        alert('未找到赛事 ID 或名称');
    }
});

// 获取赛事详情
function fetchCompetitionDetails(competitionBaseId) {
    fetch(`http://localhost:3000/api/competitions?competition_base_id=${competitionBaseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('获取赛事详情失败');
            }
            return response.json();
        })
        .then(details => {
            renderCompetitionDetails(details);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('获取赛事详情失败，请稍后重试');
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

// 渲染赛事详情
function renderCompetitionDetails(details) {
    const competitionInfo = document.getElementById('competition-info');
    if (!competitionTitle || !competitionInfo) return;

    competitionInfo.innerHTML = ''; // 清空容器
    
    if (details.length === 0) {
        competitionInfo.innerHTML = '<p>${competitionName} 暂无赛事详情</p>';
        return;
    }

    // 渲染赛事详情表格
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>年份</th>
                <th>赛事名称</th>
                <th>开始日期</th>
                <th>结束日期</th>
                <th>地点</th>
                <th>总轮次</th>
                <th>信息来源</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(detail => `
                <tr>
                    <td>${detail.year}</td>
                    <td><a href="competition-records.html?competition_id=${detail.competition_id}competition_name=${encodeURIComponent(detail.competition)">${detail.competition}</a></td>
                    <td>${formatBeijingDate(detail.start_date)}</td>
                    <td>${formatBeijingDate(detail.end_date)}</td>
                    <td>${detail.location}</td>
                    <td>${detail.total_round}</td>
                    <td>${detail.source}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    competitionInfo.appendChild(table);
}
