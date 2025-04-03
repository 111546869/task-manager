document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const tasksContainer = document.getElementById('tasksContainer');
    
    // 加载所有任务
    loadTasks();
    
    // 添加任务事件
    addTaskBtn.addEventListener('click', addTask);
    
    // 加载任务函数
    function loadTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                tasksContainer.innerHTML = '';
                tasks.forEach(task => {
                    addTaskToDOM(task);
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
            <div class="edit-form">
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
        
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        fetch(`/api/tasks/${id}`, {
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
            fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            })
            .then(() => {
                loadTasks(); // 重新加载所有任务
            });
        }
    }
});
