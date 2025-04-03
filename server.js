// const express = require('express');
// const sqlite3 = require('sqlite3').verbose();
// const bodyParser = require('body-parser');
// const path = require('path');

// const app = express();
// const port = 3000;

// // 中间件
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // 数据库连接
// const db = new sqlite3.Database('./tasks.db', (err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Connected to the tasks database.');
// });

// // 初始化数据库表
// db.serialize(() => {
//     db.run(`CREATE TABLE IF NOT EXISTS tasks (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         title TEXT NOT NULL,
//         description TEXT,
//         dueDate TEXT,
//         createdAt TEXT DEFAULT (datetime('now', 'localtime'))
//     )`);
// });

// // API路由
// // 获取所有任务
// app.get('/api/tasks', (req, res) => {
//     db.all('SELECT * FROM tasks ORDER BY createdAt DESC', [], (err, rows) => {
//         if (err) {
//             res.status(500).json({ error: err.message });
//             return;
//         }
//         res.json(rows);
//     });
// });

// // 创建新任务
// app.post('/api/tasks', (req, res) => {
//     const { title, description, dueDate } = req.body;
    
//     if (!title) {
//         res.status(400).json({ error: 'Title is required' });
//         return;
//     }
    
//     db.run(
//         'INSERT INTO tasks (title, description, dueDate) VALUES (?, ?, ?)',
//         [title, description, dueDate],
//         function(err) {
//             if (err) {
//                 res.status(500).json({ error: err.message });
//                 return;
//             }
//             res.json({
//                 id: this.lastID,
//                 title,
//                 description,
//                 dueDate
//             });
//         }
//     );
// });

// // 更新任务
// app.put('/api/tasks/:id', (req, res) => {
//     const { title, description, dueDate } = req.body;
//     const { id } = req.params;
    
//     if (!title) {
//         res.status(400).json({ error: 'Title is required' });
//         return;
//     }
    
//     db.run(
//         'UPDATE tasks SET title = ?, description = ?, dueDate = ? WHERE id = ?',
//         [title, description, dueDate, id],
//         function(err) {
//             if (err) {
//                 res.status(500).json({ error: err.message });
//                 return;
//             }
//             res.json({
//                 id,
//                 title,
//                 description,
//                 dueDate
//             });
//         }
//     );
// });

// // 删除任务
// app.delete('/api/tasks/:id', (req, res) => {
//     const { id } = req.params;
    
//     db.run(
//         'DELETE FROM tasks WHERE id = ?',
//         [id],
//         function(err) {
//             if (err) {
//                 res.status(500).json({ error: err.message });
//                 return;
//             }
//             res.json({ success: true });
//         }
//     );
// });

// // 启动服务器
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });
const express = require("express"); //导入express库
const sqlite3 = require("sqlite3").verbose();
// const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
// app.use(express.json())

app.use(express.static(path.join(__dirname, "public")));
const db = new sqlite3.Database(
    "./tasks.db",
    (err)=>{
        if (err) {
            console.error(err.message)
        }
        else{
            console.log("connected to db")
        }
    }
);

db.serialize(
    db.run(
        "
        
        "
    )
);

app.listen(port,() => {
    console.log("server running on port 3000")
});