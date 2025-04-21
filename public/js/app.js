// document代表整个网页，html文件
document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksContainer = document.getElementById('tasksContainer');
    const loginCard = document.getElementById("login-card");
    const appContainer = document.getElementById("app-container");
    const loginBtn = document.getElementById("login-btn");
    const registerLink = document.getElementById("register-link");
    const logoutBtn = document.getElementById("logoutBtn");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const registerCard = document.getElementById("register-card");
    const registerBtn = document.getElementById("register-btn");
    const forgotpasswordCard = document.getElementById("forgot-password-card");
    const ensureBtn = document.getElementById("ensure-btn");

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

    ensureBtn.addEventListener("click",function(){
        const username = document.getElementById("oldUsername").value;
        const password = document.getElementById("newPassword").value;

        if (!username||!password){
            alert("请输入用户名和密码");
            return;
        }

        fetch("/api/findpassword",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({username,password})
        })
        .then(res=>res.json())
        .then(data=>{
            if (data.success){
                alert("密码已设置成功，请登录");
                document.getElementById("oldUsername").value = "";
                document.getElementById("newPassword").value = "";
                showAuth();
            }
            else{
                // alert("密码找回失败");
                err_message = data.error;
                alert(err_message);
            }
        })
    });

    forgotPasswordLink.addEventListener("click",function(){
        showForgotPasswordCard();
    });

    registerLink.addEventListener("click",function(){
        // alert("register");
        showRegister();
    });


    registerBtn.addEventListener("click", function(){
        // showRegister();
        // console.log("starting register");
        event.preventDefault();
        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;

        if (!username||!password) {
            alert("请输入用户名和密码");
            return;
        }
        // console.log("starting registering");
        
        fetch("/api/register",{
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({username, password})
        })
        .then(res=> res.json())
        .then(data=>{
            // console.log("check if register success");
            // alert("register");
            // console.log(data.success);
            if (data.success) {
                console.log("register success");
                alert("注册成功，请登录");
                document.getElementById("registerUsername").value = "";
                document.getElementById("registerPassword").value = "";
                showAuth();
            }else{
                alert("注册失败");
            }
        })
        .catch(err=>{
            console.error("Error: ",err);
            alert("注册失败");
        });

    });

    loginBtn.addEventListener("click",function(){
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

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
                // loadTasks();
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

    function showForgotPasswordCard(){
        document.getElementById("oldUsername").value = "";
        document.getElementById("newPassword").value = "";
        forgotpasswordCard.style.display = "block";
        registerCard.style.display = "none";
        loginCard.style.display = "none";
        appContainer.style.display = "none";
    }

    function showRegister(){
        document.getElementById("registerUsername").value = "";
        document.getElementById("registerPassword").value = "";
        registerCard.style.display = "block";
        loginCard.style.display = "none";
        appContainer.style.display = "none";
        forgotpasswordCard.style.display = "none";
    }
    function showAuth(){
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        loginCard.style.display = "block";
        appContainer.style.display = "none";
        registerCard.style.display = "none";
        forgotpasswordCard.style.display = "none";
    }
    function showApp(){
        loginCard.style.display = "none";
        appContainer.style.display = "block";
        registerCard.style.display = "none";
        forgotpasswordCard.style.display = "none";
        usernameDisplay.textContent = currentUser.username;
        loadTasks();
    }
    // 加载所有任务
    // loadTasks();
    
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
                任务标题<input type="text" class="edit-title" value="${task.title}" placeholder = "任务标题">
                任务描述<textarea class="edit-description" placeholder = "任务描述">${task.description}</textarea>
                截止日期<input type="date" class="edit-due-date" value="${task.dueDate || ''}" placeholder = "截止日期">
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
