// Variables to store tasks and user authentication status
let tasks = [];
let isAuthenticated = false;

// Function to authenticate user
function authenticateUser(username, password) {
    // Simple authentication logic
    if (username === 'user' && password === 'password') {
        isAuthenticated = true;
        alert('User authenticated!');
    } else {
        alert('Authentication failed!');
    }
}

// Function to add a new task
function addTask(taskName, dueDate) {
    if (!isAuthenticated) {
        alert('Please authenticate first.');
        return;
    }
    const newTask = {
        id: Date.now(),
        name: taskName,
        dueDate: dueDate,
        completed: false
    };
    tasks.push(newTask);
    renderTasks();
}

// Function to remove a task
function removeTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
}

// Function to update a task
function updateTask(taskId, updatedName, updatedDueDate) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.name = updatedName;
        task.dueDate = updatedDueDate;
        renderTasks();
    }
}

// Function to render tasks
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `<span>${task.name} (Due: ${task.dueDate})</span>\n            <button onclick='removeTask(${task.id})'>Remove</button> \n            <button onclick='updateTask(${task.id}, prompt("New task name:"), prompt("New due date:"))'>Update</button>`;
        taskList.appendChild(taskItem);
    });
}

// Drag and drop functionality for tasks
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const draggedElement = document.getElementById(data);
    event.target.appendChild(draggedElement);
}