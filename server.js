const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// 启用 CORS
app.use(cors());
app.use(express.json());

/******************** 内存数据库 ********************/
const memoryDB = {
  // 比赛基本信息
  competition_bases: [
    {
      competition_base_id: 1,
      competition: "新生杯",
      first_year: 2015,
      last_year: 2023,
      level: "院级",
      description: "高校|公开赛|线下|个人赛|--"
    },
    {
      competition_base_id: 2,
      competition: "围棋联赛",
      first_year: 2018,
      last_year: 2023,
      level: "校级",
      description: "高校|邀请赛|线下|团体赛|记团体成绩"
    }
  ],

  // 赛事详情
  competitions: [
    {
      competition_id: 101,
      year: 2023,
      competition: "第8届 新生杯（男子组）",
      start_date: "2023-09-10",
      end_date: "2023-09-20",
      location: "学生活动中心",
      total_round: 5,
      source: "校团委"
    },
    {
      competition_id: 102,
      year: 2023,
      competition: "第5届 围棋联赛（甲组）",
      start_date: "2023-10-01",
      end_date: "2023-10-07",
      location: "体育馆",
      total_round: 7,
      source: "围棋社"
    }
  ],

  // 对局记录
  competition_records: [
    {
      date: "2023-09-12",
      round: 1,
      table: "A01",
      black_player: "张三",
      black_team: "计算机学院",
      white_player: "李四",
      white_team: "文学院",
      result: "黑胜"
    },
    {
      date: "2023-09-15",
      round: 2,
      table: "B03",
      black_player: "王五",
      black_team: "数学学院",
      white_player: "张三",
      white_team: "计算机学院",
      result: "白胜"
    }
  ],

  // 队员信息
  players: [
    {
      id: 1001,
      name: "张三",
      enroll_year: 2021,
      college: "计算机学院",
      amateur_dan: "3段"
    },
    {
      id: 1002,
      name: "李四",
      enroll_year: 2022,
      college: "文学院",
      amateur_dan: "2段"
    }
  ],

  // 历史战绩（示例数据结构）
  player_history: {
    1001: [
      { year: 2023, total_wins: 8, total_losses: 2, win_rate: 80.00 },
      { year: null, total_wins: 15, total_losses: 5, win_rate: 75.00 }
    ]
  },

  // 对手交战记录
  opponent_records: {
    1001: [
      { opponent: "李四", total_win: 3, total_lose: 1, total_game: 4 },
      { opponent: "王五", total_win: 2, total_lose: 0, total_game: 2 }
    ]
  },

  // 对局记录
  game_records: {
    1001: [
      {
        date: "2023-09-12",
        name: "张三",
        opponent: "李四",
        result: "胜",
        competition: "新生杯",
        edition: 8,
        round: 1
      }
    ]
  },

  // 获奖信息
  awards: {
    1001: [
      {
        year: 2023,
        competition: "第8届新生杯（男子组）",
        honor: "个人第1名"
      }
    ]
  }
};

/******************** API 端点 ********************/
// 获取所有比赛信息
app.get('/api/competition_bases', (req, res) => {
  res.json(memoryDB.competition_bases);
});

// 获取某项赛事的具体信息
app.get('/api/competitions', (req, res) => {
  const competitionBaseId = req.query.competition_base_id;
  if (!competitionBaseId) {
    return res.status(400).json({ error: '缺少 competition_base_id 参数' });
  }
  
  const base = memoryDB.competition_bases.find(b => b.competition_base_id == competitionBaseId);
  const results = memoryDB.competitions.filter(c => 
    c.competition.includes(base.competition)
  );
  res.json(results);
});

// 获取某项赛事的对局记录
app.get('/api/competition_records', (req, res) => {
  res.json(memoryDB.competition_records);
});

// 获取所有队员信息
app.get('/api/players', (req, res) => {
  res.json(memoryDB.players);
});

// 获取某个队员的历史战绩
app.get('/api/history', (req, res) => {
  const playerId = req.query.player_id;
  if (!playerId) return res.status(400).json({ error: '缺少 player_id 参数' });
  res.json(memoryDB.player_history[playerId] || []);
});

// 获取某个队员的对手交战记录
app.get('/api/opponent', (req, res) => {
  const playerId = req.query.player_id;
  if (!playerId) return res.status(400).json({ error: '缺少 player_id 参数' });
  res.json(memoryDB.opponent_records[playerId] || []);
});

// 获取某个队员的对局记录
app.get('/api/records', (req, res) => {
  const playerId = req.query.player_id;
  if (!playerId) return res.status(400).json({ error: '缺少 player_id 参数' });
  res.json(memoryDB.game_records[playerId] || []);
});

// 获取某个队员的获奖信息
app.get('/api/awards', (req, res) => {
  const playerId = req.query.player_id;
  if (!playerId) return res.status(400).json({ error: '缺少 player_id 参数' });
  res.json(memoryDB.awards[playerId] || []);
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
