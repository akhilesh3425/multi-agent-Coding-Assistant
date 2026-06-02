import React, { useEffect, useState } from 'react';
import TaskForm from './TaskForm';
import Filter from './Filter';

const TaskList = ({ onEdit, onDelete }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://api.example.com/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <Filter />
      <TaskForm />
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.name}
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;