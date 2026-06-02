// script.js

// ... existing code ...

let WEATHER_DATA = {};

// Function to get user location
function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
      resolve(position.coords);
    }, error => {
      reject(error);
    });
  });
}

// Function to fetch weather data from OpenWeatherMap API
function fetchWeatherData(lat, lon) {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      WEATHER_DATA = data;
      return data;
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

// Function to fetch forecast data from OpenWeatherMap API
function fetchForecastData(lat, lon) {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => console.error('Error fetching forecast data:', error));
}

// ForecastComponent class
class ForecastComponent {
  render(forecastData) {
    const forecastSection = document.getElementById('forecast');
    forecastSection.innerHTML = '';
    forecastData.list.slice(0, 5).forEach((forecast, index) => {
      const forecastCard = document.createElement('div');
      forecastCard.innerHTML = `
        <h2>Day ${index + 1}</h2>
        <p>Temperature: ${forecast.main.temp}°C</p>
        <p>Feels like: ${forecast.main.feels_like}°C</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      `;
      forecastSection.appendChild(forecastCard);
    });
  }
}

// Task class to model task data
class Task {
  /**
   * Creates a new Task instance.
   * @param {string} title - The title of the task.
   * @param {string} [description=''] - Optional description.
   * @param {string} [priority='Normal'] - Priority level (e.g., Low, Normal, High).
   * @param {string|Date|null} [dueDate=null] - Optional due date.
   */
  constructor(title, description = '', priority = 'Normal', dueDate = null) {
    this.id = Date.now() + Math.random(); // simple unique identifier
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.completed = false;
  }
}

// Global task list
let tasks = [];

/**
 * Create a new task from form inputs, validate, add to tasks array and re‑render.
 */
function createTask(event) {
  if (event) event.preventDefault();
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-description');
  const priorityInput = document.getElementById('task-priority');
  const dueDateInput = document.getElementById('task-due-date');

  const title = titleInput ? titleInput.value.trim() : '';
  if (!title) {
    alert('Task title is required.');
    return;
  }
  const description = descInput ? descInput.value.trim() : '';
  const priority = priorityInput ? priorityInput.value : 'Normal';
  const dueDate = dueDateInput ? dueDateInput.value : null;

  const newTask = new Task(title, description, priority, dueDate);
  tasks.push(newTask);
  renderTasks();

  // Reset form fields if they exist
  if (titleInput) titleInput.value = '';
  if (descInput) descInput.value = '';
  if (priorityInput) priorityInput.value = 'Normal';
  if (dueDateInput) dueDateInput.value = '';
}

/**
 * Render the list of tasks into the DOM, attaching edit and delete handlers.
 */
function renderTasks() {
  const listContainer = document.getElementById('task-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;

    const titleEl = document.createElement('h3');
    titleEl.textContent = task.title;
    taskItem.appendChild(titleEl);

    if (task.description) {
      const descEl = document.createElement('p');
      descEl.textContent = task.description;
      taskItem.appendChild(descEl);
    }

    const metaEl = document.createElement('p');
    metaEl.textContent = `Priority: ${task.priority}` + (task.dueDate ? ` | Due: ${task.dueDate.toLocaleDateString()}` : '');
    taskItem.appendChild(metaEl);

    // Completed checkbox
    const completedLabel = document.createElement('label');
    completedLabel.style.marginRight = '8px';
    const completedCheckbox = document.createElement('input');
    completedCheckbox.type = 'checkbox';
    completedCheckbox.checked = task.completed;
    completedCheckbox.addEventListener('change', () => {
      task.completed = completedCheckbox.checked;
      // Optionally add a visual style for completed tasks
      if (task.completed) {
        taskItem.style.textDecoration = 'line-through';
      } else {
        taskItem.style.textDecoration = 'none';
      }
    });
    completedLabel.appendChild(completedCheckbox);
    completedLabel.appendChild(document.createTextNode(' Completed'));
    taskItem.appendChild(completedLabel);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '4px';
    editBtn.addEventListener('click', () => {
      // Populate form fields with existing task data for editing
      const titleInput = document.getElementById('task-title');
      const descInput = document.getElementById('task-description');
      const priorityInput = document.getElementById('task-priority');
      const dueDateInput = document.getElementById('task-due-date');
      if (titleInput) titleInput.value = task.title;
      if (descInput) descInput.value = task.description;
      if (priorityInput) priorityInput.value = task.priority;
      if (dueDateInput) dueDateInput.value = task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';

      // Remove the task from the list; it will be re‑added on form submit (as an edit)
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    });
    taskItem.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    });
    taskItem.appendChild(deleteBtn);

    listContainer.appendChild(taskItem);
  });
}

/**
 * Authenticate a user against stored credentials.
 * If successful, stores the username in sessionStorage and reveals the task UI.
 * @param {string} username
 * @param {string} password
 * @returns {boolean} true if authentication succeeded, false otherwise.
 */
function authenticateUser(username, password) {
  // Retrieve stored users from localStorage (array of {username, password})
  const usersJSON = localStorage.getItem('users');
  const users = usersJSON ? JSON.parse(usersJSON) : [];

  const matchedUser = users.find(u => u.username === username && u.password === password);
  if (matchedUser) {
    // Store session information
    sessionStorage.setItem('loggedInUser', username);
    // Toggle UI visibility
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('task-section').style.display = 'block';
    return true;
  }
  return false;
}

/**
 * Register a new user. Stores credentials in localStorage.
 * @param {string} username
 * @param {string} password
 * @returns {boolean} true if registration succeeded, false if username already exists.
 */
function registerUser(username, password) {
  const usersJSON = localStorage.getItem('users');
  const users = usersJSON ? JSON.parse(usersJSON) : [];
  if (users.some(u => u.username === username)) {
    return false; // Username taken
  }
  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

// Event listeners for authentication forms and task form
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      if (authenticateUser(username, password)) {
        // Clear login fields
        loginForm.reset();
      } else {
        alert('Invalid username or password.');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value;
      if (registerUser(username, password)) {
        alert('Registration successful. You can now log in.');
        registerForm.reset();
      } else {
        alert('Username already exists. Choose a different one.');
      }
    });
  }

  // Task form handling (assumes a form with id "task-form")
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', createTask);
  }
});

// Function to initialize and populate weather sections
async function init() {
  try {
    const coords = await getLocation();
    const weatherData = await fetchWeatherData(coords.latitude, coords.longitude);
    document.getElementById('location').innerHTML = `
      ${weatherData.name}, ${weatherData.sys.country}
    `;
    document.getElementById('current-weather').innerHTML = `
      Temperature: ${weatherData.main.temp}°C
      Feels like: ${weatherData.main.feels_like}°C
      Humidity: ${weatherData.main.humidity}%
    `;
    const forecastData = await fetchForecastData(coords.latitude, coords.longitude);
    const forecastComponent = new ForecastComponent();
    forecastComponent.render(forecastData);
  } catch (error) {
    console.error('Error initializing weather:', error);
  }
}

// Call init function
init();
