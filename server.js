require('dotenv').config(); // 加载 .env 文件

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());

// 测试是否正确读取环境变量
console.log(process.env.PORT);
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);

// 从环境变量中获取 MySQL 连接信息
const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 连接数据库
pool.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('成功连接到 MySQL 数据库');
});


/*
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
*/

// 获取所有比赛信息
app.get('/api/competition_bases', (req, res) => {
    pool.query('SELECT  \
competition_base_id,\
competition_name AS `competition`,\
competition_first_year AS `first_year`,\
competition_last_year AS `last_year`,\
competition_level AS `level`,\
CONCAT_WS("|", \
(CASE WHEN is_institution_competition = 1 THEN "高校" ELSE "--" END), \
(CASE WHEN is_open_competition = 1 THEN "公开赛" ELSE "邀请赛" END), \
(CASE WHEN is_offline_competition = 1 THEN "线下" ELSE "线上" END), \
(CASE WHEN is_team_competition = 1 THEN "团体赛" ELSE "个人赛" END), \
(CASE WHEN has_team_result = 1 THEN "记团体成绩" ELSE "--" END)) AS `description` \
FROM Competition_bases', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库查询失败' });
        }
        res.json(results);
    });
});

// 获取某项赛事的具体信息
//player_name=${encodeURIComponent(playerName)
app.get('/api/competitions', (req, res) => {
    const competitionBaseId = req.query.competition_base_id;
    if (!competitionBaseId) {
        return res.status(400).json({ error: '缺少 competition_base_id 参数' });
    }
    // 使用子查询来获取队员的姓名（INNER JOIN 可能无法返回正确结果）
    pool.query('SELECT \
competition_year AS `year`,\
CONCAT("第", competition_edition, "届 ", competition_name, \
"（", competition_group, "）") AS `competition`, \
competition_start_date AS `start_date`, \
competition_end_date AS `end_date`, \
competition_location AS `location`, \
competition_total_round AS `total_round`, \
competition_source AS `source` \
FROM Competitions \
WHERE competition_name = (SELECT competition_name FROM Competition_bases \
			Where competition_base_id = ?)', [competitionBaseId], (err, results) => { 
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库查询失败' });
        }
        res.json(results);
    });
});

// 获取某项赛事的对局记录
//player_name=${encodeURIComponent(playerName)
app.get('/api/competition_records', (req, res) => {
    const competitionId = req.query.competition_id;
    if (!competitionId) {
        return res.status(400).json({ error: '缺少 competition_id 参数' });
    }
    // 使用子查询来获取队员的姓名（INNER JOIN 可能无法返回正确结果）
    pool.query('SELECT DISTINCT g.game_date AS `date`, \
g.game_round AS `round`, \
g.game_table AS `table`, \
g.black_player, \
g.black_team, \
g.white_player, \
g.white_team, \
g.game_result AS `result` \
FROM GameRecords g \
INNER JOIN Competitions c ON (c.competition_name, c.competition_edition, c.competition_group) = (g.competition_name, g.competition_edition, g.competition_group) \
WHERE c.competition_id = ? \
ORDER BY g.game_round ASC, g.game_table ASC', [competitionId], (err, results) => { 
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库查询失败' });
        }
        res.json(results);
    });
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

// 获取某个队员的历史战绩
app.get('/api/history', (req, res) => {
    const playerId = req.query.player_id;
    if (!playerId) {
        return res.status(400).json({ error: '缺少 player_id 参数' });
    }
    pool.query('SELECT \
    c.competition_year as `year`,\
    SUM(pic.player_win_count) as total_wins, \
    SUM(pic.player_lose_count) as total_losses, \
    ROUND(SUM(pic.player_win_count) * 100.0 / (SUM(pic.player_win_count) + SUM(pic.player_lose_count)), 2) as win_rate \
    FROM Players p \
    NATURAL JOIN Players_in_competitions pic \
    NATURAL JOIN Competitions c \
    WHERE p.player_id = ? \
    GROUP BY c.competition_year WITH ROLLUP \
    ORDER BY c.competition_year IS NOT NULL DESC', [playerId], (err, results) => { 
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '数据库查询失败' });
        }
        res.json(results);
    });
});

// 获取某个队员的对手交战记录
app.get('/api/opponent', (req, res) => {
    const playerId = req.query.player_id;
    if (!playerId) {
        return res.status(400).json({ error: '缺少 player_id 参数' });
    }
    pool.query('SELECT \
    (CASE WHEN g.school_player_color = "黑" THEN g.white_player ELSE g.black_player END) as opponent, \
    SUM(CASE WHEN g.school_player_result = "胜" THEN 1 ELSE 0 END) as total_win, \
    SUM(CASE WHEN g.school_player_result = "负" THEN 1 ELSE 0 END) as total_lose, \
    COUNT(*) as total_game \
	FROM GameRecords as g \
    INNER JOIN Players p ON p.player_name = g.school_player_name \
    WHERE p.player_id = ? \
    GROUP BY opponent \
    ORDER BY total_game DESC, total_win DESC', [playerId], (err, results) => { 
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

// 获取某个队员的获奖信息
app.get('/api/awards', (req, res) => {
    const playerId = req.query.player_id;
    if (!playerId) {
        return res.status(400).json({ error: '缺少 player_id 参数' });
    }
    pool.query('SELECT \
c.competition_year as `year`, \
CONCAT("第", ibr.competition_edition, "届", ibr.competition_name, \
" (", ibr.competition_group, ")") AS `competition`, \
CONCAT((CASE WHEN ibr.competition_group IS NOT NULL THEN "个人" ELSE "团体" END), \
"第", ibr.best_player_rank, "名") AS `honor` \
FROM Individuals_best_results ibr \
NATURAL JOIN Competitions c \
WHERE ibr.has_individual_prize = 1 and \
ibr.best_player_name = (SELECT p.player_name FROM Players p WHERE p.player_id = ?) \
UNION \
SELECT \
c.competition_year as `year`, \
CONCAT("第", tr.competition_edition, "届", tr.competition_name, \
" (", tr.competition_group, ")") AS `competition`, \
CONCAT((CASE WHEN tr.team_name IS NOT NULL THEN "团体" ELSE "个人" END), \
"第", tr.team_rank, "名") AS `honor` \
FROM Teams_results tr \
NATURAL JOIN Competitions c \
INNER JOIN Players_in_Competitions pc ON (pc.competition_name, pc.competition_edition, pc.competition_group, pc.player_team) = (tr.competition_name, tr.competition_edition, tr.competition_group, tr.team_name) \
WHERE tr.has_team_prize = 1 and \
pc.player_name = (SELECT p.player_name FROM Players p WHERE p.player_id = ?)', [playerId, playerId], (err, results) => { 
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
