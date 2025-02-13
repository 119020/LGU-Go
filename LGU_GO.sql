Drop database lgu_go;
-- 创建数据库
CREATE DATABASE IF NOT EXISTS lgu_go;
USE lgu_go;

-- 比赛基础信息表
CREATE TABLE Competition_bases (
    competition_base_id INT,
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

-- 创建视图：校队选手参赛统计
CREATE VIEW school_player_statistics AS
SELECT 
    p.player_name,
    COUNT(DISTINCT pic.competition_name) as total_competitions,
    SUM(pic.player_win_count) as total_wins,
    SUM(pic.player_lose_count) as total_losses,
    ROUND(SUM(pic.player_win_count) * 100.0 / (SUM(pic.player_win_count) + SUM(pic.player_lose_count)), 2) as win_rate
FROM Players p
JOIN Players_school ps ON p.player_name = ps.player_name
LEFT JOIN Players_in_competitions pic ON p.player_name = pic.player_name
GROUP BY p.player_name; 

-- 团体赛成绩统计
#DROP VIEW team_results_statistics;
CREATE VIEW team_results_statistics AS
SELECT 
    tr.team_name,
    COUNT(DISTINCT tr.competition_name) as total_competitions,
    SUM(CASE WHEN tr.has_team_prize = TRUE THEN 1 ELSE 0 END) as total_prizes
FROM Teams_results tr
GROUP BY tr.team_name;

-- 个人最佳成绩统计
#DROP VIEW individual_best_results_statistics;
CREATE VIEW individual_best_results_statistics AS
SELECT 
    ibr.best_player_name,
    COUNT(DISTINCT ibr.competition_name) as total_competitions,
    SUM(CASE WHEN ibr.has_individual_prize = TRUE THEN 1 ELSE 0 END) as total_prizes
FROM Individuals_best_results ibr
GROUP BY ibr.best_player_name;

SELECT * FROM school_player_statistics;
SELECT * FROM team_results_statistics;
SELECT * FROM individual_best_results_statistics;









