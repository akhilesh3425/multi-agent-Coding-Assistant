import React, { useState } from 'react';

const TaskForm = () => {
    const [taskName, setTaskName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskName) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: taskName }),
            });
            if (response.ok) {
                // Handle success (e.g., clear input, show message)
                setTaskName('');
            } else {
                // Handle error
                console.error('Failed to create task');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="New Task"
            />
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;