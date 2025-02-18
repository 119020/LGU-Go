document.addEventListener('DOMContentLoaded', function () {
    // 从 URL 参数中获取 competition_base_id
    const urlParams = new URLSearchParams(window.location.search);
    const competitionBaseId = urlParams.get('competition_base_id');

    if (competitionBaseId) {
        // 获取赛事详情并渲染
        fetchCompetitionDetails(competitionBaseId);
    } else {
        alert('未找到赛事 ID');
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

// 渲染赛事详情
function renderCompetitionDetails(details) {
    const competitionTitle = document.getElementById('competition-title');
    const competitionInfo = document.getElementById('competition-info');
    if (!competitionTitle || !competitionInfo) return;

    if (details.length === 0) {
        competitionInfo.innerHTML = '<p>暂无赛事详情</p>';
        return;
    }

    // 设置赛事标题
    competitionTitle.textContent = details[0].competition;

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
                    <td>${detail.competition}</td>
                    <td>${detail.start_date}</td>
                    <td>${detail.end_date}</td>
                    <td>${detail.location}</td>
                    <td>${detail.total_round}</td>
                    <td>${detail.source}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    competitionInfo.appendChild(table);
}
