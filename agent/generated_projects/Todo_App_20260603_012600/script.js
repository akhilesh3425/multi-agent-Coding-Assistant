document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  let todoItems = [];
  let taskData = {
    nextId: 1,
  };

  let users = [];
  let currentUserId = null;
  let authData = {
    nextId: 1,
  };

  const priorityClassMap = {
    low: 'todo-item--priority-low',
    normal: 'todo-item--priority-normal',
    high: 'todo-item--priority-high',
    urgent: 'todo-item--priority-urgent',
  };

  const priorityBadgeMap = {
    low: 'badge badge--low',
    normal: 'badge badge--normal',
    high: 'badge badge--high',
    urgent: 'badge badge--urgent',
  };

  function normalizePriority(priority) {
    const nextPriority = typeof priority === 'string' ? priority.trim().toLowerCase() : 'normal';
    return Object.prototype.hasOwnProperty.call(priorityClassMap, nextPriority) ? nextPriority : 'normal';
  }

  function getCurrentUser() {
    return users.find((user) => user.id === currentUserId) || null;
  }

  function isAuthenticated() {
    return getCurrentUser() !== null;
  }

  function registerUser(username, password) {
    const nextUsername = typeof username === 'string' ? username.trim() : '';
    const nextPassword = typeof password === 'string' ? password : '';

    if (!nextUsername || !nextPassword) {
      return null;
    }

    const existingUser = users.find((user) => user.username.toLowerCase() === nextUsername.toLowerCase());
    if (existingUser) {
      return null;
    }

    const user = {
      id: authData.nextId++,
      username: nextUsername,
      password: nextPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    currentUserId = user.id;
    return { ...user };
  }

  function loginUser(username, password) {
    const nextUsername = typeof username === 'string' ? username.trim() : '';
    const nextPassword = typeof password === 'string' ? password : '';

    if (!nextUsername || !nextPassword) {
      return null;
    }

    const user = users.find((item) => item.username.toLowerCase() === nextUsername.toLowerCase() && item.password === nextPassword);
    if (!user) {
      return null;
    }

    currentUserId = user.id;
    return { ...user };
  }

  function logoutUser() {
    currentUserId = null;
    return true;
  }

  function requireAuthentication() {
    return isAuthenticated();
  }

  function createTask(text, dueDate = '', priority = 'normal') {
    if (!requireAuthentication()) {
      return null;
    }

    const nextPriority = normalizePriority(priority);
    const task = {
      id: taskData.nextId++,
      text: text.trim(),
      dueDate,
      priority: nextPriority,
      completed: false,
    };

    if (!task.text) {
      return null;
    }

    todoItems.push(task);
    renderTodoList();
    return task;
  }

  function editTask(id, updates = {}) {
    if (!requireAuthentication()) {
      return null;
    }

    const task = todoItems.find((item) => item.id === id);

    if (!task) {
      return null;
    }

    if (typeof updates.text === 'string') {
      const nextText = updates.text.trim();
      if (nextText) {
        task.text = nextText;
      }
    }

    if (typeof updates.dueDate === 'string') {
      task.dueDate = updates.dueDate;
    }

    if (typeof updates.priority === 'string') {
      task.priority = normalizePriority(updates.priority);
    }

    if (typeof updates.completed === 'boolean') {
      task.completed = updates.completed;
    }

    renderTodoList();
    return task;
  }

  function deleteTask(id) {
    if (!requireAuthentication()) {
      return false;
    }

    const initialLength = todoItems.length;
    todoItems = todoItems.filter((item) => item.id !== id);

    if (todoItems.length !== initialLength) {
      renderTodoList();
      return true;
    }

    return false;
  }

  function setTaskDueDate(id, dueDate) {
    if (!requireAuthentication()) {
      return null;
    }

    return editTask(id, { dueDate });
  }

  function setTaskPriority(id, priority) {
    if (!requireAuthentication()) {
      return null;
    }

    return editTask(id, { priority });
  }

  function toggleTaskCompletion(id) {
    if (!requireAuthentication()) {
      return null;
    }

    const task = todoItems.find((item) => item.id === id);
    if (!task) {
      return null;
    }

    task.completed = !task.completed;
    renderTodoList();
    return task;
  }

  function createBadge(text, className) {
    const badge = document.createElement('span');
    badge.className = className;
    badge.textContent = text;
    return badge;
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `todo-item ${priorityClassMap[normalizePriority(task.priority)]}${task.completed ? ' todo-item--completed' : ''}`.trim();
    li.dataset.id = String(task.id);

    const textWrapper = document.createElement('div');
    textWrapper.className = 'todo-item__text';

    const title = document.createElement('div');
    title.textContent = task.text;
    textWrapper.appendChild(title);

    const meta = document.createElement('small');
    const parts = [];
    parts.push(`Priority: ${normalizePriority(task.priority)}`);
    if (task.dueDate) {
      parts.push(`Due: ${task.dueDate}`);
    }
    meta.textContent = parts.join(' • ');
    textWrapper.appendChild(meta);

    if (task.dueDate) {
      textWrapper.appendChild(createBadge(`Due ${task.dueDate}`, 'badge badge--due'));
    }

    const actions = document.createElement('div');
    actions.className = 'todo-item__actions';

    const completeButton = document.createElement('button');
    completeButton.type = 'button';
    completeButton.className = 'todo-item__button todo-item__button--complete';
    completeButton.textContent = task.completed ? 'Undo' : 'Complete';
    completeButton.addEventListener('click', () => toggleTaskCompletion(task.id));

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'todo-item__button todo-item__button--edit';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      const nextText = window.prompt('Edit task', task.text);
      if (nextText !== null) {
        editTask(task.id, { text: nextText });
      }
    });

    const dueDateButton = document.createElement('button');
    dueDateButton.type = 'button';
    dueDateButton.className = 'todo-item__button todo-item__button--date';
    dueDateButton.textContent = 'Due Date';
    dueDateButton.addEventListener('click', () => {
      const nextDueDate = window.prompt('Set due date (YYYY-MM-DD)', task.dueDate || '');
      if (nextDueDate !== null) {
        setTaskDueDate(task.id, nextDueDate);
      }
    });

    const priorityButton = document.createElement('button');
    priorityButton.type = 'button';
    priorityButton.className = 'todo-item__button todo-item__button--priority';
    priorityButton.textContent = 'Priority';
    priorityButton.addEventListener('click', () => {
      const nextPriority = window.prompt('Set priority (low, normal, high, urgent)', task.priority);
      if (nextPriority !== null) {
        setTaskPriority(task.id, nextPriority);
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'todo-item__button todo-item__button--delete';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    actions.append(completeButton, editButton, dueDateButton, priorityButton, deleteButton);
    li.append(textWrapper, actions);
    return li;
  }

  function renderTodoList() {
    todoList.innerHTML = '';

    if (!requireAuthentication()) {
      const authItem = document.createElement('li');
      authItem.className = 'todo-item color-gray';
      authItem.textContent = 'Please log in to manage your tasks.';
      todoList.appendChild(authItem);
      return;
    }

    if (todoItems.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'todo-item color-blue';
      emptyItem.textContent = 'No tasks yet. Add one above.';
      todoList.appendChild(emptyItem);
      return;
    }

    todoItems.forEach((task) => {
      todoList.appendChild(createTaskElement(task));
    });
  }

  todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = todoInput.value;
    const task = createTask(value);

    if (task) {
      todoInput.value = '';
      todoInput.focus();
    }
  });

  renderTodoList();

  window.todoApp = {
    registerUser,
    loginUser,
    logoutUser,
    isAuthenticated,
    getCurrentUser,
    createTask,
    editTask,
    deleteTask,
    setTaskDueDate,
    setTaskPriority,
    toggleTaskCompletion,
    getTodoItems: () => todoItems.slice(),
    getUsers: () => users.map((user) => ({ id: user.id, username: user.username, createdAt: user.createdAt })),
  };
});