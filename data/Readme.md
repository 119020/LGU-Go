## competitions.json
- competition_bases{"1","2",...,"55"}
- competitions{"1","2",...,"130"}
- competition_records

## players.json
- players{"1","2",...,"56"}
- history
- opponent
- records
- awards

### 使用 JSON Formatter & Validator，以确保JSON能被读取正确
https://jsonformatter.curiousconcept.com/

### 本地通过terminal shell命令行调用server_db.js，生成带有json数据的api端口
#### 本地数据库连接参数保存在.env文件（注意文件就叫.env，没有文件名只有扩展格式！）
```shell
cd C:\Users\Lenovo\Desktop\LGU-Go-test
node server.js

# 127.0.0.1
# youruser
# yourpassword
# lgu_go
# 服务器运行在 http://localhost:3000
# 成功连接到 MySQL 数据库
```


