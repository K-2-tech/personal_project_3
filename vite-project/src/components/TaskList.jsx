import React, { useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="task-section">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      <form onSubmit={handleSubmit} className="task-input-form mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="task-input"
        />
        <button type="submit" className="material-button">Add</button>
      </form>
      <ul className="task-list space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className={`task-item flex items-center p-2 rounded-lg hover:bg-black/5 transition-all cursor-pointer ${
              task.completed ? 'task-completed' : ''
            }`}
            onClick={() => toggleTask(task.id)}
          >
            <div className="flex items-center justify-center w-6 h-6 mr-3 relative">
              {task.completed ? (
                <CheckCircle2 
                  className="w-6 h-6 text-green-500 transition-all checkmark" 
                />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-green-500 transition-colors">
                  <Check className="w-4 h-4 text-transparent hover:text-gray-300 transition-colors" />
                </div>
              )}
            </div>
            <span 
              className={`task-text flex-1 transition-all duration-300 ${
                task.completed 
                  ? 'line-through text-gray-500 opacity-75' 
                  : 'text-gray-900'
              }`}
            >
              {task.text}
            </span>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
        <p className="text-gray-500 text-center mt-4">No tasks yet. Add some tasks to get started!</p>
      )}
    </div>
  );
};

export default TaskList;