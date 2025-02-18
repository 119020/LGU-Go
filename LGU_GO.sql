Drop database lgu_go;
-- 创建数据库
CREATE DATABASE IF NOT EXISTS lgu_go;
USE lgu_go;

-- 比赛基础信息表
CREATE TABLE Competition_bases (
    competition_base_id INT DEFAULT NULL,
    competition_name VARCHAR(100) PRIMARY KEY,
    competition_first_year INT DEFAULT NULL,
    competition_last_year INT DEFAULT NULL,
    competition_level VARCHAR(50) DEFAULT NULL,
    is_institution_competition BOOLEAN DEFAULT NULL,
    is_open_competition BOOLEAN DEFAULT NULL,
    is_online_competition BOOLEAN DEFAULT NULL,
    is_team_competition BOOLEAN DEFAULT NULL,
    has_team_name BOOLEAN DEFAULT NULL,
    has_team_result BOOLEAN DEFAULT NULL
);
ALTER TABLE Competition_bases
CHANGE is_online_competition 
is_offline_competition BOOLEAN DEFAULT NULL;

-- 具体比赛表
CREATE TABLE Competitions (
    competition_name VARCHAR(100),
    competition_edition INT,
    competition_group VARCHAR(50),
    competition_year INT DEFAULT NULL,
    competition_start_date DATE DEFAULT NULL,
    competition_end_date DATE DEFAULT NULL,
    competition_location VARCHAR(100) DEFAULT NULL,
    competition_total_round INT DEFAULT NULL,
    competition_source VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (competition_name, competition_edition, competition_group),
    FOREIGN KEY (competition_name) REFERENCES Competition_bases(competition_name)
);

-- 团体赛信息表
CREATE TABLE Competitions_with_teams (
    competition_name VARCHAR(100),
    competition_edition INT,
    competition_group VARCHAR(50),
    team_name VARCHAR(100),
    total_teammate_count INT DEFAULT NULL,
    PRIMARY KEY (competition_name, competition_edition, competition_group, team_name),
    FOREIGN KEY (competition_name, competition_edition, competition_group) 
        REFERENCES Competitions(competition_name, competition_edition, competition_group)
);

-- 个人赛信息表
CREATE TABLE Competitions_without_teams (
    competition_name VARCHAR(100),
    competition_edition INT,
    competition_group VARCHAR(50),
    total_player_count INT DEFAULT NULL,
    PRIMARY KEY (competition_name, competition_edition, competition_group),
    FOREIGN KEY (competition_name, competition_edition, competition_group) 
        REFERENCES Competitions(competition_name, competition_edition, competition_group)
);

-- 选手基本信息表
CREATE TABLE Players (
    player_id INT DEFAULT NULL,
    player_name VARCHAR(50) PRIMARY KEY,
    player_sex VARCHAR(10) DEFAULT NULL,
    player_birthplace VARCHAR(50) DEFAULT NULL,
    player_birthyear INT DEFAULT NULL,
    player_birthmonth INT DEFAULT NULL,
    is_our_player BOOLEAN DEFAULT NULL,
    is_team_player BOOLEAN DEFAULT NULL,
    player_amateur_dan INT DEFAULT NULL
);

-- 校队选手信息表
CREATE TABLE Players_school (
    player_name VARCHAR(50) PRIMARY KEY,
    enroll_year INT DEFAULT NULL,
    enroll_identity VARCHAR(50) DEFAULT NULL,
    enroll_college VARCHAR(100) DEFAULT NULL,
    is_club_leader BOOLEAN DEFAULT NULL,
    FOREIGN KEY (player_name) REFERENCES Players(player_name)
);

-- 研究生信息表
CREATE TABLE Players_graduates (
    player_name VARCHAR(50) PRIMARY KEY,
    enroll_identity VARCHAR(50) DEFAULT NULL,
    undergraduate_institute VARCHAR(100) DEFAULT NULL,
    undergraduate_institute_location VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (player_name) REFERENCES Players_school(player_name)
);

-- 深圳联赛选手信息表
CREATE TABLE Players_team (
    player_name VARCHAR(50) PRIMARY KEY,
    team_dan INT DEFAULT NULL,
    team_initial_dan INT DEFAULT NULL,
    team_first_year INT DEFAULT NULL,
    team_last_year INT DEFAULT NULL,
    team_details TEXT DEFAULT NULL,
    FOREIGN KEY (player_name) REFERENCES Players(player_name)
);

-- 选手参赛记录表
CREATE TABLE Players_in_competitions (
    player_name VARCHAR(50),
    competition_name VARCHAR(100),
    competition_edition INT,
    competition_group VARCHAR(50),
    player_team VARCHAR(100),
    player_win_count INT DEFAULT NULL,
    player_lose_count INT DEFAULT NULL,
    represent_school BOOLEAN DEFAULT NULL,
    is_foreign_player BOOLEAN DEFAULT NULL,
    PRIMARY KEY (player_name, competition_name, competition_edition, competition_group),
    FOREIGN KEY (player_name) REFERENCES Players(player_name),
    FOREIGN KEY (competition_name, competition_edition, competition_group) 
        REFERENCES Competitions(competition_name, competition_edition, competition_group)
);

-- 团体赛成绩表
CREATE TABLE Teams_results (
    competition_name VARCHAR(100),
    competition_edition INT,
    competition_group VARCHAR(50),
    team_name VARCHAR(100),
    team_rank INT DEFAULT NULL,
    has_team_prize BOOLEAN DEFAULT NULL,
    PRIMARY KEY (competition_name, competition_edition, competition_group, team_name),
    FOREIGN KEY (competition_name, competition_edition, competition_group, team_name) 
        REFERENCES Competitions_with_teams(competition_name, competition_edition, competition_group, team_name)
);

-- 个人最佳成绩表
CREATE TABLE Individuals_best_results (
    competition_name VARCHAR(100),
    competition_edition INT,
    competition_group VARCHAR(50),
    best_player_name VARCHAR(50),
    best_player_rank INT DEFAULT NULL,
    has_individual_prize BOOLEAN DEFAULT NULL,
    PRIMARY KEY (competition_name, competition_edition, competition_group, best_player_name),
    FOREIGN KEY (competition_name, competition_edition, competition_group, best_player_name) 
        REFERENCES Players_in_competitions(competition_name, competition_edition, competition_group, player_name)
);

-- 对局记录表
CREATE TABLE GameRecords (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    game_year INT DEFAULT NULL,
    game_month INT DEFAULT NULL,
    game_date DATE DEFAULT NULL,
    competition_name VARCHAR(100) DEFAULT NULL,
    competition_edition INT DEFAULT NULL,
    competition_group VARCHAR(50) DEFAULT NULL,
    game_round INT DEFAULT NULL,
    game_table VARCHAR(20) DEFAULT NULL,
    black_player VARCHAR(50) DEFAULT NULL,
    black_team VARCHAR(100) DEFAULT NULL,
    white_player VARCHAR(50) DEFAULT NULL,
    white_team VARCHAR(100) DEFAULT NULL,
    game_result VARCHAR(50) DEFAULT NULL,
    school_player_result VARCHAR(5) DEFAULT NULL,
    school_player_name VARCHAR(50) DEFAULT NULL,
    school_player_color VARCHAR(5) DEFAULT NULL,
    FOREIGN KEY (competition_name, competition_edition, competition_group, school_player_name) 
        REFERENCES Players_in_competitions(competition_name, competition_edition, competition_group, player_name)
);
Show tables;
#SELECT * FROM GameRecords;

-- 创建索引
CREATE INDEX idx_competition_year ON Competitions(competition_year);
CREATE INDEX idx_player_school ON Players(is_our_player);
CREATE INDEX idx_game_date ON GameRecords(game_date);
CREATE INDEX idx_competition_date ON Competitions(competition_start_date);

-- 创建视图：某个选手按年份的参赛统计
DROP VIEW school_player_statistics;
CREATE VIEW school_player_statistics AS
SELECT 
    c.competition_year as `year`,
    p.player_name,
    COUNT(DISTINCT pic.competition_name) as total_competitions,
    SUM(pic.player_win_count) as total_wins,
    SUM(pic.player_lose_count) as total_losses,
    ROUND(SUM(pic.player_win_count) * 100.0 / (SUM(pic.player_win_count) + SUM(pic.player_lose_count)), 2) as win_rate
FROM Players p
#JOIN Players_school ps ON p.player_name = ps.player_name # 除去外援的参赛记录
LEFT JOIN Players_in_competitions pic ON p.player_name = pic.player_name
NATURAL JOIN Competitions c 
WHERE p.player_id = 4
GROUP BY c.competition_year, p.player_name; 

-- 团体赛成绩统计
DROP VIEW team_results_statistics;
CREATE VIEW team_results_statistics AS
SELECT 
	c.competition_year as `year`,
    tr.team_name,
    COUNT(DISTINCT tr.competition_name) as total_competitions,
    SUM(CASE WHEN tr.has_team_prize = TRUE THEN 1 ELSE 0 END) as total_prizes
FROM Teams_results tr
NATURAL JOIN Competitions c 
GROUP BY c.competition_year, tr.team_name WITH ROLLUP;

-- 个人最佳成绩统计
DROP VIEW individual_best_results_statistics;
CREATE VIEW individual_best_results_statistics AS
SELECT 
	c.competition_year as `year`,
    ibr.best_player_name,
    COUNT(DISTINCT ibr.competition_name) as total_competitions,
    SUM(CASE WHEN ibr.has_individual_prize = TRUE THEN 1 ELSE 0 END) as total_prizes
FROM Individuals_best_results ibr
NATURAL JOIN Competitions c 
GROUP BY c.competition_year, ibr.best_player_name WITH ROLLUP;

-- 获取某个队员的对局记录
DROP VIEW individual_game_statistics;
CREATE VIEW individual_game_statistics AS
SELECT 
    g.game_date as `date`,
    g.school_player_name as `name`,
    (CASE WHEN g.school_player_color = '黑' THEN g.white_player ELSE g.black_player END) as opponent,
    g.school_player_result as `result`,
    g.competition_name as `competition`,
    g.competition_edition as `edition`,
    g.game_round as `round`
	FROM GameRecords as g
	WHERE school_player_name = 
		(SELECT player_name FROM Players 
			Where player_id = 2);

-- 获取某个队员的对手记录
DROP VIEW individual_opponent_statistics;
CREATE VIEW individual_opponent_statistics AS
SELECT 
    (CASE WHEN g.school_player_color = '黑' THEN g.white_player ELSE g.black_player END) as opponent,
    SUM(CASE WHEN g.school_player_result = '胜' THEN 1 ELSE 0 END) as total_win,
    SUM(CASE WHEN g.school_player_result = '负' THEN 1 ELSE 0 END) as total_lose,
    COUNT(*) as total_game
	FROM GameRecords as g
    INNER JOIN Players p ON p.player_name = g.school_player_name
    WHERE p.player_id = 2
    GROUP BY opponent WITH ROLLUP
    ORDER BY total_game DESC, total_win DESC;

-- 获取某个队员的个人团体奖项
DROP VIEW player_honor_statistics;
CREATE VIEW player_honor_statistics AS
SELECT * FROM(
(SELECT 
c.competition_year as `year`,
CONCAT('第', ibr.competition_edition, '届', ibr.competition_name,
'（', ibr.competition_group, '）') AS `competition`,
CONCAT((CASE WHEN ibr.competition_group IS NOT NULL THEN '个人' ELSE '团体' END),
'第', ibr.best_player_rank, '名') AS `honor`
FROM Individuals_best_results ibr
NATURAL JOIN Competitions c
WHERE ibr.has_individual_prize = 1 and
ibr.best_player_name = (SELECT p.player_name FROM Players p WHERE p.player_id = 2))
UNION
(SELECT 
c.competition_year as `year`,
CONCAT('第', tr.competition_edition, '届', tr.competition_name,
'（', tr.competition_group, '）') AS `competition`,
CONCAT((CASE WHEN tr.team_name IS NOT NULL THEN '团体' ELSE '个人' END),
'第', tr.team_rank, '名') AS `honor`
FROM Teams_results tr
NATURAL JOIN Competitions c
INNER JOIN Players_in_Competitions pc ON (pc.competition_name, pc.competition_edition, pc.competition_group, pc.player_team) = (tr.competition_name, tr.competition_edition, tr.competition_group, tr.team_name)
WHERE tr.has_team_prize = 1 and
pc.player_name = (SELECT p.player_name FROM Players p WHERE p.player_id = 2))
) AS res
ORDER BY res.`year` ASC, res.`competition` ASC;

-- 获取所有赛事信息
# CONCAT_WS(separator, expression1, expression2, expression3,...)
DROP VIEW competition_basic_info;
CREATE VIEW competition_basic_info AS
SELECT  
competition_name AS `competition`,
competition_first_year AS `first_year`,
competition_last_year AS `last_year`,
competition_level AS `level`,
CONCAT_WS("|", 
(CASE WHEN is_institution_competition = 1 THEN "高校" ELSE "--" END), 
(CASE WHEN is_open_competition = 1 THEN "公开赛" ELSE "邀请赛" END),
(CASE WHEN is_offline_competition = 1 THEN "线下" ELSE "线上" END),
(CASE WHEN is_team_competition = 1 THEN "团体赛" ELSE "个人赛" END),
(CASE WHEN has_team_result = 1 THEN "记团体成绩" ELSE "--" END)) AS `description`
FROM Competition_bases;

-- 获取某项赛事的具体信息
DROP VIEW competition_info;
CREATE VIEW competition_info AS
SELECT 
competition_year AS `year`,
CONCAT("第", competition_edition, "届 ", competition_name,
"（", competition_group, "）") AS `competition`,
competition_start_date AS `start_date`,
competition_end_date AS `end_date`,
competition_location AS `location`,
competition_total_round AS `total_round`,
competition_source AS `source`
FROM Competitions
WHERE competition_name = "深圳高校个人赛";

SELECT * FROM school_player_statistics;
SELECT * FROM team_results_statistics;
SELECT * FROM individual_best_results_statistics;
SELECT * FROM individual_game_statistics;
SELECT * FROM individual_opponent_statistics;
SELECT * FROM player_honor_statistics;
SELECT * FROM competition_basic_info;
SELECT * FROM competition_info;
