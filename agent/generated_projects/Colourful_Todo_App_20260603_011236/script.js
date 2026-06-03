document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');
    const todoForm = document.getElementById('todoForm');
    const todoList = document.getElementById('todoList');
    const notificationArea = document.getElementById('notificationArea');

    // User Authentication
    const authenticateUser = async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulate API request
        const response = await fakeApiAuthenticate(username, password);
        if (response.success) {
            showNotification('Authentication successful!');
            loadTodoList();
        } else {
            showNotification('Authentication failed.');
        }
    };

    authForm.addEventListener('submit', authenticateUser);

    // Todo List Management
    const createTodoItem = async (event) => {
        event.preventDefault();
        const todoText = document.getElementById('todoText').value;
        const priority = document.getElementById('priority').value;
        const dueDate = document.getElementById('dueDate').value;

        // Simulate API request
        await fakeApiCreateTodo({ text: todoText, priority, dueDate });
        showNotification('Todo item created!');
        loadTodoList();
    };

    todoForm.addEventListener('submit', createTodoItem);

    const loadTodoList = async () => {
        // Simulate API request
        const todos = await fakeApiGetTodos();
        renderTodoList(todos);
    };

    const renderTodoList = (todos) => {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.textContent = `${todo.text} (Priority: ${todo.priority}, Due: ${todo.dueDate})`;
            todoList.appendChild(todoItem);
        });
    };

    const showNotification = (message) => {
        notificationArea.textContent = message;
        setTimeout(() => {
            notificationArea.textContent = '';
        }, 3000);
    };

    // Simulated API Calls
    const fakeApiAuthenticate = async (username, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: username === 'user' && password === 'pass' });
            }, 1000);
        });
    };

    const fakeApiCreateTodo = async (todo) => {
        return new Promise(resolve => setTimeout(resolve, 500));
    };

    const fakeApiGetTodos = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { text: 'Sample Todo 1', priority: 'High', dueDate: '2023-10-01' },
                    { text: 'Sample Todo 2', priority: 'Medium', dueDate: '2023-10-02' }
                ]);
            }, 1000);
        });
    };
});