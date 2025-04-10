const express = require('express');
const sqlite3 = require('sqlite3').verbose();
// const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "key";
// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 数据库连接
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the tasks database.');
});

// 初始化数据库表
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS
        users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
        `);
    db.run(`CREATE TABLE IF NOT EXISTS user_tasks (
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(task_id) REFERENCES tasks(id),
        PRIMARY KEY(user_id,task_id)
    )`);
});

// API路由

app.post("/api/register",async (req, res)=>{
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({error:"用户名和密码不能为空"});
    }

    
    const hashedPassword = await bcrypt.hash(password,10);
    db.run("INSERT INTO users (username, password) VALUES (?,?)",[username, hashedPassword],err =>{
        if (err){
            return res.status(500).json({error:err.message});
        }
        res.json({success:true});
    });
})

app.post("/api/login", (req,res)=>{
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    db.get("SELECT * FROM users WHERE username = ?",[username],async (err, user)=>{
        if (err){
            return res.status(500).json({ error: err.message });
        }
        if (!user){
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        try {
            const isMatch = await bcrypt.compare(password,user.password);
            if (!isMatch) return res.status(401).json({ error: '用户名或密码错误' });
            const token = jwt.sign({id:user.id,username:user.username},JWT_SECRET, {expiresIn:"1h"});
            console.log(token);
            // const decoded = jwt.decode(token);
            // console.log("token decoded: ",decoded);
            res.json({token,username:user.username});
        }
        catch(error){
            res.status(500).json({ error: error.message });
        }
    });
});
function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    // console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        console.log("token empty");
        return res.sendStatus(401);
    }
    // console.log(token);
    jwt.verify(token, JWT_SECRET,(err, user)=>{
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.use("/api/tasks",authenticateToken);

// 获取所有任务
app.get('/api/tasks', (req, res) => {
    db.all(`
        SELECT t.* FROM tasks t
        JOIN user_tasks ut ON t.id = ut.task_id
        WHERE ut.user_id = ?
        ORDER BY t.createdAt DESC
        `,[req.user.id],(err, rows)=>{
            if (err){
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
});

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

// 创建新任务
app.post('/api/tasks', (req, res) => {
    const { title, description, dueDate } = req.body;
    
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    
    db.run(
        'INSERT INTO tasks (title, description, dueDate) VALUES (?, ?, ?)',
        [title, description, dueDate],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            db.run(`
                INSERT INTO user_tasks (user_id, task_id) VALUES (?,?)
                `, [req.user.id, this.lastID],(err)=>{
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({
                        id: this.lastID,
                        title,
                        description,
                        dueDate
                    });
                });
        }
    );
});

// 更新任务
app.put('/api/tasks/:id', (req, res) => {
    const { title, description, dueDate } = req.body;
    const { id } = req.params;
    
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    
    db.run(
        'UPDATE tasks SET title = ?, description = ?, dueDate = ? WHERE id = ?',
        [title, description, dueDate, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id,
                title,
                description,
                dueDate
            });
        }
    );
});

// 删除任务
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(
        'DELETE FROM tasks WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});