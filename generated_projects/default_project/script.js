function initializeCalendar() {
    const calendarDiv = document.getElementById('calendar');
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();

    calendarDiv.innerHTML = ''; // Clear existing calendar

    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();
    // Get the total days in the month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Create calendar days
    for (let i = 0; i < firstDay; i++) {
        calendarDiv.innerHTML += '<div class="calendar-day empty"></div>';// Placeholder for days before the first
    }
    for (let day = 1; day <= totalDays; day++) {
        calendarDiv.innerHTML += `<div class="calendar-day">${day}</div>`;
    }
}

function addEventListeners() {
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(day => {
        day.addEventListener('click', (e) => {
            // Handle day click and any animations
            e.target.classList.toggle('selected');
        });
    });
}

async function loadReminders() {
    const response = await fetch('reminders.json');
    const reminders = await response.json();
    console.log(reminders); // Handle loaded reminders appropriately
}

function addTodo(todo, dueDate) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push({ todo, dueDate, completed: false });
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
}

function deleteTodo(index) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
}

function toggleCompleted(index) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos[index].completed = !todos[index].completed;
    localStorage.setItem('todos', JSON.stringify(todos));
    loadTodos();
}

function loadTodos() {
    const todoList = document.getElementById('todo-list');
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.textContent = `${todo.todo} - Due: ${todo.dueDate} ${todo.completed ? '(Completed)' : ''}`;
        todoItem.addEventListener('click', () => toggleCompleted(index));
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTodo(index);
        });
        todoItem.appendChild(deleteBtn);
        todoList.appendChild(todoItem);
    });
}

// Weather related code
const weatherApiKey = 'YOUR_API_KEY';
const weatherApiUrl = 'https://api.weatherapi.com/v1/current.json';
const temperatureChartData = [];
const precipitationChartData = [];

class WeatherChart {
    constructor(ctx) {
        this.ctx = ctx;
        this.chart = null;
    }

    render(data) {
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Weather Data',
                    data: data.values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

async function fetchWeatherData(location) {
    const response = await fetch(`${weatherApiUrl}?key=${weatherApiKey}&q=${location}`);
    const data = await response.json();
    processWeatherData(data);
}

function processWeatherData(data) {
    const temperature = data.current.temp_c;
    const precipitation = data.current.precip_mm;
    temperatureChartData.push(temperature);
    precipitationChartData.push(precipitation);
    const labels = temperatureChartData.map((_, index) => index + 1);

    const temperatureChart = new WeatherChart(document.getElementById('temperatureChart'));
    temperatureChart.render({ labels, values: temperatureChartData });

    const precipitationChart = new WeatherChart(document.getElementById('precipitationChart'));
    precipitationChart.render({ labels, values: precipitationChartData });
}

// Initialize weather dashboard
window.onload = async () => {
    initializeCalendar();
    addEventListeners();
    loadReminders();
    loadTodos();
    const location = 'London'; // Set default location for weather
    await fetchWeatherData(location);
};