import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('#todo-list');
  if (!app) return;

  const state = {
    user: null,
    tasks: [],
    reminders: [],
    filteredPriority: 'all'
  };

  const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const loadState = () => {
    try {
      const savedUser = localStorage.getItem('todo-app-user');
      const savedTasks = localStorage.getItem('todo-app-tasks');
      const savedReminders = localStorage.getItem('todo-app-reminders');
      state.user = savedUser ? JSON.parse(savedUser) : null;
      state.tasks = savedTasks ? JSON.parse(savedTasks) : [];
      state.reminders = savedReminders ? JSON.parse(savedReminders) : [];
    } catch {
      state.user = null;
      state.tasks = [];
      state.reminders = [];
    }
  };

  const persistState = () => {
    localStorage.setItem('todo-app-user', JSON.stringify(state.user));
    localStorage.setItem('todo-app-tasks', JSON.stringify(state.tasks));
    localStorage.setItem('todo-app-reminders', JSON.stringify(state.reminders));
  };

  const authenticateUser = (username, password) => {
    const safeUsername = username.trim();
    if (!safeUsername || !password) {
      return { ok: false, message: 'Please enter both username and password.' };
    }

    state.user = { username: safeUsername };
    persistState();
    render();
    return { ok: true };
  };

  const logoutUser = () => {
    state.user = null;
    persistState();
    render();
  };

  const addTask = ({ title, description, dueDate, priority }) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return { ok: false, message: 'Task title is required.' };

    const task = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      title: trimmedTitle,
      description: description.trim(),
      dueDate,
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks.unshift(task);
    persistState();
    scheduleReminder(task);
    renderTasks();
    return { ok: true };
  };

  const removeTask = (taskId) => {
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    state.reminders = state.reminders.filter((reminder) => reminder.taskId !== taskId);
    persistState();
    renderTasks();
  };

  const toggleTaskStatus = (taskId) => {
    state.tasks = state.tasks.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    persistState();
    renderTasks();
  };

  const sortTasks = (tasks) => [...tasks].sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
    if (dueA !== dueB) return dueA - dueB;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const scheduleReminder = (task) => {
    if (!task.dueDate) return;
    const dueTime = new Date(task.dueDate).getTime();
    if (Number.isNaN(dueTime)) return;

    const reminderTime = dueTime - (60 * 60 * 1000);
    const delay = reminderTime - Date.now();

    if (delay <= 0) {
      state.reminders.push({ taskId: task.id, sent: true, message: `Reminder: ${task.title} is due soon.` });
      persistState();
      return;
    }

    const timerId = window.setTimeout(() => {
      if (!state.tasks.find((item) => item.id === task.id)) return;
      window.alert(`Reminder: "${task.title}" is due at ${new Date(task.dueDate).toLocaleString()}.`);
      state.reminders.push({ taskId: task.id, sent: true, message: `Reminder sent for ${task.title}` });
      persistState();
    }, delay);

    state.reminders.push({ taskId: task.id, timerId, sent: false, message: `Reminder scheduled for ${task.title}` });
    persistState();
  };

  const checkDueDateReminders = () => {
    const now = Date.now();
    state.tasks.forEach((task) => {
      if (!task.dueDate || task.completed) return;
      const dueTime = new Date(task.dueDate).getTime();
      if (Number.isNaN(dueTime)) return;
      const diff = dueTime - now;
      if (diff <= 0 && !state.reminders.some((reminder) => reminder.taskId === task.id && reminder.sent)) {
        window.alert(`Task due now: "${task.title}".`);
        state.reminders.push({ taskId: task.id, sent: true, message: `Task due: ${task.title}` });
      }
    });
    persistState();
  };

  const filteredTasks = () => {
    const tasks = state.filteredPriority === 'all'
      ? state.tasks
      : state.tasks.filter((task) => task.priority === state.filteredPriority);
    return sortTasks(tasks);
  };

  const renderAuth = () => `
    <section class="todo-card auth-card">
      <h2>${state.user ? 'Welcome back' : 'Sign in'}</h2>
      ${state.user ? `
        <p>Signed in as <strong>${escapeHtml(state.user.username)}</strong>.</p>
        <button class="btn btn-secondary" type="button" id="logout-button">Logout</button>
      ` : `
        <form id="login-form" class="todo-form" autocomplete="on">
          <label>
            Username
            <input type="text" name="username" required placeholder="Enter username">
          </label>
          <label>
            Password
            <input type="password" name="password" required placeholder="Enter password">
          </label>
          <button class="btn btn-primary" type="submit">Login</button>
          <p class="helper-text">Demo authentication stores the current user locally.</p>
        </form>
      `}
    </section>
  `;

  const renderForm = () => `
    <section class="todo-card">
      <h2>Add a task</h2>
      <form id="task-form" class="todo-form">
        <div class="form-grid">
          <label>
            Task title
            <input type="text" name="title" required placeholder="What needs to be done?">
          </label>
          <label>
            Priority
            <select name="priority">
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            Due date
            <input type="datetime-local" name="dueDate">
          </label>
          <label class="full-width">
            Description
            <textarea name="description" rows="3" placeholder="Optional details..."></textarea>
          </label>
        </div>
        <button class="btn btn-primary" type="submit">Add Task</button>
      </form>
    </section>
  `;

  const renderFilters = () => `
    <section class="todo-card">
      <div class="toolbar">
        <h2>Tasks</h2>
        <select id="priority-filter" aria-label="Filter tasks by priority">
          <option value="all" ${state.filteredPriority === 'all' ? 'selected' : ''}>All priorities</option>
          <option value="high" ${state.filteredPriority === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${state.filteredPriority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low" ${state.filteredPriority === 'low' ? 'selected' : ''}>Low</option>
        </select>
      </div>
    </section>
  `;

  const renderTasks = () => {
    const list = app.querySelector('#tasks-list');
    if (!list) return;

    const tasks = filteredTasks();
    if (!tasks.length) {
      list.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started.</p>';
      return;
    }

    list.innerHTML = tasks.map((task) => `
      <article class="task-item ${task.completed ? 'completed' : ''}">
        <div class="task-main">
          <div class="task शीर्षलेख"></div>
          <div class="task-header">
            <h3>${escapeHtml(task.title)}</h3>
            <span class="priority priority-${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</span>
          </div>
          ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
          <div class="task-meta">
            <span>${task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleString()}` : 'No due date'}</span>
            <span>${task.completed ? 'Completed' : 'Active'}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-secondary" type="button" data-action="toggle" data-id="${task.id}">${task.completed ? 'Undo' : 'Complete'}</button>
          <button class="btn btn-danger" type="button" data-action="remove" data-id="${task.id}">Remove</button>
        </div>
      </article>
    `).join('');
  };

  const render = () => {
    app.innerHTML = `
      <div class="app-shell">
        ${renderAuth()}
        ${state.user ? renderForm() : ''}
        ${state.user ? renderFilters() : ''}
        <section class="todo-card">
          <div id="tasks-list" class="tasks-list"></div>
        </section>
      </div>
    `;
    renderTasks();
    bindEvents();
  };

  const bindEvents = () => {
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const result = authenticateUser(formData.get('username'), formData.get('password'));
        if (!result.ok) window.alert(result.message);
      });
    }

    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) logoutButton.addEventListener('click', logoutUser);

    const taskForm = document.querySelector('#task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(taskForm);
        const result = addTask({
          title: formData.get('title'),
          description: formData.get('description') || '',
          dueDate: formData.get('dueDate') || '',
          priority: formData.get('priority') || 'medium'
        });
        if (!result.ok) window.alert(result.message);
        else taskForm.reset();
      });
    }

    const filter = document.querySelector('#priority-filter');
    if (filter) {
      filter.addEventListener('change', (event) => {
        state.filteredPriority = event.target.value;
        renderTasks();
      });
    }

    const tasksList = document.querySelector('#tasks-list');
    if (tasksList) {
      tasksList.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const { action, id } = button.dataset;
        if (action === 'remove') removeTask(id);
        if (action === 'toggle') toggleTaskStatus(id);
      });
    }
  };

  loadState();
  render();
  checkDueDateReminders();
  window.setInterval(checkDueDateReminders, 60 * 1000);
});
