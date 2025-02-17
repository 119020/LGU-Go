const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// 启用 CORS
app.use(cors());

// 创建 MySQL 连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('成功连接到 MySQL 数据库');
});

// 获取所有队员信息
app.get('/api/players', (req, res) => {
    pool.query('SELECT \
        p.player_id as `id`, \
        ps.player_name as `name`,\
        ps.enroll_year,\
        ps.enroll_college as `college`,\
        p.player_amateur_dan as `amateur_dan`\
        FROM Players_school ps \
        NATURAL JOIN Players p \
        ORDER BY p.player_id ASC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库查询失败' });
        }
        res.json(results);
    });
});

// 获取某个队员的对局记录
app.get('/api/records', (req, res) => {
    const playerId = req.query.player_id;
    if (!playerId) {
        return res.status(400).json({ error: '缺少 player_id 参数' });
    }
    // 使用子查询来获取队员的姓名（INNER JOIN 可能无法返回正确结果）
    pool.query('SELECT \
    g.game_date as `date`,\
    g.school_player_name as `name`,\
    (CASE WHEN g.school_player_color = "黑" THEN g.white_player ELSE g.black_player END) as opponent,\
g.school_player_result as `result`,\
    g.competition_name as `competition`,\
    g.competition_edition as `edition`,\
    g.game_round as `round`\
	FROM GameRecords as g\
	WHERE school_player_name = \
		(SELECT player_name FROM Players \
			Where player_id = ?)', [playerId], (err, results) => { 
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库查询失败' });
        }
        res.json(results);
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
