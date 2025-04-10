// document代表整个网页，html文件
document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksContainer = document.getElementById('tasksContainer');
    const authContainer = document.getElementById("auth-container");
    const appContainer = document.getElementById("app-container");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const usernameDisplay = document.getElementById("usernameDisplay");
    
    let currentUser = null;
    let token = localStorage.getItem("token");
    // console.log("current token:",token);
    if (token) {
        // console.log("token:",token);
        fetchWithAuth("/api/tasks",{
            headers:{
                "Authorization":`Bearer ${token}`
            }
        })
        .then(res=>{
            if (res.ok) {
                const user = JSON.parse(atob(token.split(".")[1])); //用户解码
                currentUser = user;
                showApp();
            }else{
                localStorage.removeItem("token");
                showAuth();
            }
        });
    }else{
        showAuth();
    }
    registerBtn.addEventListener("click", function(){
        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;

        if (!username||!password) {
            alert("请输入用户名和密码");
            return;
        }

        fetch("/api/register",{
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({username, password})
        })
        .then(res=> res.json())
        .then(data=>{
            if (data.success) {
                alert("注册成功，请登录");
                document.getElementById("registerUsername").value = "";
                document.getElementById("registerPassword").value = "";

            }else{
                alert(data.error || "登陆失败");
            }
        })
        .catch(err=>{
            console.error("Error: ",err);
            alert("注册失败");
        });
    });

    loginBtn.addEventListener("click",function(){
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        if (!username || !password) {
            alert("请输入用户名和密码");
            return;
        }
        fetch("/api/login",{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username,password})
        })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                // console.log("data.token=",data.token);
                localStorage.setItem("token",data.token);
                token = data.token;
                currentUser = {username: data.username};
                showApp();
                // alert("登录成功");
            }else{
                alert(data.error || "登陆失败");
            }
        })
        .catch(err => {
            console.error("Error: ",err);
            alert("登陆失败");
        });

    });

    logoutBtn.addEventListener("click", function(){
        localStorage.removeItem("token");
        currentUser = null;
        showAuth();
    });

    function showAuth(){
        authContainer.style.display = "block";
        appContainer.style.display = "none";
    }
    function showApp(){
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        usernameDisplay.textContent = currentUser.username;
        loadTasks();
    }
    // 加载所有任务
    loadTasks();
    
    // 添加任务事件
    addTaskBtn.addEventListener('click', addTask);
    // console.log("loadtasks");

    function fetchWithAuth(url, options = {}) {
        options.headers = options.headers || {};
        // console.log("fetchWithAuth: token:",token);
        options.headers["Authorization"] = `Bearer ${token}`;
        // console.log("options.headers\[\"authorization\"\] =", options.headers["Authorization"]);
        return fetch(url, options);
    }

    // 加载任务函数
    function loadTasks() {
        fetchWithAuth('/api/tasks')  
        // .then(console.log(response))
        .then(response => {
            // console.log("print response: ",response);
            // console.log(response.json());
            return response.json();
        })
        .then(tasks => {
            // console.log(tasks);
            tasksContainer.innerHTML = '';
            // tasksContainer.style.display = "none";
            tasks.forEach(task => {
                addTaskToDOM(task);
                // console.log(task);
            });
        });
    }
    
    // 添加任务到DOM
    function addTaskToDOM(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.dataset.id = task.id;
        
        taskElement.innerHTML = `
            <div class="task-actions">
                <button class="edit-btn">编辑</button>
                <button class="delete-btn">删除</button>
            </div>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p class="due-date">截止日期: ${task.dueDate || '无'}</p>
            <div class="edit-form" style="display: none">
                <input type="text" class="edit-title" value="${task.title}">
                <textarea class="edit-description">${task.description}</textarea>
                <input type="date" class="edit-due-date" value="${task.dueDate || ''}">
                <button class="save-btn">保存</button>
                <button class="cancel-btn">取消</button>
            </div>
        `;
        
        tasksContainer.appendChild(taskElement);
        
        // 添加编辑和删除事件
        taskElement.querySelector('.edit-btn').addEventListener('click', () => {
            taskElement.querySelector('.edit-form').style.display = 'block';
        });
        
        taskElement.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id);
        });
        
        taskElement.querySelector('.cancel-btn').addEventListener('click', () => {
            taskElement.querySelector('.edit-form').style.display = 'none';
        });
        
        taskElement.querySelector('.save-btn').addEventListener('click', () => {
            const updatedTask = {
                title: taskElement.querySelector('.edit-title').value,
                description: taskElement.querySelector('.edit-description').value,
                dueDate: taskElement.querySelector('.edit-due-date').value
            };
            
            updateTask(task.id, updatedTask);
        });
    }
    
    // 添加新任务
    function addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!title) {
            alert('请输入任务标题');
            return;
        }
        
        const newTask = {
            title,
            description,
            dueDate
        };
        
        fetchWithAuth('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newTask)
        })
        .then(response => response.json())
        .then(task => {
            addTaskToDOM(task);
            // 清空表单
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskDueDate').value = '';
        });
    }
    
    // 更新任务
    function updateTask(id, updatedTask) {
        fetchWithAuth(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask)
        })
        .then(response => response.json())
        .then(() => {
            loadTasks(); // 重新加载所有任务
        });
    }
    
    // 删除任务
    function deleteTask(id) {
        if (confirm('确定要删除这个任务吗?')) {
            fetchWithAuth(`/api/tasks/${id}`, {
                method: 'DELETE'
            })
            .then(() => {
                // loadTasks(); // 重新加载所有任务
                const taskElement = document.querySelector(`[data-id="${id}"]`);
                if (taskElement) {
                    taskElement.remove();
                    // str = `delete task ${id}`
                    // console.log(str);
                }
            });
        }
    }
});
