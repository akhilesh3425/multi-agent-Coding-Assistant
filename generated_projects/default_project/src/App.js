import React, { useState } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Filter from './components/Filter';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');

    return (
        <div>
            <h1>Task Manager</h1>
            <TaskForm setTasks={setTasks} />
            <Filter setFilter={setFilter} />
            <TaskList tasks={tasks} filter={filter} />
        </div>
    );
};

export default App;
