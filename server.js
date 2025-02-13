const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// 启用 CORS
app.use(cors());

// 创建 MySQL 连接池
const pool = mysql.createPool({
    host: 'localhost',      // 数据库地址
    user: 'root',           // 数据库用户名
    password: '#Cstdio41',   // 数据库密码
    database: 'lgu_go', // 数据库名称
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 获取所有队员信息
app.get('/api/players', (req, res) => {
    pool.query('SELECT * FROM Players', (err, results) => {
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
    pool.query('SELECT * FROM GameRecords \
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